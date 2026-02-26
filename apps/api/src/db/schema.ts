import { 
  pgTable, 
  text, 
  boolean, 
  timestamp, 
  uuid, 
  pgEnum, 
  jsonb, 
  integer 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =======================================================
// 1. ENUMS (Valores fixos de segurança e regras de negócio)
// =======================================================
export const roleEnum = pgEnum('role', ['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED']);

// =======================================================
// 2. TABELAS CENTRAIS (Identidade e Multitenancy)
// =======================================================

// --- Tabela: Tenants (Empresas) ---
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  document: text('document'), // NOVO: CNPJ ou CPF para a empresa
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Tabela: Users (Usuários) ---
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  
  // 🌐 Gavetas para o Google Auth e Login Local
  password: text('password'), 
  authProvider: text('auth_provider').default('LOCAL').notNull(),
  providerId: text('provider_id'),

  // 👑 Pilar 2: O God Mode (Acesso total para o Dono do SaaS)
  isSuperAdmin: boolean('is_super_admin').default(false).notNull(),

  // 🛡️ Segurança e Recuperação
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  verificationToken: text('verification_token'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
  
  createdAt: timestamp('created_at').defaultNow(),
});
// ⚠️ NOTA: tenantId e role foram REMOVIDOS daqui. A mágica agora acontece na tabela abaixo.

// --- Tabela: Memberships (A Ponte Usuário <-> Empresa) ---
// 🏢 Pilar 1: O Mundo do Cliente
export const memberships = pgTable('memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  
  // O Cargo do usuário especificamente DENTRO deste tenant
  role: roleEnum('role').default('EMPLOYEE').notNull(),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// =======================================================
// 3. TABELAS DE MONETIZAÇÃO E PRODUTOS (Gating)
// =======================================================

// --- Tabela: Plans (Planos do SaaS) ---
export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // Ex: "Vendixtech Pro", "AutoVision"
  price: integer('price').notNull(), // Preço em centavos (ex: 9900 = R$ 99,00)
  
  // 🧩 Pilar 3: O Ecossistema Multi-Produto
  // JSONB guarda as flags: { "routes": true, "max_vehicles": 10, "pos": false }
  features: jsonb('features').notNull().default({}), 
  
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Tabela: Subscriptions (Assinaturas das Empresas) ---
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'restrict' }),
  
  status: subscriptionStatusEnum('status').default('TRIALING').notNull(),
  expiresAt: timestamp('expires_at'), // Data de vencimento da fatura
  
  createdAt: timestamp('created_at').defaultNow(),
});

// =======================================================
// 4. RELACIONAMENTOS (Para as queries do Drizzle ficarem limpas)
// =======================================================

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  memberships: many(memberships),
  subscriptions: many(subscriptions),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  tenant: one(tenants, { fields: [memberships.tenantId], references: [tenants.id] }),
}));
