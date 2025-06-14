const express = require('express');
const { requireAuth } = require('@clerk/express');
const userQueries = require('../../db/user-queries.cjs');

// Funções de middleware de autenticação

/**
 * Middleware para endpoints que exigem uma sessão ativa (utilizador logado).
 * Devolve 401 se não houver sessão.
 * Esta é a função importada diretamente de @clerk/express.
 */
// requireAuth já está importado e pronto a usar.

/**
 * Middleware que carrega o perfil do utilizador do nosso sistema (`req.localUser`) se o utilizador estiver autenticado.
 * Se não estiver logado, continua sem erro.
 *
 * Este middleware assume que `clerkMiddleware()` já foi aplicado globalmente e `req.auth` existe se autenticado.
 */
const optionalUser = async (req, res, next) => {
  const auth = req.auth(); // Chamar req.auth() como uma função
  if (auth && auth.userId) {
      try {
      const userProfile = await userQueries.findOrCreateUserByClerkId(auth.userId);
        req.localUser = userProfile;
      } catch (dbError) {
        console.error('Erro ao buscar/criar perfil de utilizador no middleware optionalUser:', dbError);
        // Em caso de erro de BD, não bloqueamos, mas logamos. A rota decide como agir.
      }
    }
    // Continua para a próxima função na cadeia de middleware, com ou sem req.localUser.
    return next();
};

/**
 * Middleware para verificar se o utilizador é um administrador.
 * Exige autenticação (usando o `requireAuth` do Clerk)
 * e que a role 'admin' esteja presente nos metadados do Clerk.
 */
const requireAdminAuth = [
  requireAuth, // Primeiro, garante que o utilizador está autenticado.
    (req, res, next) => {
    const auth = req.auth(); // Chamar req.auth() como uma função
    // Verificar se auth existe e depois as claims. Se requireAuth passou, auth deve existir.
    if (!auth || auth.sessionClaims?.metadata?.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Recurso exclusivo para administradores.' });
        }
    // Se for admin, ou se por algum motivo sessionClaims não estiver definido mas quisermos ser permissivos (improvável com requireAuth), prossegue.
    // Uma verificação mais estrita poderia ser: if (!req.auth || !req.auth.sessionClaims || req.auth.sessionClaims.metadata?.role !== 'admin')
        next();
    }
];

module.exports = {
  requireAuth, // Exporta o requireAuth do Clerk diretamente
  optionalUser,
  requireAdminAuth,
}; 