import { z } from 'zod';

export const registerSchema = z.object({
  companyName: z.string().min(3, 'O nome da empresa deve ter pelo menos 3 letras.'),
  name: z.string().min(2, 'O nome deve ter pelo menos 2 letras.'),
  email: z.string().email('Formato de e-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

export const loginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

// 🔐 NOVOS SCHEMAS (Recuperação de Senha)
export const forgotPasswordSchema = z.object({
  email: z.string().email('Formato de e-mail inválido.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'O token de recuperação é obrigatório.'),
  newPassword: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres.'),
});

