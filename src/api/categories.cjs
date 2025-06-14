const express = require('express');
// const { pool } = require('../db.cjs'); // Caminho antigo e incorreto
const pool = require('../../db/index.cjs'); // Caminho corrigido para o pool centralizado
const { buildCategoryTreeFromPaths } = require('./utils/category-utils.cjs');
const { requireAdminAuth } = require('./middleware/auth.cjs'); // Importar o middleware do novo local

const router = express.Router();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });



// GET /api/categories/tree
// Endpoint para buscar a árvore de categorias completa e hierárquica
router.get('/tree', async (req, res) => {
  console.log(`[API] GET /api/categories/tree - Buscando árvore de categorias (Query SQL CORRIGIDA DEFINITIVAMENTE).`);
  try {
    const query = `
        SELECT 
            c.categoryid as id, 
            c.name,
            c.path,
            COUNT(pc.product_ean) as product_count 
        FROM categories c
        LEFT JOIN product_categories pc ON c.categoryid = pc.category_id 
        GROUP BY c.categoryid, c.name, c.path 
        ORDER BY c.path;
    `;
    // console.log("[API /api/categories/tree] Executando query:", query); // Descomentar para depuração extrema
    const result = await pool.query(query);
    const categoryTree = buildCategoryTreeFromPaths(result.rows);
    console.log(`[API] GET /api/categories/tree - Sucesso. Raízes da árvore: ${categoryTree.length}`);
    res.json(categoryTree);
  } catch (error) {
    console.error('[API] Erro FATAL ao buscar a árvore de categorias:', error);
    res.status(500).json({ 
      error: 'Erro FATAL ao buscar a árvore de categorias.', 
      details: error.message,
      code: error.code,
      routine: error.routine
    });
  }
});

// Rota para CRIAR uma nova categoria (Admin Only)
router.post('/', requireAdminAuth, async (req, res) => {
  const { geko_category_id, name, path } = req.body; // geko_category_id é o input do payload
  if (!geko_category_id || !name || !path) {
    return res.status(400).json({ error: 'Campos obrigatórios: geko_category_id (será usado como categoryid), name, path' });
  }
  try {
    const newCategory = await pool.query(
      'INSERT INTO categories (categoryid, name, path) VALUES ($1, $2, $3) RETURNING *',
      [geko_category_id, name, path] // geko_category_id é o valor para a coluna categoryid
    );
    res.status(201).json(newCategory.rows[0]);
  } catch (error) {
    console.error('[API] Erro ao criar categoria:', error);
    if (error.code === '23505') { 
        return res.status(409).json({ error: `Já existe uma categoria com o ID ${geko_category_id}.` });
    }
    res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
});

// Rota para ATUALIZAR uma categoria (Admin Only)
router.put('/:id', requireAdminAuth, async (req, res) => {
  const categoryIdToUpdate = req.params.id; // Este é o categoryid
  const { name, path } = req.body;
  if (!name || !path) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, path' });
  }
  try {
    const updatedCategory = await pool.query(
      'UPDATE categories SET name = $1, path = $2 WHERE categoryid = $3 RETURNING *',
      [name, path, categoryIdToUpdate]
    );
    if (updatedCategory.rows.length === 0) {
      return res.status(404).json({ error: `Categoria com ID ${categoryIdToUpdate} não encontrada.` });
    }
    res.json(updatedCategory.rows[0]);
  } catch (error) {
    console.error(`[API] Erro ao atualizar categoria ${categoryIdToUpdate}:`, error);
    res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
});

// Rota para APAGAR uma categoria (Admin Only)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  const categoryIdToDelete = req.params.id; // Este é o categoryid
  try {
    const usageCheck = await pool.query('SELECT 1 FROM product_categories WHERE category_id = $1 LIMIT 1', [categoryIdToDelete]);
    if (usageCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Não é possível apagar a categoria, pois está associada a produtos.' });
    }
    const deleteResult = await pool.query('DELETE FROM categories WHERE categoryid = $1 RETURNING *', [categoryIdToDelete]);
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: `Categoria com ID ${categoryIdToDelete} não encontrada.` });
    }
    res.status(204).send();
  } catch (error) {
    console.error(`[API] Erro ao apagar categoria ${categoryIdToDelete}:`, error);
    res.status(500).json({ error: 'Erro ao apagar categoria.' });
  }
});

module.exports = router;
