// src/db.js
require('dotenv').config();
const { Pool } = require('pg');

// Configuração centralizada do pool de conexão com o banco de dados.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED, // Temporariamente usando a URL direta para diagnóstico
  ssl: { rejectUnauthorized: false },
});

// Listener para confirmar a conexão
pool.on('connect', () => {
  console.log('✅ Base de dados conectada com sucesso!');
});

// Listener para capturar erros de conexão
pool.on('error', (err) => {
  console.error('❌ Erro inesperado no cliente do pool de banco de dados', err);
  process.exit(-1);
});

module.exports = { pool };
