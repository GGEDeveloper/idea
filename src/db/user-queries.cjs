/**
 * Funções de consulta à base de dados para as entidades de Utilizadores, Roles e Permissions.
 * Este módulo centraliza a lógica de acesso a dados para o sistema RBAC e autenticação local.
 */
const pool = require('../../db/index.cjs');

/**
 * Encontra um utilizador pelo seu email para fins de autenticação.
 * Retorna os dados necessários para verificar a password e estabelecer uma sessão.
 * @param {string} email - O email do utilizador.
 * @returns {Promise<object|null>} O objeto do utilizador com user_id, email, password_hash, role_name e permissions, ou nulo se não encontrado.
 */
async function findUserByEmailForAuth(email) {
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.password_hash, -- Importante para verificar a password
      r.role_name,
      COALESCE(ARRAY_REMOVE(ARRAY_AGG(p.permission_name), NULL), '{}') as permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.email = $1
    GROUP BY u.user_id, u.email, u.password_hash, r.role_name;
  `;
  try {
    const { rows } = await pool.query(query, [email]);
    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  } catch (error) {
    console.error('[user-queries] Error in findUserByEmailForAuth:', error);
    throw error;
  }
}

/**
 * Encontra um utilizador pelo seu ID (UUID da tabela users) para popular a sessão.
 * Retorna o perfil do utilizador sem dados sensíveis como o hash da password.
 * @param {string} userId - O UUID do utilizador.
 * @returns {Promise<object|null>} O objeto do utilizador com user_id, email, nome, etc., role_name e permissions, ou nulo se não encontrado.
 */
async function findUserByIdForSession(userId) {
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.company_name,
      u.clerk_id, -- Manter clerk_id caso seja útil para referência futura ou migração
      r.role_name,
      COALESCE(ARRAY_REMOVE(ARRAY_AGG(p.permission_name), NULL), '{}') as permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.user_id = $1
    GROUP BY u.user_id, u.email, u.first_name, u.last_name, u.company_name, u.clerk_id, r.role_name;
  `;
  try {
    const { rows } = await pool.query(query, [userId]);
  if (rows.length > 0) {
    return rows[0];
  }
    return null;
  } catch (error) {
    console.error('[user-queries] Error in findUserByIdForSession:', error);
    throw error;
  }
}

// Poderia adicionar aqui funções para criar/atualizar utilizadores pelo admin no futuro.

module.exports = {
  findUserByEmailForAuth,
  findUserByIdForSession,
}; 