import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validateData = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Tenta validar o Body da requisição com o Schema do Zod
      schema.parse(req.body);
      next(); // Se passou, deixa a requisição continuar para o Controller
    } catch (error) {
      next(error); // Se falhou, joga pro globalErrorMiddleware
    }
  };
};
