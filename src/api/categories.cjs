const express = require('express');
const { pool } = require('../db.cjs'); // Usar o pool centralizado
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
  console.log(`[API] GET /api/categories/tree - A buscar árvore de categorias.`);
  try {
    const query = `
        SELECT 
            c.geko_category_id as id,
            c.name,
            c.path,
            COUNT(pc.ean) as product_count
        FROM categories c
        LEFT JOIN product_categories pc ON c.geko_category_id = pc.geko_category_id
        GROUP BY c.geko_category_id, c.name, c.path
        ORDER BY c.path;
    `;

    const result = await pool.query(query);
    const categoryTree = buildCategoryTreeFromPaths(result.rows);

    console.log(`[API] GET /api/categories/tree - Sucesso. Raízes da árvore: ${categoryTree.length}`);
    res.json(categoryTree);

  } catch (error) {
    console.error('[API] Erro ao buscar a árvore de categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar a árvore de categorias.' });
  }
});

// Rota para CRIAR uma nova categoria (Admin Only)
router.post('/', requireAdminAuth, async (req, res) => {
  const { geko_category_id, name, path } = req.body;

  if (!geko_category_id || !name || !path) {
    return res.status(400).json({ error: 'Missing required fields: geko_category_id, name, path' });
  }

  try {
    const newCategory = await pool.query(
      'INSERT INTO categories (geko_category_id, name, path) VALUES ($1, $2, $3) RETURNING *',
      [geko_category_id, name, path]
    );
    res.status(201).json(newCategory.rows[0]);
  } catch (error) {
    console.error('[API] Erro ao criar categoria:', error);
    if (error.code === '23505') { // unique_violation
        return res.status(409).json({ error: `Já existe uma categoria com o ID ${geko_category_id}.` });
    }
    res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
});

// Rota para ATUALIZAR uma categoria (Admin Only)
router.put('/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, path } = req.body;

  if (!name || !path) {
    return res.status(400).json({ error: 'Missing required fields: name, path' });
  }

  try {
    const updatedCategory = await pool.query(
      'UPDATE categories SET name = $1, path = $2 WHERE geko_category_id = $3 RETURNING *',
      [name, path, id]
    );

    if (updatedCategory.rows.length === 0) {
      return res.status(404).json({ error: `Categoria com ID ${id} não encontrada.` });
    }
    res.json(updatedCategory.rows[0]);
  } catch (error) {
    console.error(`[API] Erro ao atualizar categoria ${id}:`, error);
    res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
});

// Rota para APAGAR uma categoria (Admin Only)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se a categoria não está a ser usada em `product_categories`
    const usageCheck = await pool.query('SELECT 1 FROM product_categories WHERE geko_category_id = $1 LIMIT 1', [id]);
    if (usageCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Não é possível apagar a categoria, pois está associada a produtos.' });
    }

    const deleteResult = await pool.query('DELETE FROM categories WHERE geko_category_id = $1 RETURNING *', [id]);

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: `Categoria com ID ${id} não encontrada.` });
    }
    res.status(204).send();
  } catch (error) {
    console.error(`[API] Erro ao apagar categoria ${id}:`, error);
    res.status(500).json({ error: 'Erro ao apagar categoria.' });
  }
});

module.exports = router;
