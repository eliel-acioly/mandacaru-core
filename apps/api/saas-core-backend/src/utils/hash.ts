import bcrypt from 'bcryptjs';

/**
 * Criptografa uma senha usando Salt.
 * @param payload Senha plana
 * @returns Hash da senha
 */
export const hashPassword = async (payload: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(payload, salt);
};

/**
 * Compara uma senha plana com um hash.
 * @param payload Senha plana (tentativa de login)
 * @param hashed Senha criptografada (do banco)
 */
export const comparePassword = async (payload: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(payload, hashed);
};
