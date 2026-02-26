import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import { db } from '../../db';
import { users, tenants, memberships, plans, subscriptions } from '../../db/schema';
import { AppError } from '../../shared/errors/AppError';
import { EmailService } from '../../shared/services/email.service';

export class AuthService {
  private emailService = new EmailService();
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // =========================================================
  // 1. REGISTRO (Blindado: Não devolve JWT)
  // =========================================================
  async registerTenant(data: any) {
    const { companyName, name, email, password } = data;

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      throw new AppError('E-mail já está em uso.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 👤 1. Cria o Usuário (Nasce bloqueado: isEmailVerified: false)
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      authProvider: 'LOCAL',
      isEmailVerified: false, 
      verificationToken: verificationToken,
    }).returning();

    // 🏢 2. Cria a Empresa (Tenant)
    const [newTenant] = await db.insert(tenants).values({
      name: companyName,
      slug: companyName.toLowerCase().replace(/ /g, '-').concat(`-${crypto.randomBytes(4).toString('hex')}`),
    }).returning();

    // 🤝 3. Cria a ponte (Membership)
    const [newMembership] = await db.insert(memberships).values({
      userId: newUser.id,
      tenantId: newTenant.id,
      role: 'OWNER',
    }).returning();

    // 💰 4. Cria um Plano Básico Padrão
    const [defaultPlan] = await db.insert(plans).values({
      name: 'Plano Inicial (Free)',
      price: 0,
      features: { "routes": true, "pos": false }, 
    }).returning();

    await db.insert(subscriptions).values({
      tenantId: newTenant.id,
      planId: defaultPlan.id,
      status: 'TRIALING',
    });

    // ✉️ Dispara o e-mail de Boas-vindas com LOGS detalhados e await
    try {
      console.log(`✉️ [RESEND] A tentar enviar e-mail de verificação para: ${newUser.email}...`);
      
      await this.emailService.sendVerificationEmail(newUser.email, verificationToken);
      
      console.log(`🟢 [RESEND] E-mail enviado com sucesso para a caixa de: ${newUser.email}`);
    } catch (err: any) {
      console.error('🔴 [RESEND] Falha ao enviar o e-mail de verificação. Motivo:', err.response?.data || err.message || err);
    }

