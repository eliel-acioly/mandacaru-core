#!/bin/bash

set -e

echo "🔧 INICIANDO CORREÇÃO FINAL DE BANCO DE DADOS (Termux Native)"
echo "-----------------------------------------------------------"

# 1. Limpeza
echo "🧹 Removendo drivers anteriores..."
pnpm remove @libsql/client drizzle-orm
rm -rf node_modules
rm -f saas_core.db
rm -f pnpm-lock.yaml

# 2. Configurar Variáveis de Compilação (O Segredo do Termux)
# Isso diz ao node-gyp: "Use o Clang padrão, não procure o Android NDK"
export GYP_DEFINES="OS=linux"
export CXX=clang++
export CC=clang
export PYTHON=python3

echo "📦 Instalando better-sqlite3 (Compilando do zero)..."
# Reinstala dependências gerais
pnpm install

# Instala o driver forçando o build
pnpm add better-sqlite3 --build-from-source
pnpm add drizzle-orm
pnpm add -D @types/better-sqlite3 drizzle-kit

# 3. Reescrever Configuração do Banco (Voltar para better-sqlite3)
echo "📝 Atualizando src/db/index.ts..."
cat << 'EOF' > src/db/index.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Configuração simples e robusta para arquivo local
const sqlite = new Database('saas_core.db');
export const db = drizzle(sqlite, { schema });
EOF

# 4. Ajustar Drizzle Config
echo "⚙️ Atualizando drizzle.config.ts..."
cat << 'EOF' > drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'saas_core.db',
  },
  verbose: true,
  strict: true,
});
EOF

# 5. Teste de Fogo
echo "🚀 Gerando Banco de Dados..."
pnpm db:generate
pnpm db:push

echo ""
echo "✅ CORREÇÃO APLICADA!"
echo "👉 Driver: better-sqlite3 (Nativo)"
echo "👉 Arquivo: saas_core.db (Recriado)"
