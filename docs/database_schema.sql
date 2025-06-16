-- =======================================================================================
-- Schema da Base de Dados do Projeto IDEA (Pós-Refatoração - Fases 1 & 2)
--
-- Data da Última Atualização: 2025-06-14
-- Versão do Schema: 2.1 (Idempotente)
--
-- Descrição:
-- Este documento representa o estado atual e consolidado da base de dados após a
-- execução das migrações V1 e V2. Ele serve como a referência principal (source of truth)
-- para a estrutura de todas as tabelas, tipos de dados e relacionamentos.
-- Versão 2.1 foi tornada idempotente para permitir execuções seguras múltiplas.
-- =======================================================================================

-- Habilita a extensão para gerar UUIDs, caso ainda não esteja ativa.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Tabelas de Catálogo de Produtos (Após Fase 1)
-- ============================================

-- Tabela principal de produtos. O EAN é a chave de negócio primária.
CREATE TABLE IF NOT EXISTS products (
    ean TEXT PRIMARY KEY,
    productid TEXT UNIQUE, -- ID legado, mantido para referência
    name TEXT,
    shortdescription TEXT,
    longdescription TEXT,
    brand TEXT,
    active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false, -- Para destaque na Home Page carousel
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE products IS 'Tabela principal de produtos. EAN é a chave primária de negócio. Inclui flag para destaque.';

-- Tabela para armazenar dados originais da API Geko (Fase 3)
CREATE TABLE IF NOT EXISTS geko_products (
    ean TEXT PRIMARY KEY,
    supplier_price NUMERIC(12,4), -- Preço original da Geko (fornecedor)
    stock_quantity INTEGER,        -- Stock da Geko
    last_sync TIMESTAMPTZ,         -- Última sincronização
    raw_data JSONB,                -- XML original para auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE geko_products IS 'Dados originais da API Geko XML. Preços são de fornecedor (aplicar margem).';

-- Tabela de categorias com hierarquia baseada em path.
CREATE TABLE IF NOT EXISTS categories (
    categoryid TEXT PRIMARY KEY,
    name TEXT,
    "path" TEXT,
    parent_id TEXT, -- ID legado, a hierarquia é gerida pela coluna "path"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE categories IS 'Categorias de produtos. A hierarquia é definida pela coluna "path".';

-- Tabela de junção entre produtos e categorias.
CREATE TABLE IF NOT EXISTS product_categories (
    product_ean TEXT,
    category_id TEXT,
    PRIMARY KEY (product_ean, category_id)
);
COMMENT ON TABLE product_categories IS 'Mapeamento muitos-para-muitos entre produtos e categorias.';

-- Tabela para imagens dos produtos.
CREATE TABLE IF NOT EXISTS product_images (
    imageid SERIAL PRIMARY KEY,
    ean TEXT,
    "url" TEXT,
    alt TEXT,
    is_primary BOOLEAN DEFAULT false,
    UNIQUE(ean, "url")
);
COMMENT ON TABLE product_images IS 'Armazena as URLs das imagens para cada produto. Garante unicidade por ean e url.';

-- Tabela para variantes de produtos (ex: cor, tamanho).
-- O stock foi movido para aqui na refatoração.
CREATE TABLE IF NOT EXISTS product_variants (
    variantid TEXT PRIMARY KEY,
    ean TEXT,
    name TEXT,
    stockquantity INTEGER,
    supplier_price NUMERIC(12,4),
    is_on_sale BOOLEAN DEFAULT false, -- Para indicar se a variante está em promoção
    FOREIGN KEY (ean) REFERENCES products(ean) ON DELETE CASCADE -- Adicionada FK aqui
);
COMMENT ON TABLE product_variants IS 'Variantes de um produto (SKUs). O stock e preço de fornecedor são geridos a este nível. Inclui flag de promoção.';

-- Tabela para atributos (características técnicas) dos produtos.
CREATE TABLE IF NOT EXISTS product_attributes (
    attributeid SERIAL PRIMARY KEY,
    product_ean TEXT,
    "key" TEXT,
    "value" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_ean, "key")
);
COMMENT ON TABLE product_attributes IS 'Pares chave-valor para as especificações técnicas de um produto. Garante unicidade por produto e chave de atributo.';


-- ============================================
-- Sistema de Preços (Após Fase 1)
-- ============================================

-- Tabela para definir diferentes listas de preços (ex: Retalho, Revenda).
CREATE TABLE IF NOT EXISTS price_lists (
    price_list_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);
COMMENT ON TABLE price_lists IS 'Define diferentes tipos de listas de preços (ex: Base, Promoção, Revendedor).';

-- Tabela de preços que associa um produto e uma lista de preços a um valor.
-- Modificada para ser baseada em variantid para preços de venda ao público.
CREATE TABLE IF NOT EXISTS prices (
    priceid SERIAL PRIMARY KEY,
    -- product_ean TEXT NOT NULL, -- Removido, preço agora é por variante
    variantid TEXT NOT NULL, -- Adicionado para ligar ao product_variants
    price_list_id INTEGER NOT NULL,
    price NUMERIC(12, 4) NOT NULL,
    UNIQUE(variantid, price_list_id),
    FOREIGN KEY (variantid) REFERENCES product_variants(variantid) ON DELETE CASCADE, -- Nova FK
    FOREIGN KEY (price_list_id) REFERENCES price_lists(price_list_id) ON DELETE CASCADE
);
COMMENT ON TABLE prices IS 'Associa um preço a uma variante de produto para uma determinada lista de preços.';


-- ============================================
-- Tabelas de Utilizadores, RBAC e Encomendas (Fase 2)
-- ============================================

-- Tabela de Roles (Cargos/Funções).
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE roles IS 'Define os diferentes tipos de utilizadores no sistema (ex: Admin, Cliente).';

-- Tabela de Permissions (Permissões).
CREATE TABLE IF NOT EXISTS permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE permissions IS 'Define ações granulares que podem ser permitidas ou negadas (ex: view_price).';

-- Tabela de junção para associar permissões a roles (Muitos-para-Muitos).
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
COMMENT ON TABLE role_permissions IS 'Associa permissões a roles, definindo o que cada role pode fazer.';

-- Tabela de Utilizadores, ligada ao sistema de autenticação Clerk.
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
COMMENT ON TABLE users IS 'Armazena dados de negócio dos utilizadores, sincronizados com o Clerk.';

-- Tabela para o cabeçalho das encomendas.
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    order_status VARCHAR(50) NOT NULL DEFAULT 'pending_approval' CHECK (order_status IN ('pending_approval', 'approved', 'shipped', 'delivered', 'cancelled', 'rejected')),
    total_amount NUMERIC(12, 2) NOT NULL,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE orders IS 'Armazena o cabeçalho de cada encomenda de um utilizador.';

-- Tabela para os itens de cada encomenda.
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_ean VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase NUMERIC(10, 2) NOT NULL,
    product_name VARCHAR(255) NOT NULL -- Denormalizado para performance e histórico
);
COMMENT ON TABLE order_items IS 'Armazena as linhas de produtos para cada encomenda.';


-- ============================================
-- Fase 3: Relações e Integridade Referencial
-- ============================================

-- Adicionar chaves estrangeiras para garantir a integridade dos dados.
-- Estas constraints são adicionadas no final para evitar problemas de ordem de criação de tabelas.

-- Relações da tabela de junção product_categories
ALTER TABLE product_categories DROP CONSTRAINT IF EXISTS fk_pc_product_ean;
ALTER TABLE product_categories ADD CONSTRAINT fk_pc_product_ean FOREIGN KEY (product_ean) REFERENCES products(ean) ON DELETE CASCADE;
ALTER TABLE product_categories DROP CONSTRAINT IF EXISTS fk_pc_category_id;
ALTER TABLE product_categories ADD CONSTRAINT fk_pc_category_id FOREIGN KEY (category_id) REFERENCES categories(categoryid) ON DELETE CASCADE;

-- Relações da tabela product_images
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS fk_pi_product_ean;
ALTER TABLE product_images ADD CONSTRAINT fk_pi_product_ean FOREIGN KEY (ean) REFERENCES products(ean) ON DELETE CASCADE;

-- Relações da tabela product_variants
-- ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS fk_pv_product_ean; -- Esta linha já está no schema, mas a FK está definida inline acima agora
-- ALTER TABLE product_variants ADD CONSTRAINT fk_pv_product_ean FOREIGN KEY (ean) REFERENCES products(ean) ON DELETE CASCADE;

-- Relações da tabela product_attributes
ALTER TABLE product_attributes DROP CONSTRAINT IF EXISTS fk_pa_product_ean;
ALTER TABLE product_attributes ADD CONSTRAINT fk_pa_product_ean FOREIGN KEY (product_ean) REFERENCES products(ean) ON DELETE CASCADE;

-- Relações da tabela prices
ALTER TABLE prices DROP CONSTRAINT IF EXISTS fk_p_product_ean;
ALTER TABLE prices ADD CONSTRAINT fk_p_product_ean FOREIGN KEY (product_ean) REFERENCES products(ean) ON DELETE CASCADE;
ALTER TABLE prices DROP CONSTRAINT IF EXISTS fk_p_price_list_id;
ALTER TABLE prices ADD CONSTRAINT fk_p_price_list_id FOREIGN KEY (price_list_id) REFERENCES price_lists(price_list_id) ON DELETE CASCADE;

-- Relações da tabela geko_products
-- A constraint fk_gp_product_ean foi REMOVIDA. A tabela geko_products é uma tabela de staging
-- e não deve ter uma FK para a tabela products, pois os produtos podem ainda não existir em 'products'
-- quando são inicialmente carregados do feed Geko.
-- A integridade será garantida no processo de ETL que move dados de geko_products para products.


-- ============================================
-- Funções e Triggers
-- ============================================

-- Função para atualizar o campo 'updated_at' automaticamente.
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger às tabelas relevantes
-- Não é necessário verificar a existência de triggers de uma forma simples em SQL,
-- mas a sua re-criação com CREATE OR REPLACE na função é segura.
-- Vamos assumir que se a tabela existe, o trigger também pode ser aplicado.

DROP TRIGGER IF EXISTS set_timestamp_products ON products;
CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_categories ON categories;
CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_orders ON orders;
CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_geko_products ON geko_products;
CREATE TRIGGER set_timestamp_geko_products
BEFORE UPDATE ON geko_products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Adicionar trigger para product_attributes
DROP TRIGGER IF EXISTS set_timestamp_product_attributes ON product_attributes;
CREATE TRIGGER set_timestamp_product_attributes
BEFORE UPDATE ON product_attributes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- ============================================
-- Inserções de Dados Base (Idempotentes)
-- ============================================

-- Inserir roles essenciais se não existirem
INSERT INTO roles (role_name, description) VALUES
('admin', 'Administrador com acesso total ao sistema.'),
('customer', 'Cliente com acesso a preços, stock e criação de encomendas.')
ON CONFLICT (role_name) DO NOTHING;

-- Inserir price_lists essenciais se não existirem (Adicionado)
INSERT INTO price_lists (price_list_id, name, description) VALUES
(1, 'Supplier Price', 'Custo de fornecedor (base da variante)'),
(2, 'Base Selling Price', 'Preço de venda base (markup sobre custo fornecedor da variante)'),
(3, 'Promotional Price', 'Preço promocional temporário')
ON CONFLICT (price_list_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Inserir permissões granulares se não existirem
INSERT INTO permissions (permission_name, description) VALUES
('view_products', 'Pode ver a lista de produtos e detalhes públicos.'),
('view_price', 'Pode ver os preços dos produtos.'),
('view_stock', 'Pode ver a quantidade de stock dos produtos.'),
('create_order', 'Pode criar novas encomendas.'),
('manage_orders', 'Pode ver e gerir todas as encomendas (aprovar, rejeitar, etc).'),
('manage_products', 'Pode criar, editar e apagar produtos.'),
('manage_users', 'Pode criar e gerir utilizadores e os seus cargos.'),
('manage_settings', 'Pode gerir as configurações do site.')
ON CONFLICT (permission_name) DO NOTHING;

-- Associar permissões aos cargos
-- O 'customer' pode ver produtos, preços, stock e criar encomendas.
WITH customer_role AS (
  SELECT role_id FROM roles WHERE role_name = 'customer'
),
customer_permissions AS (
  SELECT permission_id FROM permissions WHERE permission_name IN ('view_products', 'view_price', 'view_stock', 'create_order')
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT customer_role.role_id, customer_permissions.permission_id
FROM customer_role, customer_permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- O 'admin' tem todas as permissões.
WITH admin_role AS (
  SELECT role_id FROM roles WHERE role_name = 'admin'
),
all_permissions AS (
  SELECT permission_id FROM permissions
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT admin_role.role_id, all_permissions.permission_id
FROM admin_role, all_permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;


-- ============================================
-- FIM DO SCHEMA
-- ============================================
