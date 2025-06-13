const express = require('express');
const userQueries = require('../db/user-queries.cjs');
const { requireAuth } = require('./middleware/auth.cjs');

const router = express.Router();

/**
 * Rota para obter os dados e permissões do utilizador autenticado.
 * Esta rota utiliza a função `findOrCreateUserByClerkId` para garantir que
 * o utilizador que faz a chamada existe na nossa base de dados local.
 * É o principal ponto de sincronização entre o Clerk e o nosso sistema.
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) {
      // O middleware `requireAuth` deveria ter prevenido isto, mas é uma segurança extra.
      return res.status(401).json({ error: 'Sessão de utilizador não encontrada.' });
    }

    const userProfile = await userQueries.findOrCreateUserByClerkId(clerkId);

    if (!userProfile) {
      return res.status(404).json({ error: 'Não foi possível encontrar ou criar o perfil de utilizador.' });
    }

    res.json(userProfile);

  } catch (error) {
    console.error('[API /users/me] Erro ao obter o perfil do utilizador:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter o perfil do utilizador.' });
  }
});

module.exports = router; 