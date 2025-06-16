const bcrypt = require('bcryptjs');

const HASH_SALT_ROUNDS = 10;

/**
 * Gera um hash para uma password.
 * @param {string} password - A password em texto plano.
 * @returns {Promise<string>} O hash da password.
 */
const hashPassword = async (password) => {
  if (!password) {
    throw new Error('Password cannot be empty');
  }
  return bcrypt.hash(password, HASH_SALT_ROUNDS);
};

/**
 * Compara uma password em texto plano com um hash armazenado.
 * @param {string} password - A password em texto plano fornecida pelo utilizador.
 * @param {string} hashedPassword - O hash da password armazenado na base de dados.
 * @returns {Promise<boolean>} True se as passwords corresponderem, false caso contrário.
 */
const comparePassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    return false; // Ou lançar um erro se preferir uma validação mais estrita
  }
  return bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
}; 