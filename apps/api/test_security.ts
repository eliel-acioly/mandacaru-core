import { hashPassword, comparePassword } from './src/utils/hash';
import { generateToken, verifyToken } from './src/utils/jwt';

async function test() {
  console.log("--- Teste de Hash ---");
  const senha = "minha_senha_forte";
  const hash = await hashPassword(senha);
  console.log("Senha:", senha);
  console.log("Hash:", hash);

  const isMatch = await comparePassword(senha, hash);
  console.log("Senha bate com Hash?", isMatch);

  console.log("\n--- Teste de JWT ---");
  const token = generateToken({ id: '123', role: 'ADMIN', tenantId: 'tenant-01' });
  console.log("Token gerado:", token);

  const decoded = verifyToken(token);
  console.log("Decodificado:", decoded);
}

test();
