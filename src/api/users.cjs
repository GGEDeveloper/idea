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
  console.log('[API /users/me] Rota /me chamada. Verificando authData...');
  try {
    const authData = req.auth(); 
    if (!authData || !authData.userId) {
      console.warn('[API /users/me] Tentativa de acesso SEM userId em authData, mesmo após requireAuth. authData:', authData);
      return res.status(401).json({ error: 'Sessão de utilizador inválida ou não encontrada (sem userId em authData).' });
    }
    const clerkId = authData.userId;
    console.log(`[API /users/me] authData OK. Buscando perfil para clerkId: ${clerkId}`);

    const userProfile = await userQueries.findOrCreateUserByClerkId(clerkId);

    if (!userProfile) {
      console.warn(`[API /users/me] Perfil não encontrado ou não criado pela query para clerkId: ${clerkId}`);
      return res.status(404).json({ error: 'Não foi possível encontrar ou criar o perfil de utilizador na base de dados local.' });
    }

    console.log('[API /users/me] Perfil do utilizador local encontrado/criado. Enviando resposta para o frontend:', JSON.stringify(userProfile, null, 2));
    res.json(userProfile);

  } catch (error) {
    console.error('[API /users/me] ERRO CRÍTICO ao obter o perfil do utilizador:', error.message, error.stack);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao obter o perfil do utilizador.', 
      errorDetails: error.message 
    });
  }
});

module.exports = router; 