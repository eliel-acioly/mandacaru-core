# 🌵 Mandacaru Core — Arquitetura SaaS Resiliente e Segura

> "Onde sistemas frágeis falham, o Mandacaru floresce."

### 🏷️ Status do Projeto
![Production Ready](https://img.shields.io/badge/Pronto_para-Produção-success?style=for-the-badge&logo=vercel)
![SaaS Boilerplate](https://img.shields.io/badge/SaaS-Boilerplate-blue?style=for-the-badge&logo=nextdotjs)
![Security Hardened](https://img.shields.io/badge/Segurança-Nível_Enterprise-red?style=for-the-badge&logo=shield)
![Made in Brazil](https://img.shields.io/badge/Feito_no-Brasil-green?style=for-the-badge&logo=brazil)

### 📊 Estatísticas do Repositório
![Stars](https://img.shields.io/github/stars/eliel-acioly/mandacaru-core?style=for-the-badge)
![Forks](https://img.shields.io/github/forks/eliel-acioly/mandacaru-core?style=for-the-badge)
![Issues](https://img.shields.io/github/issues/eliel-acioly/mandacaru-core?style=for-the-badge)
![Last Commit](https://img.shields.io/github/last-commit/eliel-acioly/mandacaru-core?style=for-the-badge)

---

## 🧠 O Que é o Mandacaru Core?

O **Mandacaru Core** é uma arquitetura SaaS Full-Stack *Production-Ready*, criada para eliminar semanas de configuração repetitiva e permitir que desenvolvedores foquem imediatamente na regra de negócio.

Ele foi projetado seguindo rigorosamente a **Tríade CID** da Segurança da Informação:
* **🔐 Confidencialidade**
* **🗄️ Integridade**
* **⚡ Disponibilidade**

É um ecossistema resiliente, escalável e *multitenant* para aplicações modernas B2B e B2C.

---

## 🎯 Objetivos do Projeto

* ✔️ Reduzir drasticamente o tempo de setup inicial.
* ✔️ Garantir segurança de nível enterprise desde o primeiro commit.
* ✔️ Oferecer uma base SaaS pronta para monetização e produção.
* ✔️ Facilitar a escalabilidade com isolamento *multi-tenant*.

---

## ⚡ Principais Recursos

### 🛡️ Segurança Nativa (Tríade CID)
* **Confidencialidade:** JWT Stateless, Google OAuth SSO e Hash bcrypt seguro.
* **Integridade:** PostgreSQL acoplado ao Drizzle ORM, isolamento real por `tenant_id` e validação rigorosa de rotas com Zod.
* **Disponibilidade:** Backend Node.js escalável, arquitetura tolerante a falhas e pronta para ambientes *cloud/serverless*.

### 🏢 Multitenancy Real
* Isolamento absoluto de dados entre clientes/empresas.
* Estrutura nativamente preparada para o modelo SaaS B2B.
* Escalabilidade horizontal simplificada.

### 🎨 UI/UX Premium
* Desenvolvido com **Next.js (App Router)**.
* Uso de **CSS Modules puro** (sem frameworks pesados).
* **Design System OKLCH** garantindo consistência em temas Light/Dark.
* **Glassmorphism** performático e acelerado por hardware.

---

## 🛠️ Stack Tecnológica

**Backend:**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white) 
* Drizzle ORM
* Validação Zod
* Google Auth Library

**Frontend:**
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) ![CSS Modules](https://img.shields.io/badge/CSS_Modules-1572B6?style=for-the-badge&logo=css3&logoColor=white)
* Context API
* Axios

---

## 🏗️ Estrutura do Projeto

```text
mandacaru-core/
├── apps/
│   ├── api/   → Backend Node.js (Express, PG, Drizzle)
│   └── web/   → Frontend Next.js (App Router, CSS Modules)
├── package.json
└── README.md

⚡ Por que usar o Mandacaru Core?
| Problema Comum em Startups | A Solução Mandacaru |
|---|---|
| Semanas configurando autenticação | Sistema pronto para uso no primeiro dia. |
| Vazamento de dados entre clientes | Multitenancy real e blindado no banco de dados. |
| Setup visual demorado e pesado | Design System pronto, moderno e de alta performance. |
| Arquitetura frágil e insegura | Segurança CID integrada de ponta a ponta. |
🚀 Quick Start
1️⃣ Clonar Projeto
git clone [https://github.com/eliel-acioly/mandacaru-core.git](https://github.com/eliel-acioly/mandacaru-core.git) meu-saas
cd meu-saas

2️⃣ Instalar Dependências
pnpm install

3️⃣ Configurar Variáveis de Ambiente
Copie os arquivos de exemplo e preencha com suas credenciais (Google Client ID, JWT Secret, URL do Banco):
Backend:
cp apps/api/.env.example apps/api/.env

Frontend:
cp apps/web/.env.example apps/web/.env.local

4️⃣ Preparar Banco de Dados
cd apps/api
pnpm db:push

5️⃣ Rodar o Projeto
Na raiz do monorepo, inicie os serviços:
pnpm dev

 * Frontend: http://localhost:3000
 * Backend: http://localhost:3001
🌵 Manifesto do Projeto
Este projeto foi forjado sob o sol do Nordeste brasileiro, em Arapiraca — Alagoas.
Assim como o cacto Mandacaru:
 * Cresce e prospera onde sistemas frágeis falham.
 * Resiste a ambientes adversos.
 * Mantém alta performance com eficiência.
Ele representa a ideia de que tecnologia de nível mundial pode — e deve — nascer em qualquer lugar.
👨‍💻 Autor
Eliel Acioly Desenvolvedor Fullstack & Arquiteto de Sistemas SaaS
Especializado em:
*Nextjs 
 * Automação de ambientes e Developer Experience (DX).
 * Infraestrutura leve e de alta performance.
 * Arquiteturas multi-tenant seguras.
⭐ Apoie o Projeto
Se a arquitetura deste projeto economizou o seu tempo e te ajudou a construir a sua aplicação:
 * ⭐ Deixe uma estrela no repositório.
 * 🍴 Faça um fork e construa algo incrível.
 * 📢 Compartilhe com outros desenvolvedores.
<!-- end list -->