// update_user_password_hash.cjs
require('dotenv').config(); // Para carregar variáveis de ambiente, se o pool depender delas implicitamente
const pool = require('./db/index.cjs'); // O seu pool de conexões PostgreSQL

const emailToUpdate = 'g.art.shine@gmail.com';
const newPasswordHash = '$2b$10$KhS3hZ68jOZwFp6hWZsSH.ddhE8FP5cUTrhphbgKjlAAc3aPE1W0e'; // O hash que gerámos

async function updateUserPasswordHash() {
  console.log(`A tentar atualizar o password_hash para o email: ${emailToUpdate}`);
  
  if (!newPasswordHash) {
    console.error('ERRO: O hash da password está vazio. Gere o hash primeiro.');
    return;
  }

  const query = `
    UPDATE users
    SET password_hash = $1
    WHERE email = $2
    RETURNING user_id, email, password_hash, updated_at;
  `;
  
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(query, [newPasswordHash, emailToUpdate]);
    
    if (result.rowCount > 0) {
      console.log('Password_hash atualizado com sucesso!');
      console.log('Detalhes do utilizador atualizado:', result.rows[0]);
    } else {
      console.warn(`Nenhum utilizador encontrado com o email: ${emailToUpdate}. Nenhuma atualização realizada.`);
    }
  } catch (error) {
    console.error('Erro ao atualizar o password_hash na base de dados:', error.message);
    console.error('Stack do erro:', error.stack);
  } finally {
    if (client) {
      client.release(); // Libertar a conexão de volta para o pool
    }
    // pool.end(); // Descomente se quiser fechar o pool após a execução do script. Geralmente não é necessário para scripts únicos.
    console.log('Script de atualização de password_hash finalizado.');
  }
}

updateUserPasswordHash(); 