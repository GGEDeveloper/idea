const express = require('express');
const pool = require('../../../db/index.cjs');
const { requireAdmin } = require('../middleware/localAuth.cjs');

const router = express.Router();

// Aplica middleware de admin a todas as rotas
router.use(requireAdmin);

/**
 * GET /api/admin/settings
 * Lista todas as configurações do sistema
 */
router.get('/', async (req, res) => {
  try {
    // Criar tabela de configurações se não existir
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
        category VARCHAR(50) DEFAULT 'general',
        description TEXT,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await pool.query(createTableQuery);

    // Inserir configurações padrão se não existirem
    const insertDefaultSettingsQuery = `
      INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
      ('site_name', 'IDEA - Loja B2B', 'string', 'general', 'Nome do site', true),
      ('site_description', 'Plataforma B2B para equipamentos industriais', 'string', 'general', 'Descrição do site', true),
      ('contact_email', 'contato@idea.com', 'string', 'general', 'Email de contato principal', true),
      ('contact_phone', '+351 123 456 789', 'string', 'general', 'Telefone de contato', true),
      ('geko_sync_interval', '60', 'number', 'geko', 'Intervalo de sincronização com API Geko (minutos)', false),
      ('geko_api_enabled', 'true', 'boolean', 'geko', 'API Geko ativa', false),
      ('geko_auto_sync', 'true', 'boolean', 'geko', 'Sincronização automática ativa', false),
      ('max_products_per_page', '20', 'number', 'catalog', 'Máximo de produtos por página', false),
      ('featured_products_count', '6', 'number', 'catalog', 'Número de produtos em destaque na homepage', false),
      ('enable_product_reviews', 'false', 'boolean', 'catalog', 'Permitir reviews de produtos', false),
      ('order_approval_required', 'true', 'boolean', 'orders', 'Encomendas requerem aprovação admin', false),
      ('low_stock_threshold', '10', 'number', 'inventory', 'Limite para stock baixo', false),
      ('email_notifications', 'true', 'boolean', 'notifications', 'Notificações por email ativas', false),
      ('maintenance_mode', 'false', 'boolean', 'system', 'Modo de manutenção', false)
      ON CONFLICT (setting_key) DO NOTHING;
    `;

    await pool.query(insertDefaultSettingsQuery);

    const { category } = req.query;

    let settingsQuery = `
      SELECT 
        setting_id,
        setting_key,
        setting_value,
        setting_type,
        category,
        description,
        is_public,
        created_at,
        updated_at
      FROM system_settings
    `;

    const params = [];
    if (category) {
      settingsQuery += ' WHERE category = $1';
      params.push(category);
    }

    settingsQuery += ' ORDER BY category, setting_key';

    const result = await pool.query(settingsQuery, params);

    // Agrupar por categoria
    const settingsByCategory = result.rows.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.json(settingsByCategory);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/settings/:settingKey
 * Obter configuração específica
 */
router.get('/:settingKey', async (req, res) => {
  try {
    const { settingKey } = req.params;

    const settingQuery = `
      SELECT 
        setting_id,
        setting_key,
        setting_value,
        setting_type,
        category,
        description,
        is_public,
        created_at,
        updated_at
      FROM system_settings
      WHERE setting_key = $1
    `;

    const result = await pool.query(settingQuery, [settingKey]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/admin/settings/:settingKey
 * Atualizar configuração específica
 */
router.put('/:settingKey', async (req, res) => {
  try {
    const { settingKey } = req.params;
    const { setting_value } = req.body;

    if (setting_value === undefined) {
      return res.status(400).json({ error: 'Valor da configuração é obrigatório' });
    }

    const updateSettingQuery = `
      UPDATE system_settings 
      SET 
        setting_value = $2,
        updated_at = NOW()
      WHERE setting_key = $1
      RETURNING *
    `;

    const result = await pool.query(updateSettingQuery, [settingKey, setting_value]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/settings
 * Criar nova configuração
 */
router.post('/', async (req, res) => {
  try {
    const {
      setting_key,
      setting_value,
      setting_type = 'string',
      category = 'general',
      description,
      is_public = false
    } = req.body;

    if (!setting_key) {
      return res.status(400).json({ error: 'Chave da configuração é obrigatória' });
    }

    const createSettingQuery = `
      INSERT INTO system_settings (
        setting_key, setting_value, setting_type, category, description, is_public
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(createSettingQuery, [
      setting_key, setting_value, setting_type, category, description, is_public
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar configuração:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Chave de configuração já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

/**
 * PUT /api/admin/settings/batch
 * Atualizar múltiplas configurações
 */
router.put('/batch/update', async (req, res) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({ error: 'Lista de configurações é obrigatória' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const updatedSettings = [];

      for (const setting of settings) {
        const { setting_key, setting_value } = setting;

        if (!setting_key || setting_value === undefined) {
          continue;
        }

        const updateQuery = `
          UPDATE system_settings 
          SET setting_value = $2, updated_at = NOW()
          WHERE setting_key = $1
          RETURNING *
        `;

        const result = await client.query(updateQuery, [setting_key, setting_value]);
        
        if (result.rows.length > 0) {
          updatedSettings.push(result.rows[0]);
        }
      }

      await client.query('COMMIT');

      res.json({
        message: `${updatedSettings.length} configurações atualizadas`,
        settings: updatedSettings
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar configurações em lote:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/settings/geko/status
 * Status da integração com API Geko
 */
router.get('/geko/status', async (req, res) => {
  try {
    // Buscar configurações relacionadas ao Geko
    const gekoSettingsQuery = `
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE category = 'geko'
    `;

    const settingsResult = await pool.query(gekoSettingsQuery);
    const gekoSettings = settingsResult.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    // Verificar última sincronização (se existir tabela de logs)
    let lastSync = null;
    try {
      const lastSyncQuery = `
        SELECT MAX(last_sync) as last_sync 
        FROM geko_products 
        WHERE last_sync IS NOT NULL
      `;
      const syncResult = await pool.query(lastSyncQuery);
      lastSync = syncResult.rows[0]?.last_sync;
    } catch (error) {
      // Tabela pode não existir ainda
    }

    // Contar produtos sincronizados
    let syncedProductsCount = 0;
    try {
      const countQuery = 'SELECT COUNT(*) as count FROM geko_products';
      const countResult = await pool.query(countQuery);
      syncedProductsCount = parseInt(countResult.rows[0].count);
    } catch (error) {
      // Tabela pode não existir ainda
    }

    const status = {
      api_enabled: gekoSettings.geko_api_enabled === 'true',
      auto_sync: gekoSettings.geko_auto_sync === 'true',
      sync_interval: parseInt(gekoSettings.geko_sync_interval) || 60,
      last_sync: lastSync,
      synced_products: syncedProductsCount,
      api_key_configured: !!process.env.GEKO_API_KEY,
      api_url_configured: !!process.env.GEKO_API_XML_URL_EN_UTF8
    };

    res.json(status);
  } catch (error) {
    console.error('Erro ao buscar status da API Geko:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/settings/bulk
 * Atualizar múltiplas configurações
 */
router.post('/bulk', async (req, res) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({ error: 'Lista de configurações é obrigatória' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const updatedSettings = [];

      for (const setting of settings) {
        const { setting_key, setting_value, category } = setting;

        if (!setting_key || setting_value === undefined) {
          continue;
        }

        // Tentar atualizar primeiro
        const updateQuery = `
          UPDATE system_settings 
          SET setting_value = $2, category = $3, updated_at = NOW()
          WHERE setting_key = $1
          RETURNING *
        `;

        let result = await client.query(updateQuery, [setting_key, setting_value, category]);
        
        // Se não existir, criar
        if (result.rows.length === 0) {
          const insertQuery = `
            INSERT INTO system_settings (setting_key, setting_value, category)
            VALUES ($1, $2, $3)
            RETURNING *
          `;
          result = await client.query(insertQuery, [setting_key, setting_value, category]);
        }

        if (result.rows.length > 0) {
          updatedSettings.push(result.rows[0]);
        }
      }

      await client.query('COMMIT');

      res.json({
        message: `${updatedSettings.length} configurações atualizadas`,
        settings: updatedSettings
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar configurações em lote:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/settings/test-geko
 * Testar conexão com API Geko
 */
router.get('/test-geko', async (req, res) => {
  try {
    const apiKey = process.env.GEKO_API_KEY;
    const apiUrl = process.env.GEKO_API_XML_URL_EN_UTF8;

    if (!apiKey || !apiUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'Credenciais da API Geko não configuradas' 
      });
    }

    // Fazer uma requisição simples para testar a API
    const fetch = require('node-fetch');
    
    const response = await fetch(apiUrl, {
      method: 'HEAD', // Apenas verificar se responde
      timeout: 10000 // 10 segundos
    });

    if (response.ok) {
      res.json({
        success: true,
        message: 'Conexão com API Geko bem-sucedida',
        status_code: response.status
      });
    } else {
      res.json({
        success: false,
        error: `API Geko retornou status ${response.status}`,
        status_code: response.status
      });
    }
  } catch (error) {
    console.error('Erro ao testar API Geko:', error);
    res.json({
      success: false,
      error: 'Falha na conexão com API Geko',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/settings/test-database
 * Testar conexão com base de dados
 */
router.get('/test-database', async (req, res) => {
  try {
    // Testar conexão básica
    const testQuery = 'SELECT NOW() as current_time, version() as db_version';
    const result = await pool.query(testQuery);

    if (result.rows.length > 0) {
      res.json({
        success: true,
        message: 'Conexão com base de dados bem-sucedida',
        database_time: result.rows[0].current_time,
        database_version: result.rows[0].db_version.split(' ')[0] // Apenas versão do PostgreSQL
      });
    } else {
      res.json({
        success: false,
        message: 'Falha ao executar query de teste'
      });
    }
  } catch (error) {
    console.error('Erro ao testar base de dados:', error);
    res.json({
      success: false,
      message: 'Falha na conexão com base de dados',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/settings/system/info
 * Informações do sistema
 */
router.get('/system/info', async (req, res) => {
  try {
    // Informações básicas do sistema
    const systemInfo = {
      node_version: process.version,
      platform: process.platform,
      uptime: Math.floor(process.uptime()),
      memory_usage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Estatísticas da base de dados
    const dbStatsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM roles) as total_roles,
        (SELECT COUNT(*) FROM permissions) as total_permissions
    `;

    const dbResult = await pool.query(dbStatsQuery);
    const dbStats = dbResult.rows[0];

    res.json({
      system: systemInfo,
      database: dbStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar informações do sistema:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 