// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const searchRouter = require('./src/api/search.cjs');
const productsRouter = require('./src/api/products.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

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
