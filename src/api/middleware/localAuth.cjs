const jwtUtils = require('../../utils/jwtUtils.cjs');
const userQueries = require('../../db/user-queries.cjs');

const TOKEN_COOKIE_NAME = 'idea_session_token';

/**
 * Middleware para carregar o utilizador autenticado se um token JWT válido estiver presente.
 * Anexa o perfil do utilizador (sem password_hash) a req.localUser.
 * Continua para o próximo middleware mesmo que não haja token ou o token seja inválido.
 */
const populateUserFromToken = async (req, res, next) => {
  const token = req.cookies[TOKEN_COOKIE_NAME];
  console.log(`[localAuth populateUserFromToken] Token from cookie ('${TOKEN_COOKIE_NAME}'): ${token ? 'Present' : 'Missing'}`);

  if (token) {
    const decodedPayload = jwtUtils.verifyToken(token);
    console.log('[localAuth populateUserFromToken] Decoded JWT payload:', decodedPayload);

    if (decodedPayload && decodedPayload.userId) {
      console.log(`[localAuth populateUserFromToken] Payload válido. UserID: ${decodedPayload.userId}. A buscar perfil...`);
      try {
        const userProfile = await userQueries.findUserByIdForSession(decodedPayload.userId);
        console.log('[localAuth populateUserFromToken] User profile from DB for session:', userProfile ? userProfile.email : 'NÃO ENCONTRADO');
        if (userProfile) {
          req.localUser = userProfile;
        } else {
          console.warn(`[localAuth populateUserFromToken] Token válido para userId ${decodedPayload.userId}, mas utilizador não encontrado na BD.`);
          // Considerar limpar o cookie aqui se o utilizador não existe mais, para evitar tentativas repetidas
          // res.clearCookie(TOKEN_COOKIE_NAME, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
        }
      } catch (error) {
        console.error('[localAuth populateUserFromToken] Erro ao buscar utilizador da BD com userId do token:', error);
      }
    } else {
      console.log('[localAuth populateUserFromToken] Payload JWT inválido ou sem userId.');
       // Limpar cookie inválido
      // res.clearCookie(TOKEN_COOKIE_NAME, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    }
  } else {
    // console.log('[localAuth populateUserFromToken] Nenhum token encontrado no cookie.');
  }
  next();
};

/**
 * Middleware para exigir autenticação. 
 * Deve ser usado APÓS populateUserFromToken.
 * Retorna 401 se o utilizador não estiver autenticado (req.localUser não existe).
 */
const requireAuth = (req, res, next) => {
  console.log('[localAuth requireAuth] A verificar autenticação. req.localUser:', req.localUser ? req.localUser.email : 'Indefinido');
  if (req.localUser && req.localUser.user_id) {
    next();
  } else {
    console.log('[localAuth requireAuth] Utilizador NÃO autenticado. A devolver 401.');
    res.clearCookie(TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax'
    });
    res.status(401).json({ error: 'Autenticação necessária.' });
  }
};

/**
 * Middleware para exigir que o utilizador seja um administrador.
 * Deve ser usado APÓS requireAuth.
 * Retorna 403 se o utilizador não for um admin.
 */
const requireAdmin = (req, res, next) => {
  console.log('[localAuth requireAdmin] A verificar se é admin. Role:', req.localUser ? req.localUser.role_name : 'Sem utilizador');
  if (req.localUser && req.localUser.role_name === 'admin') {
    next();
  } else {
    console.log('[localAuth requireAdmin] Utilizador NÃO é admin. A devolver 403.');
    res.status(403).json({ error: 'Acesso negado. Recurso exclusivo para administradores.' });
  }
};

module.exports = {
  populateUserFromToken,
  requireAuth,
  requireAdmin,
  TOKEN_COOKIE_NAME
}; 