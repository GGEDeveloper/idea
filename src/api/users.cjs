const express = require('express');
const { requireAuth } = require('./middleware/localAuth.cjs'); // Usar o novo middleware de autenticação local

const router = express.Router();

/**
 * Rota para obter os dados e permissões do utilizador autenticado localmente.
 * req.localUser é populado pelo middleware populateUserFromToken.
 */
router.get('/me', requireAuth, (req, res) => {
  console.log('<<<<< EXECUTING /api/users/me HANDLER >>>>>');
  if (req.localUser) {
    console.log('[API /users/me] User profile from req.localUser:', JSON.stringify(req.localUser, null, 2));
    res.status(200).json(req.localUser);
  } else {
    // Este caso não deveria acontecer se requireAuth funcionar corretamente
    console.error('[API /users/me] ERRO INESPERADO: req.localUser não definido apesar de passar pelo requireAuth.');
    res.status(500).json({ error: 'Erro interno ao obter perfil do utilizador.' });
  }
});

// Outras rotas de utilizadores (ex: para admin gerir utilizadores) podem ser adicionadas aqui no futuro.
// Exemplo:
// const { requireAdmin } = require('./middleware/localAuth.cjs');
// router.get('/', requireAdmin, async (req, res) => { /* ... listar todos os utilizadores ... */ });
// router.post('/', requireAdmin, async (req, res) => { /* ... criar novo utilizador (com hashing de password) ... */ });

module.exports = router; 