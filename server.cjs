// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); // Importa o pacote cors
const cookieParser = require('cookie-parser');

const searchRouter = require('./src/api/search.cjs');
const productsRouter = require('./src/api/products.cjs');
const { router: categoriesRouter } = require('./src/api/categories.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS usando o pacote
const corsOptions = {
  origin: 'http://localhost:5174', // Permite requisições do frontend
  optionsSuccessStatus: 200 // Para navegadores legados
};

app.use(cors(corsOptions));
app.use(cookieParser());


// API routes
app.use('/api/search', searchRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

// Rota de diagnóstico (Health Check) com teste de BD
app.get('/api/health', async (req, res) => {
  try {
    const { pool } = require('./src/db.cjs'); // Importa o pool de conexão centralizado
    const dbResult = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'ok',
      dbStatus: 'connected',
      dbTime: dbResult.rows[0].now,
    });
  } catch (error) {
    console.error('[Health Check] Erro de conexão com o banco de dados:', error);
    res.status(500).json({
      status: 'error',
      dbStatus: 'disconnected',
      errorMessage: error.message,
    });
  }
});

// Serve static files from Vite build (if applicable)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
