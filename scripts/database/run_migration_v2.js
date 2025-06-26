const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
});

async function runMigrationV2() {
  try {
    console.log('🚀 Executando migração V2...\n');
    
    const sql = fs.readFileSync('./scripts/database/customer_migration_v2.sql', 'utf8');
    const result = await pool.query(sql);
    
    console.log('✅ Migração V2 executada com sucesso!');
    
    // Verificar tabelas adicionais criadas
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE 'customer_%' OR table_name LIKE 'email_%' OR table_name LIKE 'admin_%')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tabelas do sistema (' + tables.rows.length + '):');
    tables.rows.forEach(row => console.log('  ✅', row.table_name));
    
    // Verificar templates de email
    const templates = await pool.query('SELECT template_key, template_name FROM email_templates ORDER BY template_key');
    console.log('\n📧 Templates de email (' + templates.rows.length + '):');
    templates.rows.forEach(row => console.log('  ✅', row.template_key.padEnd(20), row.template_name));
    
    console.log('\n🎉 Sistema completo e pronto para testes!');
    
  } catch (error) {
    console.error('❌ Erro na migração V2:', error.message);
  } finally {
    await pool.end();
  }
}

runMigrationV2(); 