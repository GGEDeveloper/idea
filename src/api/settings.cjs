const express = require('express');
const db = require('../db.cjs');
const { requireAuth, requireAdmin } = require('./middleware/localAuth.cjs');

const router = express.Router();

// GET /api/settings/default-theme - Obter tema padrão do sistema
router.get('/default-theme', async (req, res) => {
  try {
    // Por enquanto, retorna um valor padrão
    // No futuro, virá da base de dados de configurações
    res.json({ 
      defaultTheme: 'light',
      allowUserSelection: true,
      systemPreferenceOverride: false 
    });
  } catch (error) {
    console.error('Erro ao obter configurações de tema:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

// PUT /api/settings/default-theme - Configurar tema padrão (apenas admin)
router.put('/default-theme', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { defaultTheme, allowUserSelection, systemPreferenceOverride } = req.body;

    // Validar o tema
    if (!['light', 'dark'].includes(defaultTheme)) {
      return res.status(400).json({ 
        error: 'Tema inválido. Deve ser "light" ou "dark".' 
      });
    }

    // TODO: Salvar na base de dados de configurações
    // Por enquanto, apenas retorna sucesso
    
    res.json({ 
      message: 'Configurações de tema atualizadas com sucesso',
      settings: {
        defaultTheme,
        allowUserSelection: allowUserSelection !== false, // default true
        systemPreferenceOverride: systemPreferenceOverride === true // default false
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações de tema:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

// GET /api/settings/all - Obter todas as configurações do sistema (apenas admin)
router.get('/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    // TODO: Buscar da base de dados
    const settings = {
      theme: {
        defaultTheme: 'light',
        allowUserSelection: true,
        systemPreferenceOverride: false
      },
      site: {
        siteName: 'IDEA - Ferramentas Profissionais',
        siteDescription: 'Loja especializada em ferramentas profissionais',
        contactEmail: 'info@idea-tools.pt',
        supportEmail: 'suporte@idea-tools.pt'
      },
      commerce: {
        allowGuestCheckout: false,
        requireOrderApproval: true,
        defaultCurrency: 'EUR',
        taxRate: 0.23
      },
      security: {
        sessionTimeout: 30, // minutes
        passwordMinLength: 8,
        requireTwoFactor: false
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

// PUT /api/settings/all - Atualizar configurações do sistema (apenas admin)
router.put('/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { theme, site, commerce, security } = req.body;

    // Validações básicas
    if (theme && !['light', 'dark'].includes(theme.defaultTheme)) {
      return res.status(400).json({ 
        error: 'Tema padrão inválido. Deve ser "light" ou "dark".' 
      });
    }

    if (commerce && commerce.taxRate && (commerce.taxRate < 0 || commerce.taxRate > 1)) {
      return res.status(400).json({ 
        error: 'Taxa de imposto deve estar entre 0 e 1.' 
      });
    }

    // TODO: Salvar na base de dados
    
    res.json({ 
      message: 'Configurações atualizadas com sucesso',
      settings: { theme, site, commerce, security }
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

module.exports = router; 