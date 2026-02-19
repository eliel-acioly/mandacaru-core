import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

const authRoutes = Router();
const controller = new AuthController();

// Rotas Públicas (Qualquer um acessa)
authRoutes.post('/register', controller.register.bind(controller));
authRoutes.post('/login', controller.login.bind(controller));

// Rota Privada (Só com Token)
authRoutes.get('/me', authMiddleware, controller.me.bind(controller));

export { authRoutes };
