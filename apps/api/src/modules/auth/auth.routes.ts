import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { validateData } from '../../shared/middlewares/validate.middleware';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from './auth.schema';

const authRoutes = Router();
const controller = new AuthController();

// Rotas Públicas (Com Validação Zod)
authRoutes.post('/register', validateData(registerSchema), controller.register.bind(controller));
authRoutes.post('/login', validateData(loginSchema), controller.login.bind(controller));
authRoutes.post('/google', controller.googleLogin.bind(controller));


// 🚑 AS ROTAS NOVAS PRECISAM ESTAR AQUI:
authRoutes.post('/forgot-password', validateData(forgotPasswordSchema), controller.forgotPassword.bind(controller));
authRoutes.post('/reset-password', validateData(resetPasswordSchema), controller.resetPassword.bind(controller));

// Rota Privada
authRoutes.get('/me', authMiddleware, controller.me.bind(controller));

export { authRoutes };

