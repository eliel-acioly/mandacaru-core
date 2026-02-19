import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db';
import { tenants, users } from '../../db/schema'; // Importa as tabelas do Postgres
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import { AppError } from '../../shared/errors/AppError';

export class AuthService {
  /**
   * Registra um novo Tenant (Empresa) e seu Usuário Dono (Owner).
   * Usa transação para garantir integridade: ou cria tudo, ou nada.
   */
  async registerTenant(companyName: string, name: string, email: string, pass: string) {
    // 1. Verificar se email já existe (Globalmente)
    // O Drizzle retorna um array no .execute(), pegamos o primeiro item.
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((res) => res[0]); // Pega o primeiro resultado ou undefined
    
    if (existingUser) {
      throw new AppError('Email already in use.');
    }

    const hashedPassword = await hashPassword(pass);
    
    // Geramos os IDs aqui para criar o vínculo
    const tenantId = uuidv4();
    const userId = uuidv4();

    // 2. Transação Atômica (PostgreSQL)
    try {
      // Usamos 'any' no tx para evitar conflitos de tipagem estrita do TS no Termux
      await db.transaction(async (tx: any) => {
        // Passo A: Criar Tenant (Empresa)
        await tx.insert(tenants).values({
          id: tenantId,
          name: companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, '-'), // Slug simples
          isActive: true,
        });

        // Passo B: Criar Usuário vinculado ao Tenant
        await tx.insert(users).values({
          id: userId,
          name,
          email,
          password: hashedPassword,
          role: 'OWNER',
          tenantId: tenantId, // Aqui está o vínculo chave estrangeira
        });
      });
    } catch (error) {
      console.error('Transaction Error:', error);
      throw new AppError('Failed to create account. Please try again.', 500);
    }

    // Retorno de sucesso (sem a senha)
    return { 
      tenant: { id: tenantId, name: companyName },
      user: { id: userId, name, email, role: 'OWNER' }
    };
  }

  /**
   * Login: Retorna User + Token com TenantID embutido.
   */
  async login(email: string, pass: string) {
    // Busca usuário pelo email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((res) => res[0]);

    if (!user) throw new AppError('Invalid credentials.', 401);

    // Verifica senha
    const isMatch = await comparePassword(pass, user.password);
    if (!isMatch) throw new AppError('Invalid credentials.', 401);

    // Gerar Token JWT com dados do Tenant
    const token = generateToken({
      id: user.id,
      role: user.role || 'MEMBER',
      tenantId: user.tenantId // O Frontend vai usar isso para saber qual dados carregar
    });

    // Remover senha do retorno para segurança
    const { password, ...safeUser } = user;

    return { user: safeUser, token };
  }
}

