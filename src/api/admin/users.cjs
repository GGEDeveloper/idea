const express = require('express');
const userQueries = require('../../db/user-queries.cjs');
const { requireAdmin } = require('../middleware/localAuth.cjs');

const router = express.Router();

// Aplica o middleware de autenticação de admin a todas as rotas deste router.
router.use(requireAdmin);

/**
 * Rota para pesquisar utilizadores (para administradores).
 * Suporta pesquisa por email, nome, empresa.
 */
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }
    
    const users = await userQueries.searchUsers(query.trim(), parseInt(limit));
    res.json(users);
  } catch (error) {
    console.error('Erro ao pesquisar utilizadores:', error);
    res.status(500).json({ error: 'Falha ao pesquisar utilizadores.', details: error.message });
  }
});

/**
 * Rota para listar todos os utilizadores (para administradores).
 * Suporta paginação e filtragem por role.
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role,
      search
    } = req.query;

    const filters = {};
    
    if (search && search.trim()) {
      filters.search = search.trim();
    }
    
    if (role) {
      filters.role = role;
    }

    const paginationOptions = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };

    const users = await userQueries.getUsers(filters, paginationOptions);
    const totalUsers = await userQueries.countUsers(filters);

    res.json({
      users,
      totalPages: Math.ceil(totalUsers / paginationOptions.limit),
      currentPage: paginationOptions.page,
      totalUsers,
    });
  } catch (error) {
    console.error('Erro ao buscar utilizadores:', error);
    res.status(500).json({ error: 'Falha ao buscar utilizadores.', details: error.message });
  }
});

/**
 * Rota para buscar um único utilizador por ID (para administradores).
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userQueries.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }
    res.json(user);
  } catch (error) {
    console.error(`Erro ao buscar utilizador por ID (${userId}):`, error);
    res.status(500).json({ error: 'Falha ao buscar o utilizador.', details: error.message });
  }
});

/**
 * Rota para criar um novo utilizador.
 * Apenas para administradores.
 */
router.post('/', async (req, res) => {
  try {
    const newUser = await userQueries.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    res.status(500).json({ error: 'Falha ao criar o utilizador.', details: error.message });
  }
});

/**
 * Rota para atualizar um utilizador existente.
 * Apenas para administradores.
 */
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const updatedUser = await userQueries.updateUser(userId, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    res.status(500).json({ error: 'Falha ao atualizar o utilizador.', details: error.message });
  }
});

module.exports = router; 