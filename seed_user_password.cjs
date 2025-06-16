// seed_user_password.cjs
require('dotenv').config();
const pool = require('./db/index.cjs');

const emailToUpdate = 'g.art.shine@gmail.com';
// Hash gerado anteriormente para a password "passdocaralhob1tch!0!"
const passwordHashToSeed = '$2b$10$KhS3hZ68jOZwFp6hWZsSH.ddhE8FP5cUTrhphbgKjlAAc3aPE1W0e'; 

async function seedUserPassword() {
  console.log(`A definir/atualizar o password_hash para o email: ${emailToUpdate}`);
  
  if (!passwordHashToSeed) {
    console.error('ERRO: O hash da password está vazio. Verifique o script.');
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
    const result = await client.query(query, [passwordHashToSeed, emailToUpdate]);
    
    if (result.rowCount > 0) {
      console.log('Password_hash definido/atualizado com sucesso na base de dados!');
      console.log('Detalhes do utilizador atualizado:', result.rows[0]);
    } else {
      console.warn(`Nenhum utilizador encontrado com o email: ${emailToUpdate}. Nenhuma atualização realizada. Verifique se o utilizador existe.`);
    }
  } catch (error) {
    console.error('Erro ao definir/atualizar o password_hash na base de dados:', error.message);
    console.error('Stack do erro:', error.stack);
  } finally {
    if (client) {
      client.release();
    }
    console.log('Script de seeding de password_hash finalizado.');
    // pool.end(); // Descomentar para fechar o pool se necessário
  }
}

seedUserPassword(); 