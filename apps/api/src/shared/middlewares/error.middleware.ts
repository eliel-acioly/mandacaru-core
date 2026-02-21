import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';

export function globalErrorMiddleware(
  err: any, // Usamos 'any' aqui para o TypeScript permitir a leitura dinâmica
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Erros da nossa regra de negócio (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // 2. Erros de Validação (ZodError) - AGORA 100% BLINDADO
  if (err instanceof ZodError || err.name === 'ZodError') {
    // Busca a lista de erros não importa como o Zod a tenha nomeado na compilação
    const issueList = err.issues || err.errors || [];
    const errorMessage = issueList.length > 0 ? issueList[0].message : 'Dados fornecidos são inválidos.';

    return res.status(400).json({
      status: 'validation_error',
      message: errorMessage,
    });
  }

  // 3. Erros Críticos (Banco caiu, etc)
  console.error('❌ Erro Crítico:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor.',
  });
}
