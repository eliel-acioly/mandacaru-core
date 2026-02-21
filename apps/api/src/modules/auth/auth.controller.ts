import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  // Instanciamos o serviço como uma propriedade da classe
  private authService = new AuthService();

  // POST /api/auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Repassa o objeto inteiro (req.body) validado pelo Zod para o Service
      const result = await this.authService.registerTenant(req.body);

      // Devolve Status 201 (Criado) + Dados
      return res.status(201).json({ 
        status: 'success', 
        data: result 
      });
    } catch (error) {
      // Se der erro (ex: E-mail já existe), manda para o globalErrorMiddleware
      next(error);
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Repassa o objeto inteiro (req.body) para o Service
      const result = await this.authService.login(req.body);

      // Devolve Status 200 (OK) + Token
      return res.status(200).json({ 
        status: 'success', 
        data: result 
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/google
  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      // O frontend envia o token recebido do popup do Google
      const { googleToken } = req.body; 
      
      if (!googleToken) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Token do Google é obrigatório.' 
        });
      }

      // Chama a lógica de negócio que valida com os servidores do Google
      const result = await this.authService.loginWithGoogle(googleToken);

      // Devolve Status 200 (OK) + Token JWT da nossa aplicação
      return res.status(200).json({ 
        status: 'success', 
        data: result 
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/forgot-password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await this.authService.forgotPassword(email);
      
      return res.status(200).json({ 
        status: 'success', 
        message: result.message 
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/reset-password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await this.authService.resetPassword(token, newPassword);
      
      return res.status(200).json({ 
        status: 'success', 
        message: result.message 
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me (Rota Protegida para teste)
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      // Graças ao Middleware de Auth, o req.user e req.tenantId já existem aqui!
      return res.status(200).json({
        status: 'success',
        message: 'Autenticado com sucesso!',
        user: req.user,
        tenantId: req.tenantId
      });
    } catch (error) {
      next(error);
    }
  }
}
