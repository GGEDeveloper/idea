// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); // Importa o pacote cors
const cookieParser = require('cookie-parser');
const { clerkMiddleware } = require('@clerk/express'); // Importar clerkMiddleware

const pool = require('./db/index.cjs');

const searchRouter = require('./src/api/search.cjs');
const productsRouter = require('./src/api/products.cjs');
const categoriesRouter = require('./src/api/categories.cjs');
const variationsRouter = require('./src/api/variations.cjs');
const stockRouter = require('./src/api/stock.cjs');
const usersRouter = require('./src/api/users.cjs');
const ordersRouter = require('./src/api/orders.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS usando o pacote
const corsOptions = {
  origin: 'http://localhost:5174', // Permite requisições do frontend
  optionsSuccessStatus: 200, // Para navegadores legados
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Aplicar Clerk Middleware globalmente ANTES das rotas da API
// Isto irá popular req.auth para todas as rotas se o utilizador estiver autenticado.
// Certifique-se que CLERK_SECRET_KEY e CLERK_PUBLISHABLE_KEY estão nas suas variáveis de ambiente.
app.use(clerkMiddleware());

// Middleware para adicionar o pool de conexão a cada requisição
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Rotas da API
// Com clerkMiddleware() global, req.auth estará disponível aqui se autenticado.
// A proteção específica de rotas (exigir login) ainda será feita nos routers individuais ou com requireAuth.
app.use('/api/search', searchRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/stock', stockRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);

// A rota de variações é um sub-recurso de produtos
productsRouter.use('/:productId/variations', variationsRouter);

// Rota de diagnóstico (Health Check) com teste de BD
app.get('/api/health', async (req, res) => {
  try {
    // Agora podemos usar req.pool, que foi anexado pelo middleware
    const dbResult = await req.pool.query('SELECT NOW()');
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
