// server.js
require('dotenv').config();

// TEMPORARY DEBUG logs can be removed now
// console.log('[DEBUG SERVER.CJS] CLERK_SECRET_KEY from process.env:', process.env.CLERK_SECRET_KEY ? 'Loaded' : 'NOT LOADED or Empty');
// if (process.env.CLERK_SECRET_KEY) {
//   console.log('[DEBUG SERVER.CJS] CLERK_SECRET_KEY starts with:', process.env.CLERK_SECRET_KEY.substring(0, 10)); // Log first 10 chars
// }

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Essencial para ler cookies para o token JWT

const pool = require('./db/index.cjs');
const userQueries = require('./src/db/user-queries.cjs'); // Mantido, pois pode ser usado por outros routers ou futuras funcionalidades admin

// Routers da aplicação
const searchRouter = require('./src/api/search.cjs');
const productsRouter = require('./src/api/products.cjs');
const categoriesRouter = require('./src/api/categories.cjs');
const variationsRouter = require('./src/api/variations.cjs');
const stockRouter = require('./src/api/stock.cjs');
const usersRouter = require('./src/api/users.cjs'); // Contém a rota /me adaptada
const ordersRouter = require('./src/api/orders.cjs');
const authRouter = require('./src/api/auth.cjs'); // Novo router para autenticação local

// Admin routers
const adminProductsRouter = require('./src/api/admin/products.cjs');
const adminOrdersRouter = require('./src/api/admin/orders.cjs');

// Middleware de autenticação local
const { populateUserFromToken } = require('./src/api/middleware/localAuth.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globais Essenciais
app.use(cors({ origin: true, credentials: true, allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(cookieParser()); // cookieParser ANTES do populateUserFromToken

// Middleware para popular req.localUser a partir do token JWT (se existir)
app.use(populateUserFromToken);

// Middleware para adicionar o pool de conexão a cada requisição
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Rotas da API
app.use('/api/auth', authRouter); // Novas rotas /api/auth/login, /api/auth/logout
app.use('/api/users', usersRouter); // Inclui /api/users/me
app.use('/api/search', searchRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/stock', stockRouter);
app.use('/api/orders', ordersRouter);

// Admin routes
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/orders', adminOrdersRouter);

// A rota de variações é um sub-recurso de produtos (verificar se productsRouter está definido)
if (productsRouter) { // Adicionar verificação caso productsRouter seja condicionalmente importado/usado
productsRouter.use('/:productId/variations', variationsRouter);
}

// Rota de diagnóstico (Health Check)
app.get('/api/health', async (req, res) => {
  try {
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

// Servir ficheiros estáticos e fallback da SPA (TEMPORARIAMENTE COMENTADOS PARA DEPURAÇÃO DA API)
// app.use(express.static(path.join(__dirname, 'dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER]', err.message, err.stack);
  // Não há mais err.clerkError para verificar aqui
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    message: err.message || 'Something broke!',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Sistema de autenticação local ativo.');
  if (!process.env.JWT_SECRET) {
    console.warn('AVISO: JWT_SECRET não está definida no .env! Os tokens JWT não serão seguros.');
  }
});
