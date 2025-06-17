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

/**
 * Pesquisa utilizadores por email, nome ou empresa (para administradores).
 * @param {string} searchTerm - Termo de pesquisa.
 * @param {number} limit - Número máximo de resultados.
 * @returns {Promise<object[]>} Lista de utilizadores encontrados.
 */
async function searchUsers(searchTerm, limit = 10) {
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.company_name,
      u.created_at,
      r.role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    WHERE 
      u.email ILIKE $1 OR 
      u.first_name ILIKE $1 OR 
      u.last_name ILIKE $1 OR 
      u.company_name ILIKE $1 OR
      CONCAT(u.first_name, ' ', u.last_name) ILIKE $1
    ORDER BY u.created_at DESC
    LIMIT $2;
  `;
  
  try {
    const searchPattern = `%${searchTerm}%`;
    const { rows } = await pool.query(query, [searchPattern, limit]);
    return rows;
  } catch (error) {
    console.error('[user-queries] Error in searchUsers:', error);
    throw error;
  }
}

/**
 * Lista utilizadores com filtros e paginação (para administradores).
 * @param {object} filters - Filtros a aplicar.
 * @param {object} pagination - Opções de paginação.
 * @returns {Promise<object[]>} Lista de utilizadores.
 */
async function getUsers(filters = {}, pagination = {}) {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;
  
  let whereClause = '';
  const queryParams = [];
  let paramIndex = 1;
  
  const whereClauses = [];
  
  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    whereClauses.push(`(
      u.email ILIKE $${paramIndex} OR 
      u.first_name ILIKE $${paramIndex + 1} OR 
      u.last_name ILIKE $${paramIndex + 2} OR 
      u.company_name ILIKE $${paramIndex + 3} OR
      CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramIndex + 4}
    )`);
    for (let i = 0; i < 5; i++) {
      queryParams.push(searchPattern);
    }
    paramIndex += 5;
  }
  
  if (filters.role) {
    whereClauses.push(`r.role_name = $${paramIndex++}`);
    queryParams.push(filters.role);
  }
  
  if (whereClauses.length > 0) {
    whereClause = `WHERE ${whereClauses.join(' AND ')}`;
  }
  
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.company_name,
      u.created_at,
      u.updated_at,
      r.role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  
  queryParams.push(limit, offset);
  
  try {
    const { rows } = await pool.query(query, queryParams);
    return rows;
  } catch (error) {
    console.error('[user-queries] Error in getUsers:', error);
    throw error;
  }
}

/**
 * Conta o número total de utilizadores que correspondem aos filtros.
 * @param {object} filters - Filtros a aplicar.
 * @returns {Promise<number>} Número total de utilizadores.
 */
async function countUsers(filters = {}) {
  let whereClause = '';
  const queryParams = [];
  let paramIndex = 1;
  
  const whereClauses = [];
  
  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    whereClauses.push(`(
      u.email ILIKE $${paramIndex} OR 
      u.first_name ILIKE $${paramIndex + 1} OR 
      u.last_name ILIKE $${paramIndex + 2} OR 
      u.company_name ILIKE $${paramIndex + 3} OR
      CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramIndex + 4}
    )`);
    for (let i = 0; i < 5; i++) {
      queryParams.push(searchPattern);
    }
    paramIndex += 5;
  }
  
  if (filters.role) {
    whereClauses.push(`r.role_name = $${paramIndex++}`);
    queryParams.push(filters.role);
  }
  
  if (whereClauses.length > 0) {
    whereClause = `WHERE ${whereClauses.join(' AND ')}`;
  }
  
  const query = `
    SELECT COUNT(DISTINCT u.user_id) as count
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    ${whereClause}
  `;
  
  try {
    const { rows } = await pool.query(query, queryParams);
    return parseInt(rows[0].count, 10) || 0;
  } catch (error) {
    console.error('[user-queries] Error in countUsers:', error);
    throw error;
  }
}

/**
 * Encontra um utilizador pelo seu ID (para administradores).
 * @param {string} userId - O UUID do utilizador.
 * @returns {Promise<object|null>} O objeto do utilizador ou nulo se não encontrado.
 */
async function getUserById(userId) {
  const query = `
    SELECT 
      u.user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.company_name,
      u.clerk_id,
      u.created_at,
      u.updated_at,
      r.role_name,
      r.role_id
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    WHERE u.user_id = $1;
  `;
  
  try {
    const { rows } = await pool.query(query, [userId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('[user-queries] Error in getUserById:', error);
    throw error;
  }
}

/**
 * Cria um novo utilizador (para administradores).
 * @param {object} userData - Dados do utilizador.
 * @returns {Promise<object>} O utilizador criado.
 */
async function createUser(userData) {
  const { email, first_name, last_name, company_name, role_id, password_hash, clerk_id } = userData;
  
  const query = `
    INSERT INTO users (email, first_name, last_name, company_name, role_id, password_hash, clerk_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING user_id, email, first_name, last_name, company_name, created_at;
  `;
  
  try {
    const { rows } = await pool.query(query, [
      email, first_name, last_name, company_name, role_id, password_hash, clerk_id
    ]);
    return rows[0];
  } catch (error) {
    console.error('[user-queries] Error in createUser:', error);
    throw error;
  }
}

/**
 * Atualiza um utilizador existente (para administradores).
 * @param {string} userId - O UUID do utilizador.
 * @param {object} userData - Dados a atualizar.
 * @returns {Promise<object|null>} O utilizador atualizado ou nulo se não encontrado.
 */
async function updateUser(userId, userData) {
  const { email, first_name, last_name, company_name, role_id } = userData;
  
  const query = `
    UPDATE users 
    SET email = $1, first_name = $2, last_name = $3, company_name = $4, role_id = $5, updated_at = NOW()
    WHERE user_id = $6
    RETURNING user_id, email, first_name, last_name, company_name, updated_at;
  `;
  
  try {
    const { rows } = await pool.query(query, [
      email, first_name, last_name, company_name, role_id, userId
    ]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('[user-queries] Error in updateUser:', error);
    throw error;
  }
}

module.exports = {
  findUserByEmailForAuth,
  findUserByIdForSession,
  searchUsers,
  getUsers,
  countUsers,
  getUserById,
  createUser,
  updateUser,
}; 