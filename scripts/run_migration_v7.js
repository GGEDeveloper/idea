require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrationV7() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔄 Executando migração V7 - Update order status constraint...');
    
    // Ler o ficheiro SQL da migração
    const migrationPath = path.join(__dirname, '..', 'db', 'migrations', 'V7__update_order_status_constraint.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar a migração
    const result = await pool.query(migrationSQL);
    
    console.log('✅ Migração V7 executada com sucesso!');
    console.log('📊 Constraint orders_order_status_check atualizada para 11 estados');
    console.log('🚀 Sistema de gestão de encomendas pronto para usar!');
    
  } catch (error) {
    console.error('❌ Erro ao executar migração V7:', error.message);
    if (error.code === '23514') {
      console.log('💡 Nota: Se o erro for sobre constraint, pode já estar aplicada');
    }
  } finally {
    await pool.end();
  }
}

// Executar migração
runMigrationV7(); 