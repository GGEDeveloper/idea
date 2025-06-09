// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const searchRouter = require('./src/api/search.cjs');
const productsRouter = require('./src/api/products.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Responde imediatamente a requisições OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// API routes
app.use('/api/search', searchRouter);
app.use('/api/products', productsRouter);

// Serve static files from Vite build (if applicable)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
