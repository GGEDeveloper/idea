const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
});

async function verifyMigration() {
  try {
    console.log('🔍 Verificando migração da base de dados...\n');
    
    // Verificar tabelas criadas
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE 'customer_%' OR table_name LIKE 'email_%' OR table_name LIKE 'admin_%')
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas criadas (' + tables.rows.length + '):');
    tables.rows.forEach(row => console.log('  ✅', row.table_name));
    
    // Verificar novos campos na tabela users
    const userColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('application_status', 'vat_number', 'customer_number', 'website_url', 'monthly_purchase_forecast', 'approved_by', 'created_by_admin')
      ORDER BY column_name
    `);
    
    console.log('\n👤 Novos campos em users (' + userColumns.rows.length + '):');
    userColumns.rows.forEach(row => {
      console.log('  ✅', row.column_name.padEnd(25), row.data_type.padEnd(20), row.column_default || 'NULL');
    });
    
    // Verificar configuração default de email
    const configs = await pool.query('SELECT config_name, from_email, is_default, smtp_host FROM email_configurations');
    console.log('\n📧 Configurações email (' + configs.rows.length + '):');
    configs.rows.forEach(row => {
      console.log('  ✅', row.config_name.padEnd(10), row.from_email.padEnd(25), 'default:', row.is_default);
    });
    
    // Verificar estrutura da tabela customer_addresses
    const addressStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customer_addresses'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📍 Estrutura customer_addresses (' + addressStructure.rows.length + ' campos):');
    addressStructure.rows.forEach(row => {
      console.log('  ✅', row.column_name.padEnd(20), row.data_type);
    });
    
    // Verificar constraints e foreign keys
    const constraints = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name LIKE 'customer_%'
      ORDER BY tc.table_name, tc.constraint_name
    `);
    
    console.log('\n🔗 Foreign Keys (' + constraints.rows.length + '):');
    constraints.rows.forEach(row => {
      console.log('  ✅', row.table_name.padEnd(20), row.column_name.padEnd(15), '→', row.foreign_table_name + '.' + row.foreign_column_name);
    });
    
    console.log('\n🎉 Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  } finally {
    await pool.end();
  }
}

verifyMigration(); 