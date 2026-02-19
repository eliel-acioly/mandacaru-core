import { Request, Response } from 'express';
import { AuthService } from './auth.service';

// Instanciamos o serviço (a lógica pesada)
const authService = new AuthService();

export class AuthController {
  
  // POST /api/auth/register
  async register(req: Request, res: Response) {
    // Recebe dados do JSON enviado pelo Frontend
    const { companyName, name, email, password } = req.body;

    // Chama a lógica de negócio (Transação no Banco)
    const result = await authService.registerTenant(companyName, name, email, password);

    // Devolve Status 201 (Criado) + Dados
    return res.status(201).json(result);
  }

  // POST /api/auth/login
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Devolve Status 200 (OK) + Token
    return res.json(result);
  }

  // GET /api/auth/me (Rota Protegida para teste)
  async me(req: Request, res: Response) {
    // Graças ao Middleware, o req.user já existe aqui!
    return res.json({
      message: 'Autenticado com sucesso!',
      user: req.user,
      tenantId: req.tenantId
    });
  }
}
