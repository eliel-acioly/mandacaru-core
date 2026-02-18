import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  role: string;
  tenantId: string;
}

const SECRET = process.env.JWT_SECRET || 'default_secret_unsafe';
const EXPIRES_IN = '1d';

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
};