    // 🛑 A MÁGICA DA SEGURANÇA: Retorna apenas a confirmação, sem token!
    return {
      message: 'Conta criada com sucesso. Por favor, verifique seu e-mail para ativar o acesso.',
      user: {
        id: newUser.id,
        email: newUser.email,
      }
    };
  }

  // =========================================================
  // 2. LOGIN (Com Barreira de E-mail)
  // =========================================================
  async login(data: any) {
    const { email, password } = data;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user || !user.password) {
      throw new AppError('E-mail ou senha incorretos. (Se você usa o Google, clique em "Entrar com Google")', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    // 🛡️ A BARREIRA DE SEGURANÇA (Hard Block)
    if (!user.isEmailVerified) {
      throw new AppError('Sua conta ainda não foi ativada. Por favor, verifique sua caixa de entrada.', 403);
    }

    // 🔍 Busca as empresas que este usuário tem acesso
    const userMemberships = await db.select().from(memberships).where(eq(memberships.userId, user.id));
    
    if (userMemberships.length === 0 && !user.isSuperAdmin) {
      throw new AppError('Sua conta não possui acesso a nenhuma empresa.', 403);
    }

    const activeMembership = userMemberships[0];

    const token = jwt.sign(
      { 
        id: user.id, 
        isSuperAdmin: user.isSuperAdmin,
        role: activeMembership?.role || 'EMPLOYEE', 
        tenantId: activeMembership?.tenantId || null 
      },
      process.env.JWT_SECRET || 'secret_dev',
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: activeMembership?.role,
        tenantId: activeMembership?.tenantId,
        isSuperAdmin: user.isSuperAdmin
      },
      token,
    };
  }

  // =========================================================
  // 3. RECUPERAÇÃO DE SENHA
  // =========================================================
  async forgotPassword(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return { message: 'Se o e-mail existir, um link de recuperação foi enviado.' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 1);

    await db.update(users)
      .set({ resetPasswordToken: resetToken, resetPasswordExpires: expireDate })
      .where(eq(users.id, user.id));

    // ✉️ Logs detalhados para envio de recuperação de senha
    try {
      console.log(`✉️ [RESEND] A tentar enviar e-mail de recuperação para: ${user.email}...`);
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      console.log(`🟢 [RESEND] E-mail de recuperação enviado com sucesso para: ${user.email}`);
    } catch (err: any) {
      console.error('🔴 [RESEND] Falha ao enviar e-mail de recuperação. Motivo:', err.response?.data || err.message || err);
    }

    return { message: 'Se o e-mail existir, um link de recuperação foi enviado.' };
  }

  // =========================================================
  // 4. REDEFINIR SENHA
  // =========================================================
  async resetPassword(token: string, newPassword: string) {
    const [user] = await db.select().from(users).where(eq(users.resetPasswordToken, token));

    if (!user) throw new AppError('Token inválido ou expirado.', 400);
    if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
      throw new AppError('O token de recuperação expirou. Solicite um novo.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null })
      .where(eq(users.id, user.id));

    return { message: 'Senha redefinida com sucesso!' };
  }

  // =========================================================
  // 5. LOGIN COM GOOGLE (SSO)
  // =========================================================
  async loginWithGoogle(googleIdToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new AppError('Token do Google inválido ou sem e-mail.', 401);

    const { email, name, sub: googleId } = payload;

    const [existingUser] = await db.select().from(users).where(eq(users.email, email));
    let userToLogin = existingUser;
    let activeMembership;

    if (!existingUser) {
      const tenantName = `Workspace de ${name?.split(' ')[0] || 'Usuário'}`;
      
      const [newUser] = await db.insert(users).values({
        name: name || 'Usuário Google',
        email,
        authProvider: 'GOOGLE',
        providerId: googleId,
        isEmailVerified: true, // Google já vem verificado!
      }).returning();

      const [newTenant] = await db.insert(tenants).values({
        name: tenantName,
        slug: crypto.randomUUID(), 
      }).returning();

      const [newMembership] = await db.insert(memberships).values({
        userId: newUser.id,
        tenantId: newTenant.id,
        role: 'OWNER',
      }).returning();

      const [defaultPlan] = await db.insert(plans).values({
        name: 'Plano Inicial (Free)',
        price: 0,
      }).returning();

      await db.insert(subscriptions).values({
        tenantId: newTenant.id,
        planId: defaultPlan.id,
      });

      userToLogin = newUser;
      activeMembership = newMembership;
    } else {
      if (existingUser.authProvider === 'LOCAL') {
        const [updatedUser] = await db.update(users)
          .set({ authProvider: 'GOOGLE', providerId: googleId, isEmailVerified: true })
          .where(eq(users.id, existingUser.id))
          .returning();
        userToLogin = updatedUser;
      }
      const userMemberships = await db.select().from(memberships).where(eq(memberships.userId, userToLogin.id));
      activeMembership = userMemberships[0];
    }

    const token = jwt.sign(
      { 
        id: userToLogin.id, 
        isSuperAdmin: userToLogin.isSuperAdmin,
        role: activeMembership?.role || 'EMPLOYEE', 
        tenantId: activeMembership?.tenantId || null 
      },
      process.env.JWT_SECRET || 'secret_dev',
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: userToLogin.id,
        name: userToLogin.name,
        email: userToLogin.email,
        role: activeMembership?.role,
        tenantId: activeMembership?.tenantId,
      },
      token,
    };
  }

  // =========================================================
  // ✉️ 6. VERIFICAÇÃO DE E-MAIL (NOVO: Libera o acesso)
  // =========================================================
  async verifyEmail(token: string) {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));

    if (!user) {
      throw new AppError('Token de verificação inválido ou expirado.', 400);
    }

    if (user.isEmailVerified) {
      return { message: 'Este e-mail já foi verificado. Você já pode fazer login no sistema.' };
    }

    // 🔓 Destranca a conta e limpa o token de uso único
    await db.update(users)
      .set({
        isEmailVerified: true,
        verificationToken: null, 
      })
      .where(eq(users.id, user.id));

    return { message: 'E-mail verificado com sucesso! Você já tem acesso total à plataforma.' };
  }
}
