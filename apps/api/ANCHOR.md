Excelente iniciativa. Documentar o "caminho das pedras" é o que diferencia amadores de profissionais. O Termux é um ambiente poderoso, mas "hostil" para certas tecnologias. Ter esse manifesto vai te economizar horas no futuro.
Aqui está o novo ANCHOR.md definitivo, reescrito para refletir nossa arquitetura vitoriosa (PostgreSQL) e os aprendizados cruciais sobre o que não usar no Android.
Copie e substitua todo o conteúdo do seu arquivo atual:
# ⚓ ANCHOR: SaaS Core Backend (Mobile First / Termux)

## 📋 Sobre o Projeto
**Objetivo:** Backend Multi-tenant para SaaS (Vendixtech/FluxoOS).
**Ambiente:** Termux no Android (Arquitetura ARM64).
**Status:** ✅ FASE 4 Concluída (Lógica SaaS Pronta). ⏳ FASE 5 (API) em andamento.

---

## 🏆 Stack Tecnológico (A Escolha Sólida)
*Estas tecnologias foram validadas e funcionam 100% no Termux sem erros de compilação.*

| Componente | Tecnologia Escolhida | Por que escolhemos? |
| :--- | :--- | :--- |
| **Linguagem** | **TypeScript** | Segurança de tipos e intellisense. |
| **Runtime** | **Node.js** | Leve e compatível. |
| **Banco de Dados** | **PostgreSQL** | Instala via `pkg`, roda nativo e é padrão de mercado. |
| **Driver BD** | **pg (node-postgres)** | **Vital:** É 100% JavaScript. Não precisa de compilação C++. |
| **ORM** | **Drizzle ORM** | Moderno, leve e gera SQL otimizado para Postgres. |
| **Autenticação** | **JWT + bcryptjs** | `bcryptjs` é lento mas é JS puro (roda em tudo). |
| **API** | **Express 5** | Versão nova que lida nativamente com erros assíncronos. |

---

## 🧠 Base de Conhecimento: O que Aprendemos?
*Guia de sobrevivência para desenvolvimento no Android.*

### ❌ O que EVITAR (E por quê)
1.  **SQLite Nativo (`better-sqlite3`):**
    * **Erro:** `gyp: Undefined variable android_ndk_path`.
    * **Motivo:** Depende de compilação C++ (node-gyp). O Termux não possui o Android NDK configurado por padrão, gerando falhas de build infinitas.
2.  **Drivers de Nuvem (`@libsql/client`):**
    * **Erro:** Falta de binários pré-compilados para `android-arm64`.
3.  **Bcrypt Nativo (`bcrypt`):**
    * Mesmo problema do SQLite. Exige compilação. Use sempre `bcryptjs`.
4.  **Docker:**
    * Não roda nativamente no Termux (exige root/chroot complexo). O PostgreSQL nativo (`pkg install postgresql`) é muito superior em performance no celular.

### ✅ O Caminho do Sucesso (PostgreSQL)
1.  **Instalação:** `pkg install postgresql`
2.  **Inicialização:** `initdb` (apenas uma vez).
3.  **Start:** `pg_ctl -D $PREFIX/var/lib/postgresql start`
4.  **Driver:** Usar sempre `pg` (Pure JS) no `package.json`.

---

## 🛠️ Comandos Essenciais (Cheatsheet)

### Banco de Dados (Postgres no Termux)
```bash
# Iniciar o Servidor (Rodar sempre que abrir o Termux)
pg_ctl -D $PREFIX/var/lib/postgresql start

# Parar o Servidor
pg_ctl -D $PREFIX/var/lib/postgresql stop

# Entrar no Console SQL
psql -d saas_core

Desenvolvimento (Node.js)
# Rodar o Servidor (Watch Mode)
pnpm dev

# Gerar Migrações (Criar arquivos SQL baseados no Schema)
pnpm db:generate

# Aplicar Mudanças no Banco (Rodar o SQL)
pnpm db:push

# Testar Lógica de Negócio (Script Isolado)
pnpm ts-node-dev test_saas_logic.ts

🗺️ Roadmap e Progresso
✅ FASE 1: Fundação
 * Configuração TypeScript Strict, Express e Variáveis de Ambiente.
✅ FASE 2: Camada de Dados (PostgreSQL)
 * Migração de SQLite para Postgres concluída.
 * Schema Drizzle definido (Tenants + Users com UUID).
✅ FASE 3: Segurança
 * Hash de senha (bcryptjs).
 * Tokens JWT (Provider e Middleware).
✅ FASE 4: Arquitetura Multi-tenant
 * AuthService: Transação atômica (Cria Empresa + Dono juntos).
 * Relacionamentos: Foreign Keys funcionando (User -> Tenant).
⏳ FASE 5: API REST (Próximo Passo)
 * [ ] Criar Controllers (Auth).
 * [ ] Criar Rotas (Express Router).
 * [ ] Testar Endpoints via curl.
<!-- end list -->

---

### 👉 Próximo Passo Imediato
Estamos na **Fase 5**.
Já criamos o Controller e as Rotas. Agora precisamos **testar a API rodando** (`pnpm dev`) e fazendo uma requisição real via `curl` para garantir que o mundo exterior consegue falar com nosso sistema.


