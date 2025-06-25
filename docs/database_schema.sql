-- ============================================
-- SCHEMA ATUALIZADO DA BASE DE DADOS
-- Gerado automaticamente baseado na inspeção real
-- Data: 2025-06-25T13:53:35.379Z
-- Base de Dados: neondb
-- PostgreSQL: PostgreSQL 17.5 on aarch64-unknown-linux-gnu, compiled by gcc (Debian 12.2.0-14+deb12u1) 12.2.0, 64-bit
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";

-- ============================================
-- TABELAS
-- ============================================

-- Tabela: roles
CREATE TABLE IF NOT EXISTS roles (
    role_id integer NOT NULL DEFAULT nextval('roles_role_id_seq'::regclass),
    role_name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE roles IS 'Tabela com 2 registos. Última inspeção: 2025-06-25';

-- Tabela: permissions
CREATE TABLE IF NOT EXISTS permissions (
    permission_id integer NOT NULL DEFAULT nextval('permissions_permission_id_seq'::regclass),
    permission_name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE permissions IS 'Tabela com 9 registos. Última inspeção: 2025-06-25';

-- Tabela: role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);
COMMENT ON TABLE role_permissions IS 'Tabela com 13 registos. Última inspeção: 2025-06-25';

-- Tabela: users
CREATE TABLE IF NOT EXISTS users (
    user_id uuid NOT NULL DEFAULT gen_random_uuid(),
    clerk_id character varying(255),
    email character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    company_name character varying(255),
    role_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    password_hash text,
    is_active boolean DEFAULT true,
    phone character varying(20)
);
COMMENT ON TABLE users IS 'Tabela com 6 registos. Última inspeção: 2025-06-25';

-- Tabela: price_lists
CREATE TABLE IF NOT EXISTS price_lists (
    price_list_id integer NOT NULL DEFAULT nextval('price_lists_price_list_id_seq'::regclass),
    name text NOT NULL,
    description text
);
COMMENT ON TABLE price_lists IS 'Tabela com 4 registos. Última inspeção: 2025-06-25';

-- Tabela: categories
CREATE TABLE IF NOT EXISTS categories (
    categoryid text NOT NULL,
    name text,
    path text,
    parent_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE categories IS 'Tabela com 416 registos. Última inspeção: 2025-06-25';

-- Tabela: products
CREATE TABLE IF NOT EXISTS products (
    ean text NOT NULL,
    productid text,
    name text,
    shortdescription text,
    longdescription text,
    brand text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_featured boolean DEFAULT false
);
COMMENT ON TABLE products IS 'Tabela com 8126 registos. Última inspeção: 2025-06-25';

-- Tabela: geko_products
CREATE TABLE IF NOT EXISTS geko_products (
    ean text NOT NULL,
    supplier_price numeric(12,4),
    stock_quantity integer,
    last_sync timestamp with time zone,
    raw_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    geko_product_id_attr text,
    geko_code_attr text
);
COMMENT ON TABLE geko_products IS 'Tabela com 8122 registos. Última inspeção: 2025-06-25';

-- Tabela: product_variants
CREATE TABLE IF NOT EXISTS product_variants (
    variantid text NOT NULL,
    ean text,
    name text,
    stockquantity integer,
    supplier_price numeric(12,4),
    is_on_sale boolean DEFAULT false
);
COMMENT ON TABLE product_variants IS 'Tabela com 8126 registos. Última inspeção: 2025-06-25';

-- Tabela: product_categories
CREATE TABLE IF NOT EXISTS product_categories (
    product_ean text NOT NULL,
    category_id text NOT NULL
);
COMMENT ON TABLE product_categories IS 'Tabela com 8122 registos. Última inspeção: 2025-06-25';

-- Tabela: product_images
CREATE TABLE IF NOT EXISTS product_images (
    imageid integer NOT NULL DEFAULT nextval('product_images_imageid_seq'::regclass),
    ean text,
    url text,
    alt text,
    is_primary boolean DEFAULT false
);
COMMENT ON TABLE product_images IS 'Tabela com 31511 registos. Última inspeção: 2025-06-25';

-- Tabela: product_attributes
CREATE TABLE IF NOT EXISTS product_attributes (
    attributeid integer NOT NULL DEFAULT nextval('product_attributes_attributeid_seq'::regclass),
    product_ean text,
    key text,
    value text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE product_attributes IS 'Tabela com 4240 registos. Última inspeção: 2025-06-25';

-- Tabela: prices
CREATE TABLE IF NOT EXISTS prices (
    priceid integer NOT NULL DEFAULT nextval('prices_priceid_seq'::regclass),
    price_list_id integer NOT NULL,
    price numeric(12,4) NOT NULL,
    variantid text NOT NULL
);
COMMENT ON TABLE prices IS 'Tabela com 16245 registos. Última inspeção: 2025-06-25';

-- Tabela: orders
CREATE TABLE IF NOT EXISTS orders (
    order_id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    order_status character varying(50) NOT NULL DEFAULT 'pending_approval'::character varying,
    total_amount numeric(12,2) NOT NULL,
    order_date timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE orders IS 'Tabela com 4 registos. Última inspeção: 2025-06-25';

-- Tabela: order_items
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id uuid NOT NULL DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    product_ean character varying(20) NOT NULL,
    quantity integer NOT NULL,
    price_at_purchase numeric(10,2) NOT NULL,
    product_name character varying(255) NOT NULL
);
COMMENT ON TABLE order_items IS 'Tabela com 8 registos. Última inspeção: 2025-06-25';

-- Tabela: units
CREATE TABLE IF NOT EXISTS units (
    geko_unit_id text NOT NULL,
    name text,
    moq integer
);
COMMENT ON TABLE units IS 'Tabela com 7 registos. Última inspeção: 2025-06-25';

-- Tabela: producers
CREATE TABLE IF NOT EXISTS producers (
    geko_producer_id text NOT NULL,
    name text
);
COMMENT ON TABLE producers IS 'Tabela com 5 registos. Última inspeção: 2025-06-25';

-- Tabela: pricing_config
CREATE TABLE IF NOT EXISTS pricing_config (
    config_id integer NOT NULL DEFAULT nextval('pricing_config_config_id_seq'::regclass),
    config_key character varying(100) NOT NULL,
    config_value text NOT NULL,
    description text,
    data_type character varying(20) DEFAULT 'string'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE pricing_config IS 'Tabela com 5 registos. Última inspeção: 2025-06-25';

-- Tabela: system_settings
CREATE TABLE IF NOT EXISTS system_settings (
    setting_id integer NOT NULL DEFAULT nextval('system_settings_setting_id_seq'::regclass),
    setting_key character varying(100) NOT NULL,
    setting_value text,
    setting_type character varying(50) DEFAULT 'string'::character varying,
    category character varying(50) DEFAULT 'general'::character varying,
    description text,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE system_settings IS 'Tabela com 16 registos. Última inspeção: 2025-06-25';

-- Tabela: content_banners
CREATE TABLE IF NOT EXISTS content_banners (
    banner_id integer NOT NULL DEFAULT nextval('content_banners_banner_id_seq'::regclass),
    title character varying(255) NOT NULL,
    subtitle text,
    image_url text,
    link_url text,
    button_text character varying(100),
    position character varying(50) DEFAULT 'homepage'::character varying,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE content_banners IS 'Tabela com 0 registos. Última inspeção: 2025-06-25';

-- Tabela: attributes
CREATE TABLE IF NOT EXISTS attributes (
    id_attributes integer NOT NULL DEFAULT nextval('attributes_id_attributes_seq'::regclass),
    geko_feature_id character varying(64),
    name character varying(255),
    type character varying(32)
);
COMMENT ON TABLE attributes IS 'Tabela com 0 registos. Última inspeção: 2025-06-25';

-- Tabela: product_sizes
CREATE TABLE IF NOT EXISTS product_sizes (
    id_product_sizes integer NOT NULL DEFAULT nextval('product_sizes_id_product_sizes_seq'::regclass),
    product_id_products integer,
    geko_size_code character varying(64),
    producer_size_code character varying(64),
    name character varying(255)
);
COMMENT ON TABLE product_sizes IS 'Tabela com 0 registos. Última inspeção: 2025-06-25';

-- Tabela: stock_levels
CREATE TABLE IF NOT EXISTS stock_levels (
    geko_variant_stock_id text,
    quantity numeric
);
COMMENT ON TABLE stock_levels IS 'Tabela com 2852 registos. Última inspeção: 2025-06-25';

-- ============================================
-- CONSTRAINTS E FOREIGN KEYS
-- ============================================

ALTER TABLE attributes ADD CONSTRAINT attributes_pkey PRIMARY KEY (id_attributes);
ALTER TABLE categories ADD CONSTRAINT categories_pkey1 PRIMARY KEY (categoryid);
ALTER TABLE content_banners ADD CONSTRAINT content_banners_pkey PRIMARY KEY (banner_id);
ALTER TABLE geko_products ADD CONSTRAINT geko_products_pkey PRIMARY KEY (ean);
ALTER TABLE order_items ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);
ALTER TABLE orders ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);
ALTER TABLE permissions ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);
ALTER TABLE price_lists ADD CONSTRAINT price_lists_pkey PRIMARY KEY (price_list_id);
ALTER TABLE prices ADD CONSTRAINT prices_pkey PRIMARY KEY (priceid);
ALTER TABLE pricing_config ADD CONSTRAINT pricing_config_pkey PRIMARY KEY (config_id);
ALTER TABLE producers ADD CONSTRAINT producers_pkey PRIMARY KEY (geko_producer_id);
ALTER TABLE product_attributes ADD CONSTRAINT product_attributes_pkey1 PRIMARY KEY (attributeid);
ALTER TABLE product_categories ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_ean, category_id);
ALTER TABLE product_images ADD CONSTRAINT product_images_pkey PRIMARY KEY (imageid);
ALTER TABLE product_sizes ADD CONSTRAINT product_sizes_pkey PRIMARY KEY (id_product_sizes);
ALTER TABLE product_variants ADD CONSTRAINT product_variants_pkey PRIMARY KEY (variantid);
ALTER TABLE products ADD CONSTRAINT products_pkey1 PRIMARY KEY (ean);
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);
ALTER TABLE roles ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);
ALTER TABLE system_settings ADD CONSTRAINT system_settings_pkey PRIMARY KEY (setting_id);
ALTER TABLE units ADD CONSTRAINT units_pkey PRIMARY KEY (geko_unit_id);
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);

