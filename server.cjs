// server.js
require('dotenv').config();

// TEMPORARY DEBUG logs can be removed now
// console.log('[DEBUG SERVER.CJS] CLERK_SECRET_KEY from process.env:', process.env.CLERK_SECRET_KEY ? 'Loaded' : 'NOT LOADED or Empty');
// if (process.env.CLERK_SECRET_KEY) {
//   console.log('[DEBUG SERVER.CJS] CLERK_SECRET_KEY starts with:', process.env.CLERK_SECRET_KEY.substring(0, 10)); // Log first 10 chars
// }

const express = require('express');
const path = require('path');
const cors = require('cors'); // Importa o pacote cors
const cookieParser = require('cookie-parser');
// const { clerkMiddleware } = require('@clerk/express'); // REMOVIDA DECLARAÇÃO DUPLICADA DAQUI

const pool = require('./db/index.cjs');
const userQueries = require('./src/db/user-queries.cjs'); // GARANTIR QUE ESTÁ IMPORTADO

// Comentar temporariamente outros routers
// const searchRouter = require('./src/api/search.cjs');
// const productsRouter = require('./src/api/products.cjs');
// const categoriesRouter = require('./src/api/categories.cjs');
// const variationsRouter = require('./src/api/variations.cjs');
// const stockRouter = require('./src/api/stock.cjs');
// const usersRouter = require('./src/api/users.cjs'); // O original está comentado
// const ordersRouter = require('./src/api/orders.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// A importação de requireAuth foi movida para routers individuais ou usada diretamente onde necessário.
const { clerkMiddleware, requireAuth: clerkRequireAuthForDirectUse } = require('@clerk/express'); 
app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  authorizedParties: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    process.env.VITE_CLERK_FRONTEND_API_URL 
  ].filter(Boolean),
  debug: true 
}));

// Configuração do CORS atualizada
const whitelist = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) { 
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
// app.use(cors(corsOptions)); // Temporarily commented out more restrictive CORS
// app.use(cors({ origin: true, credentials: true })); // Previous temporary setting
app.use(cors({ origin: true, credentials: true, allowedHeaders: ['Content-Type', 'Authorization'] })); // New temporary setting explicitly allowing Authorization header

app.use(express.json());
app.use(cookieParser());

// Middleware para adicionar o pool de conexão a cada requisição
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Rotas da API
// app.use('/api/search', searchRouter);
// app.use('/api/products', productsRouter);
// app.use('/api/categories', categoriesRouter);
// app.use('/api/stock', stockRouter);
// app.use('/api/orders', ordersRouter);

// Logger genérico para /api/users - pode ser mantido para observação
app.use('/api/users', (req, res, next) => {
  console.log(`[SERVER.CJS] Generic /api/users logger. Path: ${req.path}, Method: ${req.method}`);
  next();
});

// Comentar usersRouter original já estava feito
// app.use('/api/users', usersRouter);

// Definir a rota /api/users/me DIRETAMENTE em server.cjs - COM OPÇÕES COMPLETAS NO requireAuth
app.get('/api/users/me', clerkRequireAuthForDirectUse({
  secretKey: process.env.CLERK_SECRET_KEY,       // Adicionando explicitamente
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY, // Adicionando explicitamente
  authorizedParties: [ // Adicionando explicitamente
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    process.env.VITE_CLERK_FRONTEND_API_URL 
  ].filter(Boolean),
  debug: true 
}), async (req, res) => {
  console.log('<<<<< EXECUTING SIMPLIFIED /api/users/me HANDLER (DIRECTLY IN server.cjs) >>>>>');
  const authData = req.auth();
  if (authData && authData.userId) {
    console.log('[SIMPLIFIED DIRECT /api/users/me in server.cjs] Auth object:', JSON.stringify(authData, null, 2));
    // Apenas para teste, não aceder à BD aqui para manter simples
    res.json({ message: 'Simplified direct /api/users/me in server.cjs reached with auth!', userId: authData.userId, authData: authData });
  } else {
    console.log('[SIMPLIFIED DIRECT /api/users/me in server.cjs] Auth object or userId NOT FOUND on req.auth()');
    console.log('[SIMPLIFIED DIRECT /api/users/me in server.cjs] Value of req.auth():', JSON.stringify(authData, null, 2));
    res.status(401).json({ message: 'Simplified direct route: Utilizador não autenticado ou dados de sessão inválidos.', authData: authData });
  }
});

// A rota de variações é um sub-recurso de produtos
// productsRouter.use('/:productId/variations', variationsRouter);

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

// Comentar temporariamente o SPA fallback e static serving
// app.use(express.static(path.join(__dirname, 'dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

// Tratamento de erros global (exemplo simples) - Manter
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER]', err.message, err.stack);
  if (err.clerkError) {
    console.error('[GLOBAL ERROR HANDLER] Clerk Error Status:', err.status);
    console.error('[GLOBAL ERROR HANDLER] Clerk Error Details:', err.errors);
  }
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    message: err.message || 'Something broke!',
    ...(err.clerkError && { clerkErrors: err.errors })
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
