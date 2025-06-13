-- Fase 2: Lógica de Negócio, Utilizadores e Permissões
-- Este script cria as tabelas essenciais para a lógica de negócio do projeto,
-- incluindo um sistema de Role-Based Access Control (RBAC), uma tabela de utilizadores
-- e a estrutura para a gestão de encomendas.

-- Habilitar a extensão para gerar UUIDs, caso ainda não esteja ativa.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

-- 1. Tabela de Roles (Cargos/Funções)
-- Define os diferentes tipos de utilizadores no sistema (ex: Admin, Cliente).
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Permissions (Permissões)
-- Define ações granulares que podem ser permitidas ou negadas (ex: ver preço, fazer encomenda).
CREATE TABLE IF NOT EXISTS permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Junção Role-Permissions
-- Associa permissões a roles, definindo o que cada role pode fazer.
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Tabela de Utilizadores (Users)
-- Armazena dados específicos da nossa aplicação, ligados à conta do Clerk.
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    role_id INTEGER REFERENCES roles(role_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Encomendas (Orders)
-- Cabeçalho de cada encomenda feita por um utilizador.
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    order_status VARCHAR(50) NOT NULL DEFAULT 'pending_approval' CHECK (order_status IN ('pending_approval', 'approved', 'shipped', 'delivered', 'cancelled', 'rejected')),
    total_amount NUMERIC(12, 2) NOT NULL,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Itens da Encomenda (Order Items)
-- Linhas de detalhe para cada encomenda, ligando ao produto específico.
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_ean VARCHAR(20) NOT NULL, -- Ligação intencionalmente "solta" para manter histórico mesmo se o produto for apagado. FOREIGN KEY adicionada na Fase 3.
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase NUMERIC(10, 2) NOT NULL,
    product_name VARCHAR(255) NOT NULL -- Denormalizado para performance e histórico.
);

-- Seed de Dados Iniciais para Roles e Permissions
-- Insere os cargos e permissões base para o sistema funcionar.
INSERT INTO roles (role_name, description) VALUES
('admin', 'Administrador com acesso total ao sistema.'),
('customer', 'Cliente B2B com acesso a preços e encomendas.')
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO permissions (permission_name, description) VALUES
('view_products', 'Pode ver a lista de produtos e detalhes públicos.'),
('view_price', 'Pode ver os preços dos produtos.'),
('view_stock', 'Pode ver a disponibilidade de stock dos produtos.'),
('place_order', 'Pode criar e submeter novas encomendas.'),
('view_own_orders', 'Pode ver o histórico das suas próprias encomendas.'),
('manage_all_orders', 'Pode ver e gerir todas as encomendas (Admin).'),
('manage_users', 'Pode criar, editar e apagar utilizadores (Admin).'),
('manage_products', 'Pode criar, editar e apagar produtos (Admin).'),
('manage_roles_permissions', 'Pode gerir cargos e permissões (Super-Admin).')
ON CONFLICT (permission_name) DO NOTHING;

-- Associar Permissões aos Cargos
-- Define o que cada cargo pode fazer por defeito.
DO $$
DECLARE
    admin_role_id INT;
    customer_role_id INT;
BEGIN
    SELECT role_id INTO admin_role_id FROM roles WHERE role_name = 'admin';
    SELECT role_id INTO customer_role_id FROM roles WHERE role_name = 'customer';

    -- Permissões do Cliente
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT customer_role_id, p.permission_id FROM permissions p
    WHERE p.permission_name IN ('view_products', 'view_price', 'view_stock', 'place_order', 'view_own_orders')
    ON CONFLICT DO NOTHING;

    -- Permissões do Admin (todas)
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT admin_role_id, p.permission_id FROM permissions p
    ON CONFLICT DO NOTHING;
END $$;


COMMIT;

-- Adicionar triggers para atualizar 'updated_at' automaticamente
-- (Opcional mas recomendado. Adicionado aqui para completude da Fase 2)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger às tabelas relevantes
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp(); 