-- Foreign Keys
ALTER TABLE order_items ADD CONSTRAINT FK_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT FK_orders_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE prices ADD CONSTRAINT FK_prices_price_list_id FOREIGN KEY (price_list_id) REFERENCES price_lists(price_list_id) ON DELETE CASCADE;
ALTER TABLE prices ADD CONSTRAINT FK_prices_variantid FOREIGN KEY (variantid) REFERENCES product_variants(variantid) ON DELETE CASCADE;
ALTER TABLE product_attributes ADD CONSTRAINT FK_product_attributes_product_ean FOREIGN KEY (product_ean) REFERENCES products(ean) ON DELETE CASCADE;
ALTER TABLE product_categories ADD CONSTRAINT FK_product_categories_category_id FOREIGN KEY (category_id) REFERENCES categories(categoryid) ON DELETE CASCADE;
ALTER TABLE product_categories ADD CONSTRAINT FK_product_categories_product_ean FOREIGN KEY (product_ean) REFERENCES products(ean) ON DELETE CASCADE;
ALTER TABLE product_images ADD CONSTRAINT FK_product_images_ean FOREIGN KEY (ean) REFERENCES products(ean) ON DELETE CASCADE;
ALTER TABLE product_variants ADD CONSTRAINT FK_product_variants_ean FOREIGN KEY (ean) REFERENCES products(ean) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT FK_role_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT FK_role_permissions_role_id FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE;
ALTER TABLE users ADD CONSTRAINT FK_users_role_id FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL;

