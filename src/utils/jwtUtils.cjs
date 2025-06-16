const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d'; // Token expira em 1 dia, pode ajustar

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in .env file.');
}

/**
 * Gera um JSON Web Token.
 * @param {object} payload - O payload a ser incluído no token (ex: { userId: user.user_id, role: user.role_name }).
 * @returns {string} O token JWT gerado.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifica um JSON Web Token.
 * @param {string} token - O token JWT a ser verificado.
 * @returns {object | null} O payload descodificado se o token for válido, null caso contrário.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // console.error('[jwtUtils] Invalid or expired token:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_EXPIRES_IN // Exportar para que o cookie possa ser configurado com a mesma expiração
}; 