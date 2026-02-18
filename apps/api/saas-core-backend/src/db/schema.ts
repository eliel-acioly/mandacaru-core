import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

// --- Tabela: Tenants (Empresas) ---
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey(), // UUID nativo do Postgres (muito eficiente)
  name: text('name').notNull(),
  slug: text('slug').unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(), // Data automática
});

// --- Tabela: Users (Usuários) ---
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('OWNER'),
  
  // Chave Estrangeira
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }), // Se apagar a empresa, apaga o usuário

  createdAt: timestamp('created_at').defaultNow(),
});