-- ============================================
-- TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para categories
DROP TRIGGER IF EXISTS set_timestamp_categories ON categories;
CREATE TRIGGER set_timestamp_categories
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger para geko_products
DROP TRIGGER IF EXISTS set_timestamp_geko_products ON geko_products;
CREATE TRIGGER set_timestamp_geko_products
    BEFORE UPDATE ON geko_products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger para orders
DROP TRIGGER IF EXISTS set_timestamp_orders ON orders;
CREATE TRIGGER set_timestamp_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger para pricing_config
DROP TRIGGER IF EXISTS set_timestamp_pricing_config ON pricing_config;
CREATE TRIGGER set_timestamp_pricing_config
    BEFORE UPDATE ON pricing_config
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger para product_attributes
DROP TRIGGER IF EXISTS set_timestamp_product_attributes ON product_attributes;
CREATE TRIGGER set_timestamp_product_attributes
    BEFORE UPDATE ON product_attributes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger para products
DROP TRIGGER IF EXISTS set_timestamp_products ON products;
CREATE TRIGGER set_timestamp_products
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger para users
DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();


-- ============================================
-- DADOS ESSENCIAIS
-- ============================================

-- Roles essenciais
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'admin', 'Administrador com acesso total ao sistema.')
ON CONFLICT (role_id) DO UPDATE SET description = EXCLUDED.description;
INSERT INTO roles (role_id, role_name, description) VALUES
(2, 'customer', 'Cliente com acesso a preços, stock e criação de encomendas.')
ON CONFLICT (role_id) DO UPDATE SET description = EXCLUDED.description;

-- Permissões essenciais
INSERT INTO permissions (permission_id, permission_name, description) VALUES
(1, 'view_products', 'Pode ver a lista de produtos e detalhes públicos.')
ON CONFLICT (permission_id) DO UPDATE SET description = EXCLUDED.description;
INSERT INTO permissions (permission_id, permission_name, description) VALUES
(2, 'view_price', 'Pode ver os preços dos produtos.')
ON CONFLICT (permission_id) DO UPDATE SET description = EXCLUDED.description;
INSERT INTO permissions (permission_id, permission_name, description) VALUES
(3, 'view_stock', 'Pode ver a quantidade de stock dos produtos.')
ON CONFLICT (permission_id) DO UPDATE SET description = EXCLUDED.description;

-- Price Lists essenciais
INSERT INTO price_lists (price_list_id, name, description) VALUES
(4, 'Preço Cliente', 'Preços com margem aplicada sobre fornecedor')
ON CONFLICT (price_list_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO price_lists (price_list_id, name, description) VALUES
(1, 'Supplier Price', 'Custo de fornecedor (base da variante)')
ON CONFLICT (price_list_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO price_lists (price_list_id, name, description) VALUES
(2, 'Base Selling Price', 'Preço de venda base (+25% markup sobre custo fornecedor da variante)')
ON CONFLICT (price_list_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
