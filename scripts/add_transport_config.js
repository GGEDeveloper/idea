const pool = require('../db/index.cjs');

async function addTransportConfig() {
  try {
    console.log('🚚 Adicionando configuração base_transport_price...');
    
    const result = await pool.query(`
      INSERT INTO pricing_config (config_key, config_value, data_type, description) 
      VALUES ('base_transport_price', '5.00', 'number', 'Preço base de transporte aplicado às encomendas') 
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
      console.log(`• ${config.config_key}: ${config.config_value} (${config.data_type}) - ${config.description}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

addTransportConfig(); 