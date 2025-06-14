/**
 * Funções de consulta à base de dados para as entidades de Utilizadores, Roles e Permissions.
 * Este módulo centraliza a lógica de acesso a dados para o sistema RBAC.
 */
const pool = require('../../db/index.cjs');
// const clerk = require('@clerk/clerk-sdk-node'); // SDK Antigo REMOVIDO
const { createClerkClient } = require('@clerk/backend'); // Novo SDK

// Instanciar o cliente Clerk. Ele usará CLERK_SECRET_KEY das variáveis de ambiente.
// Certifique-se que CLERK_SECRET_KEY está definida no seu .env e carregada pelo server.cjs
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Encontra ou cria um utilizador na base de dados local com base no seu ID do Clerk.
 * Se o utilizador já existe, retorna os seus dados e permissões.
 * Se não existe, cria um novo registo, atribui-lhe o cargo 'customer' por defeito
 * e retorna os dados e permissões recém-criados.
 *
 * @param {string} clerkId - O ID do utilizador fornecido pelo Clerk.
 * @returns {Promise<object|null>} - O objeto do utilizador do nosso sistema com as suas permissões, ou nulo em caso de erro.
 */
async function findOrCreateUserByClerkId(clerkId) {
  // Primeiro, tenta encontrar o utilizador pelo clerk_id
  const userQuery = `
    SELECT 
      u.user_id,
      u.clerk_id,
      u.email,
      u.first_name,
      u.last_name,
      u.company_name,
      r.role_name,
      ARRAY_AGG(p.permission_name) as permissions
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE u.clerk_id = $1
    GROUP BY u.user_id, r.role_name;
  `;

  const { rows } = await pool.query(userQuery, [clerkId]);

  if (rows.length > 0) {
    // Utilizador encontrado, retorna-o.
    return rows[0];
  }

  // Se o utilizador não foi encontrado, temos de o criar.
  // 1. Obter os dados do utilizador do Clerk
  // const clerkUser = await clerk.users.getUser(clerkId); // Chamada antiga
  const clerkUser = await clerkClient.users.getUser(clerkId); // Chamada ATUALIZADA
  if (!clerkUser) {
    console.error(`[user-queries] Utilizador do Clerk não encontrado para clerkId: ${clerkId} durante a criação local.`);
    throw new Error('Utilizador do Clerk não encontrado para criação local.');
  }

  // 2. Obter o ID do cargo 'customer'
  const roleResult = await pool.query("SELECT role_id FROM roles WHERE role_name = 'customer'");
  if (roleResult.rows.length === 0) {
    throw new Error("Cargo 'customer' não encontrado na base de dados.");
  }
  const customerRoleId = roleResult.rows[0].role_id;

  // 3. Criar o novo utilizador na nossa base de dados
  const newUserQuery = `
    INSERT INTO users (clerk_id, email, first_name, last_name, role_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING user_id, clerk_id, email, first_name, last_name, company_name;
  `;
  const newUserParams = [
    clerkId,
    clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress,
    clerkUser.firstName,
    clerkUser.lastName,
    customerRoleId
  ];
  
  const newLocalUser = await pool.query(newUserQuery, newUserParams);
  console.log(`[user-queries] Novo utilizador local criado para clerkId: ${clerkId}, user_id: ${newLocalUser.rows[0].user_id}`);

  // 4. Buscar as permissões do novo utilizador e retornar o objeto completo
  const finalUser = await pool.query(userQuery, [clerkId]); // Re-query para obter o formato com permissões
  if (finalUser.rows.length === 0) {
    console.error(`[user-queries] Erro crítico: Utilizador recém-criado não encontrado na re-query para clerkId: ${clerkId}`);
    throw new Error('Falha ao buscar utilizador recém-criado com permissões.');
  }
  return finalUser.rows[0];
}


module.exports = {
  findOrCreateUserByClerkId,
}; 