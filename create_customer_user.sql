-- Script para limpar o usuário cliente incorreto e criar um novo
-- Data: 2025-06-16
-- Descrição: Remove o usuário cliente com dados incorretos e cria um novo com email cliente@mike.com

-- ============================================
-- INSTRUÇÕES DE EXECUÇÃO
-- ============================================
-- 
-- Opção 1: Usando psql com DATABASE_URL
-- psql "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" -f create_customer_user.sql
--
-- Opção 2: Usando psql com parâmetros separados
-- psql -h ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech -U neondb_owner -d neondb -f create_customer_user.sql
-- (Será solicitada a password: npg_aMgk1osmjh7X)
--
-- Opção 3: Executar linha por linha no cliente PostgreSQL de sua preferência
-- (pgAdmin, DBeaver, etc.) usando as credenciais:
-- Host: ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech
-- User: neondb_owner  
-- Password: npg_aMgk1osmjh7X
-- Database: neondb
-- SSL: require
-- ============================================

-- Passo 1: Verificar usuários atuais (opcional)
SELECT user_id, email, first_name, last_name, role_id, created_at 
FROM users 
ORDER BY created_at;

-- Passo 2: Remover o usuário cliente incorreto
-- (user_id: '04a21ce2-4cbe-496f-a5b2-e6b9fb650a72')
DELETE FROM users WHERE user_id = '04a21ce2-4cbe-496f-a5b2-e6b9fb650a72';

-- Passo 3: Inserir o novo usuário cliente com dados corretos
INSERT INTO users (
    clerk_id,
    email,
    first_name,
    last_name,
    company_name,
    role_id,
    password_hash
) VALUES (
    'local_customer_001', -- clerk_id para sistema local
    'cliente@mike.com',
    'Cliente',
    'Teste',
    'Mike Company',
    2, -- role_id 2 = customer (conforme schema)
    '$2b$10$T.rtEorqn27GW7o1XueWFuwLADsoDM0A59gH6fH/joejLtzVodKxG' -- hash da password "2585"
);

-- Passo 4: Verificar se o usuário foi criado corretamente
SELECT 
    user_id,
    clerk_id,
    email,
    first_name,
    last_name,
    company_name,
    role_id,
    created_at
FROM users 
WHERE email = 'cliente@mike.com';

-- Passo 5: Verificar todos os usuários finais (opcional)
SELECT 
    user_id,
    email,
    first_name,
    last_name,
    company_name,
    r.role_name,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.role_id
ORDER BY u.created_at;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Deve ter 2 usuários:
-- 1. Admin: g.art.shine@gmail.com (role: admin)
-- 2. Cliente: cliente@mike.com (role: customer) - password: 2585
-- ============================================ 