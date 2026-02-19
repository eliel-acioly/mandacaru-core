import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './modules/auth/auth.routes';
import { globalErrorMiddleware } from './shared/middlewares/error.middleware';

dotenv.config();

const app = express();

app.use(cors()); // Permite acesso externo (Frontend)
app.use(express.json()); // Permite receber JSON no body

// Rota Raiz (Health Check)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'SaaS Core API',
    database: 'PostgreSQL 🐘'
  });
});

// --- ROTAS DA API ---
// Tudo que chegar em /api/auth vai para o authRoutes
app.use('/api/auth', authRoutes);

// Middleware de Erro (SEMPRE POR ÚLTIMO)
app.use(globalErrorMiddleware);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
});

