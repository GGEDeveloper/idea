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
const adminUsersRouter = require('./src/api/admin/users.cjs');
const adminReportsRouter = require('./src/api/admin/reports.cjs');
const adminRolesRouter = require('./src/api/admin/roles.cjs');
const adminContentRouter = require('./src/api/admin/content.cjs');
const adminSettingsRouter = require('./src/api/admin/settings.cjs');
const adminPricingRouter = require('./src/api/admin/pricing.cjs');

// Middleware de autenticação local
const { populateUserFromToken } = require('./src/api/middleware/localAuth.cjs');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`[SERVER] Starting in ${NODE_ENV} mode on port ${PORT}`);

// Security headers for production
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });
}

// CORS configuration - more restrictive in production
const corsOptions = NODE_ENV === 'production' 
  ? {
      origin: process.env.FRONTEND_URL || false,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  : {
      origin: true,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    };

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Middleware para popular req.localUser a partir do token JWT
app.use(populateUserFromToken);

// Middleware para adicionar o pool de conexão a cada requisição
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Request logging in production
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Rotas da API
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/search', searchRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/stock', stockRouter);
app.use('/api/orders', ordersRouter);

// Admin routes
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/reports', adminReportsRouter);
app.use('/api/admin/roles', adminRolesRouter);
app.use('/api/admin/content', adminContentRouter);
app.use('/api/admin/settings', adminSettingsRouter);
app.use('/api/admin/pricing', adminPricingRouter);

// A rota de variações é um sub-recurso de produtos (verificar se productsRouter está definido)
if (productsRouter) { // Adicionar verificação caso productsRouter seja condicionalmente importado/usado
productsRouter.use('/:productId/variations', variationsRouter);
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await req.pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'ok',
      environment: NODE_ENV,
      dbStatus: 'connected',
      dbTime: dbResult.rows[0].now,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: require('./package.json').version || '1.0.0',
      passenger: process.env.PASSENGER_BASE_URI ? 'enabled' : 'disabled'
    });
  } catch (error) {
    console.error('[Health Check] Database connection error:', error);
    res.status(500).json({
      status: 'error',
      environment: NODE_ENV,
      dbStatus: 'disconnected',
      errorMessage: error.message,
    });
  }
});

// Serve static files in production
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  
  // Static files with cache headers
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
  
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('[SERVER] Development mode - static files served by Vite');
}

// Error handling
app.use((err, req, res, next) => {
  console.error('[ERROR]', {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({
    message: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[SERVER] SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Only start the server if this file is run directly (not required by Passenger)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${NODE_ENV}`);
    console.log('[AUTH] Local JWT authentication system active');
    
    if (!process.env.JWT_SECRET) {
      console.warn('[WARNING] JWT_SECRET not defined! Tokens will not be secure.');
    }
    
    if (NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
      console.warn('[WARNING] FRONTEND_URL not defined for production CORS');
    }
  });
}

// Export the app for Passenger
module.exports = app;
