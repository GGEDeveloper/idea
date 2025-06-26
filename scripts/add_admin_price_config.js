const pool = require('../db/index.cjs');

async function addAdminPriceConfig() {
  try {
    console.log('🔧 Adicionando configuração default_admin_price_list...');
    
    const result = await pool.query(`
      INSERT INTO pricing_config (config_key, config_value, data_type, description) 
      VALUES ('default_admin_price_list', '4', 'string', 'Lista de preços padrão exibida ao admin') 
      ON CONFLICT (config_key) DO UPDATE SET
        config_value = EXCLUDED.config_value,
        description = EXCLUDED.description
      RETURNING *;
    `);
    
    console.log('✅ Configuração adicionada/atualizada:', result.rows[0]);
    
    // Listar todas as configurações
    const allConfigs = await pool.query('SELECT * FROM pricing_config ORDER BY config_key');
    console.log('\n📋 Todas as configurações:');
    allConfigs.rows.forEach(config => {
      console.log(`• ${config.config_key}: ${config.config_value} (${config.description})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

addAdminPriceConfig();
