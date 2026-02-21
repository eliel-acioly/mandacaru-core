import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import { db } from '../../db';
import { users, tenants } from '../../db/schema';
import { AppError } from '../../shared/errors/AppError';
import { EmailService } from '../../shared/services/email.service';

export class AuthService {
  // ✉️ Instanciamos o nosso carteiro (Resend)
  private emailService = new EmailService();

  // 🌐 Instanciamos o cliente do Google Auth
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // =========================================================
  // 1. REGISTRO (Criação de Empresa, Dono e Disparo de E-mail)
  // =========================================================
  async registerTenant(data: any) {
    const { companyName, name, email, password } = data;

    // 🛡️ Verifica se o e-mail já existe
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      throw new AppError('E-mail já está em uso.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🏢 Cria a Empresa (Tenant) FORÇANDO O ID
    const [newTenant] = await db.insert(tenants).values({
      id: crypto.randomUUID(),
      name: companyName,
      slug: companyName.toLowerCase().replace(/ /g, '-'),
    }).returning();

    // 🔐 Geração do Token de Verificação
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 👤 Cria o Usuário Dono FORÇANDO O ID
    const [newUser] = await db.insert(users).values({
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      authProvider: 'LOCAL',
      role: 'OWNER',
      tenantId: newTenant.id,
      isEmailVerified: false,
      verificationToken: verificationToken,
    }).returning();

    // ✉️ Dispara o e-mail de Boas-vindas/Confirmação silenciosamente
    this.emailService.sendVerificationEmail(newUser.email, verificationToken).catch((err) => {
      console.error('⚠️ Falha ao enviar e-mail de verificação:', err);
    });

    // 🎫 Gera o JWT de acesso normal
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, tenantId: newUser.tenantId },
      process.env.JWT_SECRET || 'secret_dev',
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
      },
      token,
    };
  }

  // =========================================================
  // 2. LOGIN (Autenticação Padrão)
  // =========================================================
  async login(data: any) {
    const { email, password } = data;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    // 🛡️ Regra de Segurança: Mensagem genérica para não dar dicas a invasores
    // Nova trava: Impede login comum se a conta foi criada EXCLUSIVAMENTE via Google
    if (!user || !user.password) {
      throw new AppError('E-mail ou senha incorretos. (Se você usa o Google, clique em "Entrar com Google")', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    // 🎫 Gera o JWT de acesso
    const token = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'secret_dev',
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      token,
    };
  }

  // =========================================================
  // 3. RECUPERAÇÃO DE SENHA (Esqueci minha senha)
  // =========================================================
  async forgotPassword(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    // 🛡️ Regra de Segurança
    if (!user) {
      return { message: 'Se o e-mail existir, um link de recuperação foi enviado.' };
    }

    // 🔐 Gera o token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 1);

    await db.update(users)
      .set({ 
        resetPasswordToken: resetToken, 
        resetPasswordExpires: expireDate 
      })
      .where(eq(users.id, user.id));

    this.emailService.sendPasswordResetEmail(user.email, resetToken).catch((err) => {
      console.error('⚠️ Falha ao enviar e-mail de recuperação:', err);
    });

    return { message: 'Se o e-mail existir, um link de recuperação foi enviado.' };
  }

  // =========================================================
  // 4. REDEFINIR SENHA (Clicou no link do e-mail)
  // =========================================================
  async resetPassword(token: string, newPassword: string) {
    const [user] = await db.select().from(users).where(eq(users.resetPasswordToken, token));

    if (!user) {
      throw new AppError('Token inválido ou expirado.', 400);
    }

    if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
      throw new AppError('O token de recuperação expirou. Solicite um novo.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(eq(users.id, user.id));

    return { message: 'Senha redefinida com sucesso!' };
  }

  // =========================================================
  // 5. LOGIN COM GOOGLE (SSO)
  // =========================================================
  async loginWithGoogle(googleIdToken: string) {
    // 1. O Backend bate na porta do Google e confirma a autenticidade
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Token do Google inválido ou sem e-mail.', 401);
    }

    const { email, name, sub: googleId } = payload;

    // 2. Procura se o usuário já existe
    const [existingUser] = await db.select().from(users).where(eq(users.email, email));
    let userToLogin = existingUser;

    // 3. Se NÃO existe, criamos a conta e a Empresa (Tenant)
    if (!existingUser) {
      const tenantName = `Workspace de ${name?.split(' ')[0] || 'Usuário'}`;
      
      const [newTenant] = await db.insert(tenants).values({
        id: crypto.randomUUID(),
        name: tenantName,
        slug: crypto.randomUUID(), 
      }).returning();

      const [newUser] = await db.insert(users).values({
        id: crypto.randomUUID(),
        name: name || 'Usuário Google',
        email,
        password: null, // Usuário Google não precisa de senha
        authProvider: 'GOOGLE',
        providerId: googleId,
        role: 'OWNER',
        tenantId: newTenant.id,
        isEmailVerified: true, 
      }).returning();

      userToLogin = newUser;
    } 
    // Se a conta já existia (com senha), atualizamos para permitir Google também
    else if (existingUser.authProvider === 'LOCAL') {
       const [updatedUser] = await db.update(users)
        .set({ authProvider: 'GOOGLE', providerId: googleId, isEmailVerified: true })
        .where(eq(users.id, existingUser.id))
        .returning();
        
       userToLogin = updatedUser;
    }

    // 4. Gera o Token JWT da nossa aplicação
    const token = jwt.sign(
      { id: userToLogin.id, role: userToLogin.role, tenantId: userToLogin.tenantId },
      process.env.JWT_SECRET || 'secret_dev',
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: userToLogin.id,
        name: userToLogin.name,
        email: userToLogin.email,
        role: userToLogin.role,
        tenantId: userToLogin.tenantId,
      },
      token,
    };
  }
}
