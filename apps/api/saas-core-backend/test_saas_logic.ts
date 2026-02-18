import { AuthService } from './src/modules/auth/auth.service';

async function test() {
  const auth = new AuthService();
  const random = Math.floor(Math.random() * 1000); // Evitar erro de email duplicado no teste

  console.log("--- 1. Testando Registro de SaaS ---");
  try {
    const result = await auth.registerTenant(
      `Empresa ${random}`,
      "Eliel Marcos",
      `eliel${random}@teste.com`,
      "123456"
    );
    console.log("✅ Registro Sucesso:", result);

    console.log("\n--- 2. Testando Login ---");
    const login = await auth.login(`eliel${random}@teste.com`, "123456");
    console.log("✅ Login Sucesso. Token:", login.token.substring(0, 20) + "...");
    console.log("Tenant ID no User:", login.user.tenantId);

  } catch (error: any) {
    console.error("❌ Erro:", error.message);
  }
}

test();
