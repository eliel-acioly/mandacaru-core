import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../utils/jwt';
import { AppError } from '../errors/AppError';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token missing.', 401);
  }

  // Formato: "Bearer eyJhbGci..."
  const [, token] = authHeader.split(' ');

  if (!token) {
    throw new AppError('Token malformatted.', 401);
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    throw new AppError('Invalid token.', 401);
  }

  // Injeção de Dependência na Requisição
  // Agora qualquer rota sabe quem é o usuário e qual a empresa dele!
  req.user = {
    id: decoded.id,
    role: decoded.role,
    tenantId: decoded.tenantId,
  };
  
  req.tenantId = decoded.tenantId;

  next();
};
