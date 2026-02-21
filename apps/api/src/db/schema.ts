import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

// --- Tabela: Tenants (Empresas) ---
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Tabela: Users (Usuários) ---
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  
  // ⚠️ MUDANÇA 1: A senha não é mais .notNull()
  // Porque usuários do Google não terão senha salva com a gente.
  password: text('password'), 
  
  // 🌐 MUDANÇA 2: Gavetas para o Google Auth
  authProvider: text('auth_provider').default('LOCAL').notNull(), // Pode ser 'LOCAL' ou 'GOOGLE'
  providerId: text('provider_id'),                                // O ID numérico que o Google nos devolver

  role: text('role').default('OWNER'),
  
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow(),

  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  verificationToken: text('verification_token'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
});
