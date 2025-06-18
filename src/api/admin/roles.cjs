const express = require('express');
const pool = require('../../../db/index.cjs');
const { requireAdmin } = require('../middleware/localAuth.cjs');

const router = express.Router();

// Aplica middleware de admin a todas as rotas
router.use(requireAdmin);

/**
 * GET /api/admin/roles
 * Lista todas as roles do sistema
 */
router.get('/', async (req, res) => {
  try {
    const rolesQuery = `
      SELECT 
        r.role_id,
        r.role_name,
        r.description,
        r.created_at,
        COUNT(u.user_id) as user_count,
        COUNT(rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN users u ON r.role_id = u.role_id
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      GROUP BY r.role_id, r.role_name, r.description, r.created_at
      ORDER BY r.role_name
    `;

    const result = await pool.query(rolesQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar roles:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/roles/:roleId
 * Obter detalhes de uma role específica com suas permissions
 */
router.get('/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;

    // Buscar informações da role
    const roleQuery = `
      SELECT role_id, role_name, description, created_at
      FROM roles
      WHERE role_id = $1
    `;

    // Buscar permissions da role
    const permissionsQuery = `
      SELECT 
        p.permission_id,
        p.permission_name,
        p.description
      FROM permissions p
      JOIN role_permissions rp ON p.permission_id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.permission_name
    `;

    // Buscar utilizadores com esta role
    const usersQuery = `
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.company_name
      FROM users u
      WHERE u.role_id = $1
      ORDER BY u.email
    `;

    const [roleResult, permissionsResult, usersResult] = await Promise.all([
      pool.query(roleQuery, [roleId]),
      pool.query(permissionsQuery, [roleId]),
      pool.query(usersQuery, [roleId])
    ]);

    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role não encontrada' });
    }

    const role = roleResult.rows[0];
    role.permissions = permissionsResult.rows;
    role.users = usersResult.rows;

    res.json(role);
  } catch (error) {
    console.error('Erro ao buscar detalhes da role:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/roles
 * Criar nova role
 */
router.post('/', async (req, res) => {
  try {
    const { role_name, description, permissions = [] } = req.body;

    if (!role_name) {
      return res.status(400).json({ error: 'Nome da role é obrigatório' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Criar a role
      const createRoleQuery = `
        INSERT INTO roles (role_name, description)
        VALUES ($1, $2)
        RETURNING role_id, role_name, description, created_at
      `;

      const roleResult = await client.query(createRoleQuery, [role_name, description]);
      const newRole = roleResult.rows[0];

      // Adicionar permissions se fornecidas
      if (permissions.length > 0) {
        const permissionValues = permissions.map((permId, index) => 
          `($1, $${index + 2})`
        ).join(', ');

        const addPermissionsQuery = `
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES ${permissionValues}
        `;

        await client.query(addPermissionsQuery, [newRole.role_id, ...permissions]);
      }

      await client.query('COMMIT');

      res.status(201).json(newRole);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao criar role:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Nome da role já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

/**
 * PUT /api/admin/roles/:roleId
 * Atualizar role existente
 */
router.put('/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    const { role_name, description, permissions = [] } = req.body;

    if (!role_name) {
      return res.status(400).json({ error: 'Nome da role é obrigatório' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Atualizar informações básicas da role
      const updateRoleQuery = `
        UPDATE roles 
        SET role_name = $1, description = $2
        WHERE role_id = $3
        RETURNING role_id, role_name, description, created_at
      `;

      const roleResult = await client.query(updateRoleQuery, [role_name, description, roleId]);

      if (roleResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Role não encontrada' });
      }

      // Remover permissions existentes
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

      // Adicionar novas permissions
      if (permissions.length > 0) {
        const permissionValues = permissions.map((permId, index) => 
          `($1, $${index + 2})`
        ).join(', ');

        const addPermissionsQuery = `
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES ${permissionValues}
        `;

        await client.query(addPermissionsQuery, [roleId, ...permissions]);
      }

      await client.query('COMMIT');

      res.json(roleResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Nome da role já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

/**
 * DELETE /api/admin/roles/:roleId
 * Eliminar role (apenas se não tiver utilizadores associados)
 */
router.delete('/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;

    // Verificar se há utilizadores com esta role
    const userCheckQuery = 'SELECT COUNT(*) as user_count FROM users WHERE role_id = $1';
    const userCheckResult = await pool.query(userCheckQuery, [roleId]);

    if (parseInt(userCheckResult.rows[0].user_count) > 0) {
      return res.status(400).json({ 
        error: 'Não é possível eliminar role com utilizadores associados' 
      });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Remover permissions da role
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

      // Remover a role
      const deleteResult = await client.query('DELETE FROM roles WHERE role_id = $1', [roleId]);

      if (deleteResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Role não encontrada' });
      }

      await client.query('COMMIT');

      res.json({ message: 'Role eliminada com sucesso' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao eliminar role:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/permissions
 * Lista todas as permissions disponíveis
 */
router.get('/permissions/all', async (req, res) => {
  try {
    const permissionsQuery = `
      SELECT 
        permission_id,
        permission_name,
        description,
        created_at
      FROM permissions
      ORDER BY permission_name
    `;

    const result = await pool.query(permissionsQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar permissions:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/permissions
 * Criar nova permission
 */
router.post('/permissions', async (req, res) => {
  try {
    const { permission_name, description } = req.body;

    if (!permission_name) {
      return res.status(400).json({ error: 'Nome da permission é obrigatório' });
    }

    const createPermissionQuery = `
      INSERT INTO permissions (permission_name, description)
      VALUES ($1, $2)
      RETURNING permission_id, permission_name, description, created_at
    `;

    const result = await pool.query(createPermissionQuery, [permission_name, description]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar permission:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Nome da permission já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

module.exports = router; 