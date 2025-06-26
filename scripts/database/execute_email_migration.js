const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function executeEmailMigration() {
  try {
    console.log('🚀 Iniciando migração de tabelas de email...');
    
    const sqlContent = fs.readFileSync(
      path.join(__dirname, 'add_email_tables.sql'), 
      'utf8'
    );
    
    console.log('📄 Executando script SQL...');
    const result = await pool.query(sqlContent);
    
    // Mostrar resultado da verificação final se houver
    if (result && result.length > 0) {
      const lastResult = result[result.length - 1];
      if (lastResult.rows) {
        console.log('\n✅ Verificação final:');
        lastResult.rows.forEach(row => {
          console.log(`   ${row.tabela}: ${row.registos} registos`);
        });
      }
    }
    
    console.log('\n🎉 Migração de email concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executeEmailMigration();
}

module.exports = { executeEmailMigration }; 