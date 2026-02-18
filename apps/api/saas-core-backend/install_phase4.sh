#!/bin/bash

set -e

echo "🏢 INICIANDO FASE 4: MULTI-TENANT ARCHITECTURE"
echo "-----------------------------------------------"

# 1. Definição de Tipos (Express + User)
# O TypeScript precisa saber que vamos injetar 'user' e 'tenantId' na requisição.
echo "📝 Criando definições de tipo (src/@types/express.d.ts)..."
mkdir -p src/@types

cat << 'EOF' > src/@types/express.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        tenantId: string;
      };
      tenantId?: string;
    }
  }
}
EOF

# 2. Criar AuthService (A lógica pesada)
echo "📝 Criando AuthService (src/modules/auth/auth.service.ts)..."
mkdir -p src/modules/auth

cat << 'EOF' > src/modules/auth/auth.service.ts
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { tenants, users } from '../../db/schema';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import { AppError } from '../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid'; // Vamos instalar isso já já

export class AuthService {
  /**
   * Registra um novo Tenant e seu Usuário Dono (Transação Atômica).
   */
  async registerTenant(companyName: string, name: string, email: string, pass: string) {
    // 1. Verificar se email já existe (Globalmente)
    // O Drizzle retorna um array, pegamos o primeiro item.
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    
    if (existingUser) {
      throw new AppError('Email already in use.');
    }

    const hashedPassword = await hashPassword(pass);
    const tenantId = uuidv4();
    const userId = uuidv4();

    // 2. Transação: Cria Tenant + User
    try {
      await db.transaction(async (tx) => {
        // Passo A: Criar Tenant
        await tx.insert(tenants).values({
          id: tenantId,
          name: companyName,
          slug: companyName.toLowerCase().replace(/ /g, '-'), // Slug simples
          isActive: true,
        });

        // Passo B: Criar Usuário vinculado
        await tx.insert(users).values({
          id: userId,
          name,
          email,
          password: hashedPassword,
          role: 'OWNER',
          tenantId: tenantId, // O vínculo mágico
        });
      });
    } catch (error) {
      console.error('Transaction Error:', error);
      throw new AppError('Failed to create account. Please try again.', 500);
    }

    // Retornamos o usuário criado (sem senha)
    return { 
      tenant: { id: tenantId, name: companyName },
      user: { id: userId, name, email, role: 'OWNER' }
    };
  }

  /**
   * Login: Retorna User + Token com TenantID embutido.
   */
  async login(email: string, pass: string) {
    const user = await db.select().from(users).where(eq(users.email, email)).get();

    if (!user) throw new AppError('Invalid credentials.', 401);

    const isMatch = await comparePassword(pass, user.password);
    if (!isMatch) throw new AppError('Invalid credentials.', 401);

    // Gerar Token blindado
    const token = generateToken({
      id: user.id,
      role: user.role || 'MEMBER',
      tenantId: user.tenantId
    });

    // Remover senha do retorno
    const { password, ...safeUser } = user;

    return { user: safeUser, token };
  }
}
EOF

# 3. Criar Middleware de Autenticação (O Porteiro)
echo "📝 Criando Middleware de Auth (src/shared/middlewares/auth.middleware.ts)..."
cat << 'EOF' > src/shared/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../utils/jwt';
import { AppError } from '../errors/AppError';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token missing.', 401);
  }

  // Formato: "Bearer eyJhbGci..."
  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AppError('Token malformatted.', 401);
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    throw new AppError('Invalid token.', 401);
  }

  // Injeção de Dependência na Requisição
  // Agora qualquer rota sabe quem é o usuário e qual a empresa dele!
  req.user = {
    id: decoded.id,
    role: decoded.role,
    tenantId: decoded.tenantId,
  };
  
  req.tenantId = decoded.tenantId;

  next();
};
EOF

# 4. Instalar UUID (Necessário para gerar IDs no código)
echo "📦 Instalando UUID..."
pnpm add uuid
pnpm add -D @types/uuid

echo ""
echo "✅ FASE 4 CONCLUÍDA!"
echo "👉 AuthService pronto (Transações Atômicas)."
echo "👉 AuthMiddleware pronto (Proteção de Rotas)."
