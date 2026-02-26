import { sql } from 'drizzle-orm';
import { db } from './db'; // Ajuste o caminho se a sua pasta db estiver em outro lugar

async function clearDatabase() {
  console.log('🧹 Iniciando a limpeza do banco de dados...');

  try {
    // O comando TRUNCATE com CASCADE apaga todos os registros de todas as tabelas interligadas
    // e zera os IDs sem deletar a estrutura das tabelas.
    await db.execute(sql`TRUNCATE TABLE users, tenants, memberships, plans, subscriptions CASCADE;`);
    
    console.log('✅ Banco de dados limpo com sucesso! Pronto para novos testes.');
  } catch (error) {
    console.error('🔴 Erro ao limpar o banco de dados:', error);
  } finally {
    process.exit(0); // Encerra o script
  }
}

clearDatabase();
