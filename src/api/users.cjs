const express = require('express');
const userQueries = require('../db/user-queries.cjs');
// const { requireAuth } = require('./middleware/auth.cjs'); // Comentar a importação anterior
const { requireAuth: clerkRequireAuth } = require('@clerk/express'); // Importar diretamente do Clerk

const router = express.Router();

// Middleware de depuração para inspecionar o pedido ANTES do clerkRequireAuth
const debugRequestState = (req, res, next) => {
  console.log('<<<<< DEBUG REQUEST STATE before clerkRequireAuth >>>>>');
  console.log('[users.cjs] req.cookies:', JSON.stringify(req.cookies, null, 2));
  console.log('[users.cjs] req.headers.authorization (Bearer token?):', req.headers.authorization);
  // Verificar se o clerkMiddleware já populou algo em req.auth() - não deveria antes do requireAuth específico da rota, mas vamos ver.
  try {
    const authEarly = req.auth(); 
    console.log('[users.cjs] req.auth() BEFORE clerkRequireAuth (route specific):', JSON.stringify(authEarly, null, 2));
  } catch (e) {
    console.log('[users.cjs] Error calling req.auth() before route-specific requireAuth (this might be normal if not yet processed by global middleware fully for this stage): ', e.message);
  }
  next();
};

/**
 * Rota para obter os dados e permissões do utilizador autenticado.
 * Esta rota utiliza a função `findOrCreateUserByClerkId` para garantir que
 * o utilizador que faz a chamada existe na nossa base de dados local.
 * É o principal ponto de sincronização entre o Clerk e o nosso sistema.
 */
router.get('/me', debugRequestState, clerkRequireAuth({ debug: true }), async (req, res) => {
  console.log('<<<<< EXECUTING /api/users/me HANDLER >>>>>'); // Log adicionado
  try {
    console.log('[API /users/me] Attempting to call req.auth()...');
    const authData = req.auth(); 
    console.log('[API /users/me] req.auth() called. authData:', JSON.stringify(authData, null, 2));

    if (!authData || !authData.userId) {
      console.warn('[API /users/me] authData is invalid or userId is missing. authData:', JSON.stringify(authData, null, 2));
      // Se authData for nulo ou não tiver userId, não é uma sessão válida para esta rota.
      // O middleware requireAuth já deveria ter tratado isto, mas como uma salvaguarda adicional:
      return res.status(401).json({ error: 'Utilizador não autenticado ou dados de sessão inválidos.' });
    }
    const clerkId = authData.userId;
    console.log(`[API /users/me] authData OK. Clerk User ID: ${clerkId}. Attempting to find/create local user...`);

    const userProfile = await userQueries.findOrCreateUserByClerkId(clerkId);
    console.log('[API /users/me] findOrCreateUserByClerkId completed. userProfile:', JSON.stringify(userProfile, null, 2));

    if (!userProfile) {
      console.warn(`[API /users/me] Local user profile NOT found or created for clerkId: ${clerkId}`);
      return res.status(404).json({ error: 'Não foi possível encontrar ou criar o perfil de utilizador na base de dados local.' });
    }

    console.log('[API /users/me] Local user profile found/created. Sending response to frontend:', JSON.stringify(userProfile, null, 2));
    res.json(userProfile);

  } catch (error) {
    console.error('[API /users/me] ERRO CRÍTICO ao obter o perfil do utilizador:', error.message, error.stack);
    // Adicionar mais detalhes ao erro, se possível
    const errorResponse = { 
      message: 'Erro interno do servidor ao obter o perfil do utilizador.', 
      errorDetails: error.message
    };
    if (error.clerkError) { // Se for um erro específico do Clerk
      errorResponse.clerkError = error.clerkError;
    }
    res.status(500).json(errorResponse);
  }
});

module.exports = router; 