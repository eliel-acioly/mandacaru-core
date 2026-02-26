import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  private authService = new AuthService();

  // POST /api/auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.registerTenant(req.body);

      return res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error("🔴 [BACKEND - REGISTER] Falha no registro:", error);
      next(error);
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.login(req.body);

      return res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error("🔴 [BACKEND - LOGIN] Falha no login:", error);
      next(error);
    }
  }

  // POST /api/auth/google
  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { googleToken } = req.body;

      if (!googleToken) {
        return res.status(400).json({
          status: 'error',
          message: 'Token do Google é obrigatório.'
        });
      }

      const result = await this.authService.loginWithGoogle(googleToken);

      return res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error("🔴 [BACKEND - GOOGLE] Falha crítica no Google Login:", error);
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
      console.error("🔴 [BACKEND - FORGOT PASSWORD] Falha na recuperação de senha:", error);
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
      console.error("🔴 [BACKEND - RESET PASSWORD] Falha na redefinição de senha:", error);
      next(error);
    }
  }

  // ✉️ POST /api/auth/verify-email
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await this.authService.verifyEmail(token);

      return res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
       console.error("🔴 [BACKEND - VERIFY EMAIL] Falha na verificação:", error);
      next(error);
    }
  }

  // GET /api/auth/me (Rota Protegida para teste)
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({
        status: 'success',
        message: 'Autenticado com sucesso!',
        user: req.user,
        tenantId: req.tenantId
      });
    } catch (error) {
      console.error("🔴 [BACKEND - ME] Falha ao buscar dados do usuário:", error);
      next(error);
    }
  }
}
