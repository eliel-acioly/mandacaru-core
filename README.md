# 🌵 Mandacaru Core — Arquitetura SaaS Resiliente e Segura

> "Onde sistemas frágeis falham, o Mandacaru floresce."

---
![Production Ready](https://img.shields.io/badge/Pronto_para-Produção-success?style=for-the-badge&logo=vercel)
![SaaS Boilerplate](https://img.shields.io/badge/SaaS-Boilerplate-blue?style=for-the-badge&logo=nextdotjs)
![Security Hardened](https://img.shields.io/badge/Segurança-Nível_Enterprise-red?style=for-the-badge&logo=shield)
![Made in Brazil](https://img.shields.io/badge/Feito_no-Brasil-green?style=for-the-badge&logo=brazil)

---
![Stars](https://img.shields.io/github/stars/eliel-acioly/mandacaru-core?style=for-the-badge)
![Forks](https://img.shields.io/github/forks/eliel-acioly/mandacaru-core?style=for-the-badge)
![Issues](https://img.shields.io/github/issues/eliel-acioly/mandacaru-core?style=for-the-badge)
![Last Commit](https://img.shields.io/github/last-commit/eliel-acioly/mandacaru-core?style=for-the-badge)

---
![JWT Auth](https://img.shields.io/badge/Auth-JWT_&_Google_SSO-orange?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/Banco_de_Dados-PostgreSQL-blue?style=for-the-badge&logo=postgresql)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=nextdotjs)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)
---

## 🌎 Sobre o Projeto

O **Mandacaru Core** é um boilerplate Full-Stack SaaS pronto para produção. Ele foi idealizado para ser a "joia da coroa" do meu portfólio, construído com o rigor de uma tese de engenharia, mas com foco prático: **eliminar semanas de configuração repetitiva e transformar esse tempo em minutos de resultados reais para desenvolvedores e empreendedores.**

Projetado com um compromisso inabalável com a Segurança da Informação, esta arquitetura segue estritamente a **Tríade CID (Confidencialidade, Integridade e Disponibilidade)**. É um ecossistema altamente resiliente, escalável e isolado para a construção de aplicações B2B e B2C modernas.

Foco do projeto:
* ⚡ **Desenvolvimento Ágil:** Um fluxo de automação pronto para uso que reduz o código boilerplate e acelera drasticamente o *time-to-market*.
* 🛡️ **Segurança Consistente:** Proteções integradas contra vulnerabilidades comuns, vazamento de dados e acessos não autorizados.
* 💎 **UI/UX de Alta Performance:** Renderização acelerada com temas Claro/Escuro dinâmicos, usando o moderno padrão de cores **OKLCH** e *Glassmorphism*, dispensando frameworks pesados.
* 🏢 **Multitenancy Nativo:** Uma camada de dados robusta e pronta para isolar e escalar múltiplos negócios simultaneamente.

---

## 🛡️ Superando Desafios: O Padrão CID na Prática

A construção de um SaaS seguro exige a solução de problemas complexos. O Mandacaru Core entrega isso de forma nativa:

1. **Confidencialidade:** * Hash de senhas blindado usando `bcryptjs` com alto custo de processamento.
   * Integração oficial com **Google OAuth 2.0** para Single Sign-On (SSO) sem fricção.
   * Sessões JWT (Stateless) com expiração controlada para evitar sequestro de conta.
2. **Integridade:** * Segurança de tipagem de ponta a ponta com **TypeScript** e validação rigorosa de rotas usando **Zod**.
   * Banco de dados relacional sólido (**PostgreSQL** + **Drizzle ORM**), garantindo o isolamento absoluto de dados entre clientes via chaves estrangeiras (`tenant_id`).
3. **Disponibilidade:** * Arquitetura Node.js leve e tolerante a falhas, pronta para ser escalada horizontalmente ou hospedada em ambientes *serverless* sem queda de desempenho.

---

## 🏗️ Estrutura do Monorepo

```text
mandacaru-core/
├── apps/
│   ├── api/   → Node.js + Express + PostgreSQL + Drizzle ORM
│   └── web/   → Next.js (App Router) + Pure CSS Modules (OKLCH)
├── package.json (Gerenciado via pnpm)
└── README.md

🛠️ Stack Tecnológica
Backend
 * Node.js & Express: O motor rápido e direto ao ponto.
 * PostgreSQL & Drizzle ORM: A combinação definitiva para modelagem de dados relacional tipada.
 * Motor de Autenticação: Estratégia JWT customizada combinada com google-auth-library.
 * Zod: Barreira de proteção contra dados maliciosos.
Frontend
 * Next.js (App Router): O framework React de última geração.
 * Pure CSS Modules & OKLCH: Layout limpo e moderno (Glassmorphism), substituindo o Tailwind por uma abordagem mais purista, performática e fácil de manter.
 * React Google OAuth: Integração oficial para popups de login nativos.
 * Axios & Context API: Gerenciamento global de estado de autenticação.
⚡ Por que usar o Mandacaru Core?
| Problema Comum em Startups | A Solução Mandacaru |
|---|---|
| Semanas configurando o básico | Comece a programar a sua regra de negócio no 1º dia. |
| Vazamento de dados entre clientes | Isolamento nativo de tenant_id blindado no banco de dados. |
| Temas visuais inconsistentes | Design System centralizado em CSS Puro usando variáveis OKLCH. |
| Autenticação complexa | Fluxos prontos: Login, Cadastro, Recuperação de Senha e Google SSO. |
🌵 Manifesto — A Alma do Projeto
Este projeto foi forjado sob o sol do nordeste brasileiro, em Arapiraca — Agreste Alagoano.
Assim como o cacto Mandacaru:
Ele cresce e prospera onde sistemas frágeis não sobrevivem.
Ele exige raízes profundas e resilientes para sustentar alta performance.
O Mandacaru Core representa a capacidade de extrair a máxima eficiência da engenharia de software. O sol não seca as boas ideias, e a dificuldade não para o progresso. Cada linha de código deste repositório é um passo em direção à independência tecnológica de quem for utilizá-lo.
👨‍💻 Autor
Eliel Acioly — Especialista em Desenvolvimento de Soluções Ágeis e Seguras.
Construído como a joia do meu portfólio de engenharia de software, este repositório é a prova viva de que tecnologia de nível mundial, arquitetura limpa e padrões de segurança complexos podem nascer em qualquer lugar.
> "Especializado em arquitetar sistemas escaláveis e resilientes que respeitam os mais altos padrões de integridade de dados e experiência do usuário."
> 
⭐ Apoie o Projeto
Se este fluxo de automação ajudou você a economizar tempo, reduzir código e lançar o seu SaaS mais rapidamente, apoie a resiliência do código aberto:
 * Deixe uma ⭐ neste repositório.
 * Faça um Fork e construa o seu próximo grande projeto.
 * Compartilhe com a comunidade.
<!-- end list -->