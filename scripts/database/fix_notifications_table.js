const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
});

async function fixNotificationsTable() {
  try {
    console.log('🔧 Corrigindo tabela admin_notifications...\n');
    
    // Adicionar campos em falta
    await pool.query('ALTER TABLE admin_notifications ADD COLUMN IF NOT EXISTS action_text VARCHAR(100)');
    await pool.query('ALTER TABLE admin_notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP');
    
    console.log('✅ Campos adicionados com sucesso!\n');
    
    // Verificar estrutura atual
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'admin_notifications' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estrutura atual da tabela admin_notifications:');
    result.rows.forEach(row => {
      console.log('  ✅', row.column_name.padEnd(20), row.data_type.padEnd(25), row.column_default || 'NULL');
    });
    
    console.log('\n🎉 Correção concluída! A API agora deve funcionar.');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela:', error.message);
  } finally {
    await pool.end();
  }
}

fixNotificationsTable(); 