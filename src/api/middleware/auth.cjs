const express = require('express');
const { ClerkExpressRequireAuth, ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const userQueries = require('../../db/user-queries.cjs');

// Funções de middleware de autenticação
// Adapte as permissões conforme necessário para o seu projeto

/**
 * Middleware para endpoints que exigem uma sessão ativa (utilizador logado).
 * Devolve 401 se não houver sessão.
 */
const requireAuth = ClerkExpressRequireAuth();

/**
 * Middleware que carrega o perfil do utilizador do nosso sistema (`req.localUser`) se o utilizador estiver logado.
 * Se não estiver logado, continua sem erro.
 *
 * Este é um array de middlewares para ser usado pelo Express.
 * 1. ClerkExpressWithAuth(): Tenta carregar `req.auth` do Clerk. Não dá erro se não houver sessão.
 * 2. (função anónima): Usa `req.auth` para buscar o nosso perfil de utilizador local.
 */
const optionalUser = [
  ClerkExpressWithAuth(),
  async (req, res, next) => {
    // Se o middleware do Clerk encontrou um utilizador, tentamos buscar o perfil local
    if (req.auth && req.auth.userId) {
      try {
        const userProfile = await userQueries.findOrCreateUserByClerkId(req.auth.userId);
        req.localUser = userProfile;
      } catch (dbError) {
        console.error('Erro ao buscar/criar perfil de utilizador no middleware optionalUser:', dbError);
        // Em caso de erro de BD, não bloqueamos, mas logamos. A rota decide como agir.
      }
    }
    // Continua para a próxima função na cadeia de middleware, com ou sem req.localUser.
    return next();
  },
];

/**
 * Middleware para verificar se o utilizador é um administrador.
 * Exige autenticação e que a role 'admin' esteja presente nos metadados do Clerk.
 */
const requireAdminAuth = [
    ClerkExpressRequireAuth(),
    (req, res, next) => {
        if (req.auth.sessionClaims?.metadata?.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Recurso exclusivo para administradores.' });
        }
        next();
    }
];

module.exports = {
  requireAuth,
  optionalUser,
  requireAdminAuth,
}; 