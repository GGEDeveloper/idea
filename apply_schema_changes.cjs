require('dotenv').config();
const pool = require('./db/index.cjs');

async function applySchemaChanges() {
  console.log('A aplicar alterações ao esquema da tabela "users"...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Iniciar transação

    // Adicionar a coluna para o hash da password, permitindo NULLs inicialmente
    console.log('A adicionar coluna "password_hash" TEXT à tabela "users"...');
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_hash TEXT;
    `);
    console.log('Coluna "password_hash" adicionada (ou já existia).');

    // Tornar clerk_id opcional (NULLABLE)
    // Primeiro, verificar se a constraint NOT NULL existe antes de a tentar remover
    const notNullCheck = await client.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'users'::regclass
        AND conname LIKE 'users_clerk_id_not_null%'; -- O nome pode variar, tentamos um padrão
    `);
    // Alternativamente, e mais robusto, verificar diretamente nos atributos da coluna:
    const columnInfo = await client.query(`
      SELECT attnotnull 
      FROM pg_attribute 
      WHERE attrelid = 'users'::regclass AND attname = 'clerk_id';
    `);

    if (columnInfo.rows.length > 0 && columnInfo.rows[0].attnotnull) {
      console.log('A tornar coluna "clerk_id" NULLABLE na tabela "users"...');
      await client.query(`
        ALTER TABLE users
        ALTER COLUMN clerk_id DROP NOT NULL;
      `);
      console.log('Coluna "clerk_id" agora é NULLABLE.');
    } else {
      console.log('Coluna "clerk_id" já é NULLABLE ou não existe a constraint NOT NULL com nome padrão.');
    }
    
    // Atualizar comentário da tabela (opcional, mas bom para documentação)
    console.log('A atualizar comentário da tabela "users"...');
    await client.query(`
      COMMENT ON TABLE users IS 'Armazena dados de negócio dos utilizadores, com autenticação local.';
    `);
    console.log('Comentário da tabela "users" atualizado.');

    await client.query('COMMIT'); // Finalizar transação
    console.log('Alterações ao esquema aplicadas com sucesso!');

  } catch (error) {
    await client.query('ROLLBACK'); // Reverter em caso de erro
    console.error('Erro ao aplicar alterações ao esquema:', error.message);
    console.error('Stack do erro:', error.stack);
  } finally {
    client.release();
    console.log('Script de alterações de esquema finalizado.');
    // pool.end(); // Descomentar para fechar o pool, se este for o único uso
  }
}

applySchemaChanges(); 