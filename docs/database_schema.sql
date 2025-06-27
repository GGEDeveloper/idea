-- ============================================
-- SCHEMA ATUALIZADO DA BASE DE DADOS
-- Gerado automaticamente baseado na inspeção real
-- Data: 2025-06-27T09:43:08.816Z
-- Base de Dados: neondb
-- PostgreSQL: PostgreSQL 17.5 on aarch64-unknown-linux-gnu
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";

-- ============================================
-- TABELAS
-- ============================================

-- Tabela: admin_notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
    notification_id uuid NOT NULL DEFAULT gen_random_uuid(),
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    priority character varying(20) DEFAULT 'normal'::character varying,
    related_entity_type character varying(50),
    related_entity_id uuid,
    action_url character varying(255),
    target_admin_id uuid,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    read_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    action_text character varying(100),
    expires_at timestamp without time zone
);
COMMENT ON TABLE admin_notifications IS 'Tabela com 5 registos. Última inspeção: 2025-06-27';

-- Tabela: attributes
CREATE TABLE IF NOT EXISTS attributes (
    id_attributes integer NOT NULL DEFAULT nextval('attributes_id_attributes_seq'::regclass),
    udt_catalog name,
    udt_schema name,
    geko_feature_id character varying(64),
    udt_name name,
    name character varying(255),
    attribute_name name,
    type character varying(32),
    ordinal_position integer,
    attribute_default character varying,
    is_nullable character varying(3),
    data_type character varying,
    character_maximum_length integer,
    character_octet_length integer,
    character_set_catalog name,
    character_set_schema name,
    character_set_name name,
    collation_catalog name,
    collation_schema name,
    collation_name name,
    numeric_precision integer,
    numeric_precision_radix integer,
    numeric_scale integer,
    datetime_precision integer,
    interval_type character varying,
    interval_precision integer,
    attribute_udt_catalog name,
    attribute_udt_schema name,
    attribute_udt_name name,
    scope_catalog name,
    scope_schema name,
    scope_name name,
    maximum_cardinality integer,
    dtd_identifier name,
    is_derived_reference_attribute character varying(3)
);
COMMENT ON TABLE attributes IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: bulk_price_operations
CREATE TABLE IF NOT EXISTS bulk_price_operations (
    operation_id integer NOT NULL DEFAULT nextval('bulk_price_operations_operation_id_seq'::regclass),
    operation_type character varying(50) NOT NULL,
    operation_name character varying(255) NOT NULL,
    filter_criteria jsonb,
    operation_data jsonb,
    affected_count integer DEFAULT 0,
    status character varying(50) DEFAULT 'pending'::character varying,
    error_message text,
    created_by uuid NOT NULL,
    executed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE bulk_price_operations IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: campaign_prices
CREATE TABLE IF NOT EXISTS campaign_prices (
    campaign_price_id integer NOT NULL DEFAULT nextval('campaign_prices_campaign_price_id_seq'::regclass),
    campaign_id integer NOT NULL,
    variantid text NOT NULL,
    promotional_price numeric(12,4) NOT NULL,
    priority integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE campaign_prices IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: categories
CREATE TABLE IF NOT EXISTS categories (
    categoryid text NOT NULL,
    name text,
    path text,
    parent_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE categories IS 'Tabela com 416 registos. Última inspeção: 2025-06-27';

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
COMMENT ON TABLE content_banners IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: content_pages
CREATE TABLE IF NOT EXISTS content_pages (
    page_id integer NOT NULL DEFAULT nextval('content_pages_page_id_seq'::regclass),
    slug character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    is_active boolean DEFAULT true,
    meta_title character varying(255),
    meta_description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE content_pages IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: customer_addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    address_id uuid NOT NULL DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL,
    address_type character varying(20) NOT NULL,
    company_name character varying(255),
    street_address text NOT NULL,
    postal_code character varying(20),
    city character varying(100),
    country character varying(50) DEFAULT 'Portugal'::character varying,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE customer_addresses IS 'Tabela com 5 registos. Última inspeção: 2025-06-27';

-- Tabela: customer_admin_data
CREATE TABLE IF NOT EXISTS customer_admin_data (
    admin_data_id uuid NOT NULL DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL,
    credit_limit numeric(12,2),
    payment_terms integer,
    discount_percentage numeric(5,2),
    admin_notes text,
    risk_assessment character varying(50),
    coface_info text,
    coface_rating character varying(10),
    account_manager_id uuid,
    preferred_currency character varying(3) DEFAULT 'EUR'::character varying,
    tax_exempt boolean DEFAULT false,
    created_by uuid,
    updated_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE customer_admin_data IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: customer_audit_log
CREATE TABLE IF NOT EXISTS customer_audit_log (
    log_id uuid NOT NULL DEFAULT gen_random_uuid(),
    customer_id uuid,
    table_affected character varying(50) NOT NULL,
    record_id uuid,
    action_type character varying(50) NOT NULL,
    action_description text,
    old_values jsonb,
    new_values jsonb,
    changed_fields ARRAY,
    reason text,
    ip_address inet,
    user_agent text,
    performed_by uuid NOT NULL,
    performed_on_behalf_of uuid,
    created_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE customer_audit_log IS 'Tabela com 3 registos. Última inspeção: 2025-06-27';

-- Tabela: customer_banks
CREATE TABLE IF NOT EXISTS customer_banks (
    bank_id uuid NOT NULL DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL,
    bank_name character varying(100) NOT NULL,
    branch_code character varying(20),
    iban character varying(34),
    swift_code character varying(20),
    manager_name character varying(100),
    manager_phone character varying(20),
    manager_email character varying(255),
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE customer_banks IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: customer_contacts
CREATE TABLE IF NOT EXISTS customer_contacts (
    contact_id uuid NOT NULL DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL,
    contact_type character varying(20) NOT NULL,
    contact_name character varying(100) NOT NULL,
    phone character varying(20),
    email character varying(255),
    position character varying(100),
    department character varying(100),
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE customer_contacts IS 'Tabela com 5 registos. Última inspeção: 2025-06-27';

-- Tabela: customer_suppliers
CREATE TABLE IF NOT EXISTS customer_suppliers (
    supplier_id uuid NOT NULL DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL,
    company_name character varying(255) NOT NULL,
    contact_name character varying(100),
    phone character varying(20),
    email character varying(255),
    location character varying(100),
    website character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE customer_suppliers IS 'Tabela com 2 registos. Última inspeção: 2025-06-27';

-- Tabela: email_configurations
CREATE TABLE IF NOT EXISTS email_configurations (
    config_id uuid NOT NULL DEFAULT gen_random_uuid(),
    config_name character varying(100) NOT NULL,
    description text,
    smtp_host character varying(255) NOT NULL,
    smtp_port integer NOT NULL DEFAULT 587,
    smtp_username character varying(255),
    smtp_password text,
    smtp_secure character varying(10) DEFAULT 'tls'::character varying,
    from_email character varying(255) NOT NULL,
    from_name character varying(255) NOT NULL,
    reply_to character varying(255),
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE email_configurations IS 'Tabela com 2 registos. Última inspeção: 2025-06-27';

-- Tabela: email_logs
CREATE TABLE IF NOT EXISTS email_logs (
    log_id uuid NOT NULL DEFAULT gen_random_uuid(),
    template_key character varying(100),
    config_used character varying(100),
    recipient_email character varying(255) NOT NULL,
    recipient_name character varying(255),
    subject text,
    variables_used jsonb,
    status character varying(50),
    error_message text,
    smtp_response text,
    send_attempts integer DEFAULT 1,
    sent_at timestamp without time zone,
    delivered_at timestamp without time zone,
    opened_at timestamp without time zone,
    clicked_at timestamp without time zone,
    related_customer_id uuid,
    sent_by uuid,
    created_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE email_logs IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: email_templates
CREATE TABLE IF NOT EXISTS email_templates (
    template_id uuid NOT NULL DEFAULT gen_random_uuid(),
    template_key character varying(100) NOT NULL,
    template_name character varying(255) NOT NULL,
    description text,
    subject_template text NOT NULL,
    html_body text NOT NULL,
    text_body text,
    variables_available ARRAY,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE email_templates IS 'Tabela com 2 registos. Última inspeção: 2025-06-27';

-- Tabela: faqs
CREATE TABLE IF NOT EXISTS faqs (
    faq_id integer NOT NULL DEFAULT nextval('faqs_faq_id_seq'::regclass),
    question text NOT NULL,
    answer text NOT NULL,
    category character varying(100) DEFAULT 'geral'::character varying,
    display_order integer DEFAULT 0,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE faqs IS 'Tabela com 6 registos. Última inspeção: 2025-06-27';

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
COMMENT ON TABLE geko_products IS 'Tabela com 8122 registos. Última inspeção: 2025-06-27';

-- Tabela: order_items
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id uuid NOT NULL DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    product_ean character varying(20) NOT NULL,
    quantity integer NOT NULL,
    price_at_purchase numeric(10,2) NOT NULL,
    product_name character varying(255) NOT NULL
);
COMMENT ON TABLE order_items IS 'Tabela com 8 registos. Última inspeção: 2025-06-27';

-- Tabela: orders
CREATE TABLE IF NOT EXISTS orders (
    order_id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    order_status character varying(50) NOT NULL DEFAULT 'pending_approval'::character varying,
    total_amount numeric(12,2) NOT NULL,
    order_date timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE orders IS 'Tabela com 4 registos. Última inspeção: 2025-06-27';

-- Tabela: pending_geko_price_updates
CREATE TABLE IF NOT EXISTS pending_geko_price_updates (
    update_id integer NOT NULL DEFAULT nextval('pending_geko_price_updates_update_id_seq'::regclass),
    ean text NOT NULL,
    current_supplier_price numeric(12,4),
    new_supplier_price numeric(12,4) NOT NULL,
    current_stock_quantity integer,
    new_stock_quantity integer NOT NULL,
    price_change_percentage numeric(10,2),
    geko_sync_batch_id text,
    detected_at timestamp with time zone DEFAULT now(),
    geko_last_sync timestamp with time zone,
    raw_geko_data jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    review_notes text,
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE pending_geko_price_updates IS 'Tabela com 5 registos. Última inspeção: 2025-06-27';

-- Tabela: permissions
CREATE TABLE IF NOT EXISTS permissions (
    permission_id integer NOT NULL DEFAULT nextval('permissions_permission_id_seq'::regclass),
    permission_name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE permissions IS 'Tabela com 10 registos. Última inspeção: 2025-06-27';

-- Tabela: price_campaigns
CREATE TABLE IF NOT EXISTS price_campaigns (
    campaign_id integer NOT NULL DEFAULT nextval('price_campaigns_campaign_id_seq'::regclass),
    name character varying(255) NOT NULL,
    description text,
    campaign_type character varying(50) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    is_active boolean DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE price_campaigns IS 'Tabela com 1 registos. Última inspeção: 2025-06-27';

-- Tabela: price_history
CREATE TABLE IF NOT EXISTS price_history (
    history_id integer NOT NULL DEFAULT nextval('price_history_history_id_seq'::regclass),
    variantid text NOT NULL,
    price_list_id integer NOT NULL,
    old_price numeric(12,4),
    new_price numeric(12,4) NOT NULL,
    changed_by uuid NOT NULL,
    change_reason text,
    changed_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE price_history IS 'Tabela com 48543 registos. Última inspeção: 2025-06-27';

-- Tabela: price_list_assignments
CREATE TABLE IF NOT EXISTS price_list_assignments (
    assignment_id integer NOT NULL DEFAULT nextval('price_list_assignments_assignment_id_seq'::regclass),
    user_id uuid NOT NULL,
    price_list_id integer NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid NOT NULL
);
COMMENT ON TABLE price_list_assignments IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: price_lists
CREATE TABLE IF NOT EXISTS price_lists (
    price_list_id integer NOT NULL DEFAULT nextval('price_lists_price_list_id_seq'::regclass),
    name text NOT NULL,
    description text
);
COMMENT ON TABLE price_lists IS 'Tabela com 4 registos. Última inspeção: 2025-06-27';

-- Tabela: prices
CREATE TABLE IF NOT EXISTS prices (
    priceid integer NOT NULL DEFAULT nextval('prices_priceid_seq'::regclass),
    price_list_id integer NOT NULL,
    price numeric(12,4) NOT NULL,
    variantid text NOT NULL
);
COMMENT ON TABLE prices IS 'Tabela com 24368 registos. Última inspeção: 2025-06-27';

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
COMMENT ON TABLE pricing_config IS 'Tabela com 14 registos. Última inspeção: 2025-06-27';

-- Tabela: pricing_rules
CREATE TABLE IF NOT EXISTS pricing_rules (
    rule_id integer NOT NULL DEFAULT nextval('pricing_rules_rule_id_seq'::regclass),
    name character varying(255) NOT NULL,
    description text,
    rule_type character varying(50) NOT NULL,
    target_value character varying(255) NOT NULL,
    margin_multiplier numeric(10,4) NOT NULL,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    applies_from timestamp with time zone,
    applies_until timestamp with time zone,
    auto_apply boolean DEFAULT false,
    created_by uuid
);
COMMENT ON TABLE pricing_rules IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: producers
CREATE TABLE IF NOT EXISTS producers (
    geko_producer_id text NOT NULL,
    name text
);
COMMENT ON TABLE producers IS 'Tabela com 5 registos. Última inspeção: 2025-06-27';

-- Tabela: product_attributes
CREATE TABLE IF NOT EXISTS product_attributes (
    attributeid integer NOT NULL DEFAULT nextval('product_attributes_attributeid_seq'::regclass),
    product_ean text,
    key text,
    value text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE product_attributes IS 'Tabela com 4240 registos. Última inspeção: 2025-06-27';

-- Tabela: product_categories
CREATE TABLE IF NOT EXISTS product_categories (
    product_ean text NOT NULL,
    category_id text NOT NULL
);
COMMENT ON TABLE product_categories IS 'Tabela com 8122 registos. Última inspeção: 2025-06-27';

-- Tabela: product_images
CREATE TABLE IF NOT EXISTS product_images (
    imageid integer NOT NULL DEFAULT nextval('product_images_imageid_seq'::regclass),
    ean text,
    url text,
    alt text,
    is_primary boolean DEFAULT false
);
COMMENT ON TABLE product_images IS 'Tabela com 31511 registos. Última inspeção: 2025-06-27';

-- Tabela: product_sizes
CREATE TABLE IF NOT EXISTS product_sizes (
    id_product_sizes integer NOT NULL DEFAULT nextval('product_sizes_id_product_sizes_seq'::regclass),
    product_id_products integer,
    geko_size_code character varying(64),
    producer_size_code character varying(64),
    name character varying(255)
);
COMMENT ON TABLE product_sizes IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: product_variants
CREATE TABLE IF NOT EXISTS product_variants (
    variantid text NOT NULL,
    ean text,
    name text,
    stockquantity integer,
    supplier_price numeric(12,4),
    is_on_sale boolean DEFAULT false
);
COMMENT ON TABLE product_variants IS 'Tabela com 8126 registos. Última inspeção: 2025-06-27';

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
COMMENT ON TABLE products IS 'Tabela com 8126 registos. Última inspeção: 2025-06-27';

-- Tabela: role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);
COMMENT ON TABLE role_permissions IS 'Tabela com 14 registos. Última inspeção: 2025-06-27';

-- Tabela: roles
CREATE TABLE IF NOT EXISTS roles (
    role_id integer NOT NULL DEFAULT nextval('roles_role_id_seq'::regclass),
    role_name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE roles IS 'Tabela com 2 registos. Última inspeção: 2025-06-27';

-- Tabela: stock_levels
CREATE TABLE IF NOT EXISTS stock_levels (
    geko_variant_stock_id text,
    quantity numeric
);
COMMENT ON TABLE stock_levels IS 'Tabela com 2852 registos. Última inspeção: 2025-06-27';

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
COMMENT ON TABLE system_settings IS 'Tabela com 16 registos. Última inspeção: 2025-06-27';

-- Tabela: units
CREATE TABLE IF NOT EXISTS units (
    geko_unit_id text NOT NULL,
    name text,
    moq integer
);
COMMENT ON TABLE units IS 'Tabela com 7 registos. Última inspeção: 2025-06-27';

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
    phone character varying(20),
    application_status character varying(50) DEFAULT 'active'::character varying,
    customer_number character varying(20),
    vat_number character varying(20),
    economic_activity_code character varying(10),
    monthly_purchase_forecast numeric(10,2),
    website_url character varying(255),
    application_date timestamp without time zone DEFAULT now(),
    approved_by uuid,
    approval_date timestamp without time zone,
    rejection_reason text,
    created_by_admin boolean DEFAULT false
);
COMMENT ON TABLE users IS 'Tabela com 11 registos. Última inspeção: 2025-06-27';

-- ============================================
-- CONSTRAINTS E FOREIGN KEYS
-- ============================================

ALTER TABLE admin_notifications ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (notification_id);
ALTER TABLE attributes ADD CONSTRAINT attributes_pkey PRIMARY KEY (id_attributes);
ALTER TABLE bulk_price_operations ADD CONSTRAINT bulk_price_operations_pkey PRIMARY KEY (operation_id);
ALTER TABLE campaign_prices ADD CONSTRAINT campaign_prices_pkey PRIMARY KEY (campaign_price_id);
ALTER TABLE categories ADD CONSTRAINT categories_pkey PRIMARY KEY (categoryid);
ALTER TABLE content_banners ADD CONSTRAINT content_banners_pkey PRIMARY KEY (banner_id);
ALTER TABLE content_pages ADD CONSTRAINT content_pages_pkey PRIMARY KEY (page_id);
ALTER TABLE customer_addresses ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (address_id);
ALTER TABLE customer_admin_data ADD CONSTRAINT customer_admin_data_pkey PRIMARY KEY (admin_data_id);
ALTER TABLE customer_audit_log ADD CONSTRAINT customer_audit_log_pkey PRIMARY KEY (log_id);
ALTER TABLE customer_banks ADD CONSTRAINT customer_banks_pkey PRIMARY KEY (bank_id);
ALTER TABLE customer_contacts ADD CONSTRAINT customer_contacts_pkey PRIMARY KEY (contact_id);
ALTER TABLE customer_suppliers ADD CONSTRAINT customer_suppliers_pkey PRIMARY KEY (supplier_id);
ALTER TABLE email_configurations ADD CONSTRAINT email_configurations_pkey PRIMARY KEY (config_id);
ALTER TABLE email_logs ADD CONSTRAINT email_logs_pkey PRIMARY KEY (log_id);
ALTER TABLE email_templates ADD CONSTRAINT email_templates_pkey PRIMARY KEY (template_id);
ALTER TABLE faqs ADD CONSTRAINT faqs_pkey PRIMARY KEY (faq_id);
ALTER TABLE geko_products ADD CONSTRAINT geko_products_pkey PRIMARY KEY (ean);
ALTER TABLE order_items ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);
ALTER TABLE orders ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);
ALTER TABLE pending_geko_price_updates ADD CONSTRAINT pending_geko_price_updates_pkey PRIMARY KEY (update_id);
ALTER TABLE permissions ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);
ALTER TABLE price_campaigns ADD CONSTRAINT price_campaigns_pkey PRIMARY KEY (campaign_id);
ALTER TABLE price_history ADD CONSTRAINT price_history_pkey PRIMARY KEY (history_id);
ALTER TABLE price_list_assignments ADD CONSTRAINT price_list_assignments_pkey PRIMARY KEY (assignment_id);
ALTER TABLE price_lists ADD CONSTRAINT price_lists_pkey PRIMARY KEY (price_list_id);
ALTER TABLE prices ADD CONSTRAINT prices_pkey PRIMARY KEY (priceid);
ALTER TABLE pricing_config ADD CONSTRAINT pricing_config_pkey PRIMARY KEY (config_id);
ALTER TABLE pricing_rules ADD CONSTRAINT pricing_rules_pkey PRIMARY KEY (rule_id);
ALTER TABLE producers ADD CONSTRAINT producers_pkey PRIMARY KEY (geko_producer_id);
ALTER TABLE product_attributes ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (attributeid);
ALTER TABLE product_categories ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_ean, category_id);
ALTER TABLE product_images ADD CONSTRAINT product_images_pkey PRIMARY KEY (imageid);
ALTER TABLE product_sizes ADD CONSTRAINT product_sizes_pkey PRIMARY KEY (id_product_sizes);
ALTER TABLE product_variants ADD CONSTRAINT product_variants_pkey PRIMARY KEY (variantid);
ALTER TABLE products ADD CONSTRAINT products_pkey PRIMARY KEY (ean);
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);
ALTER TABLE roles ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);
ALTER TABLE system_settings ADD CONSTRAINT system_settings_pkey PRIMARY KEY (setting_id);
ALTER TABLE units ADD CONSTRAINT units_pkey PRIMARY KEY (geko_unit_id);
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);

-- Foreign Keys
ALTER TABLE admin_notifications ADD CONSTRAINT FK_admin_notifications_read_by FOREIGN KEY (read_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE admin_notifications ADD CONSTRAINT FK_admin_notifications_target_admin_id FOREIGN KEY (target_admin_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE bulk_price_operations ADD CONSTRAINT FK_bulk_price_operations_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE campaign_prices ADD CONSTRAINT FK_campaign_prices_campaign_id FOREIGN KEY (campaign_id) REFERENCES price_campaigns(campaign_id) ON DELETE CASCADE;
ALTER TABLE campaign_prices ADD CONSTRAINT FK_campaign_prices_variantid FOREIGN KEY (variantid) REFERENCES product_variants(variantid) ON DELETE CASCADE;
ALTER TABLE customer_addresses ADD CONSTRAINT FK_customer_addresses_customer_id FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE customer_admin_data ADD CONSTRAINT FK_customer_admin_data_account_manager_id FOREIGN KEY (account_manager_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE customer_admin_data ADD CONSTRAINT FK_customer_admin_data_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE customer_admin_data ADD CONSTRAINT FK_customer_admin_data_customer_id FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE customer_admin_data ADD CONSTRAINT FK_customer_admin_data_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE customer_audit_log ADD CONSTRAINT FK_customer_audit_log_customer_id FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE customer_audit_log ADD CONSTRAINT FK_customer_audit_log_performed_by FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE customer_audit_log ADD CONSTRAINT FK_customer_audit_log_performed_on_behalf_of FOREIGN KEY (performed_on_behalf_of) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE customer_banks ADD CONSTRAINT FK_customer_banks_customer_id FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE customer_contacts ADD CONSTRAINT FK_customer_contacts_customer_id FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE customer_suppliers ADD CONSTRAINT FK_customer_suppliers_customer_id FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE email_logs ADD CONSTRAINT FK_email_logs_related_customer_id FOREIGN KEY (related_customer_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE email_logs ADD CONSTRAINT FK_email_logs_sent_by FOREIGN KEY (sent_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT FK_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT FK_orders_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE pending_geko_price_updates ADD CONSTRAINT FK_pending_geko_price_updates_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE price_campaigns ADD CONSTRAINT FK_price_campaigns_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE price_history ADD CONSTRAINT FK_price_history_price_list_id FOREIGN KEY (price_list_id) REFERENCES price_lists(price_list_id) ON DELETE CASCADE;
ALTER TABLE price_history ADD CONSTRAINT FK_price_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE price_history ADD CONSTRAINT FK_price_history_variantid FOREIGN KEY (variantid) REFERENCES product_variants(variantid) ON DELETE CASCADE;
ALTER TABLE price_list_assignments ADD CONSTRAINT FK_price_list_assignments_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE price_list_assignments ADD CONSTRAINT FK_price_list_assignments_price_list_id FOREIGN KEY (price_list_id) REFERENCES price_lists(price_list_id) ON DELETE CASCADE;
ALTER TABLE price_list_assignments ADD CONSTRAINT FK_price_list_assignments_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE prices ADD CONSTRAINT FK_prices_price_list_id FOREIGN KEY (price_list_id) REFERENCES price_lists(price_list_id) ON DELETE CASCADE;
ALTER TABLE prices ADD CONSTRAINT FK_prices_variantid FOREIGN KEY (variantid) REFERENCES product_variants(variantid) ON DELETE CASCADE;
ALTER TABLE pricing_rules ADD CONSTRAINT FK_pricing_rules_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE product_attributes ADD CONSTRAINT FK_product_attributes_product_ean FOREIGN KEY (product_ean) REFERENCES products(ean) ON DELETE CASCADE;
ALTER TABLE product_categories ADD CONSTRAINT FK_product_categories_category_id FOREIGN KEY (category_id) REFERENCES categories(categoryid) ON DELETE CASCADE;
ALTER TABLE product_categories ADD CONSTRAINT FK_product_categories_product_ean FOREIGN KEY (product_ean) REFERENCES products(ean) ON DELETE CASCADE;
ALTER TABLE product_images ADD CONSTRAINT FK_product_images_ean FOREIGN KEY (ean) REFERENCES products(ean) ON DELETE CASCADE;
ALTER TABLE product_variants ADD CONSTRAINT FK_product_variants_ean FOREIGN KEY (ean) REFERENCES products(ean) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT FK_role_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT FK_role_permissions_role_id FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE;
ALTER TABLE users ADD CONSTRAINT FK_users_role_id FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE;

-- ============================================
-- VIEWS
-- ============================================

-- View: pending_geko_updates_summary (definição obtida automaticamente)
-- CREATE VIEW pending_geko_updates_summary AS ...;


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

-- Triggers para updated_at (tabelas que têm essa coluna)
DROP TRIGGER IF EXISTS set_timestamp_categories ON categories;
CREATE TRIGGER set_timestamp_categories
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_content_banners ON content_banners;
CREATE TRIGGER set_timestamp_content_banners
    BEFORE UPDATE ON content_banners
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_content_pages ON content_pages;
CREATE TRIGGER set_timestamp_content_pages
    BEFORE UPDATE ON content_pages
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customer_addresses ON customer_addresses;
CREATE TRIGGER set_timestamp_customer_addresses
    BEFORE UPDATE ON customer_addresses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customer_admin_data ON customer_admin_data;
CREATE TRIGGER set_timestamp_customer_admin_data
    BEFORE UPDATE ON customer_admin_data
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customer_banks ON customer_banks;
CREATE TRIGGER set_timestamp_customer_banks
    BEFORE UPDATE ON customer_banks
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customer_contacts ON customer_contacts;
CREATE TRIGGER set_timestamp_customer_contacts
    BEFORE UPDATE ON customer_contacts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customer_suppliers ON customer_suppliers;
CREATE TRIGGER set_timestamp_customer_suppliers
    BEFORE UPDATE ON customer_suppliers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_email_configurations ON email_configurations;
CREATE TRIGGER set_timestamp_email_configurations
    BEFORE UPDATE ON email_configurations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_email_templates ON email_templates;
CREATE TRIGGER set_timestamp_email_templates
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_faqs ON faqs;
CREATE TRIGGER set_timestamp_faqs
    BEFORE UPDATE ON faqs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_geko_products ON geko_products;
CREATE TRIGGER set_timestamp_geko_products
    BEFORE UPDATE ON geko_products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_orders ON orders;
CREATE TRIGGER set_timestamp_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_pending_geko_price_updates ON pending_geko_price_updates;
CREATE TRIGGER set_timestamp_pending_geko_price_updates
    BEFORE UPDATE ON pending_geko_price_updates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_price_campaigns ON price_campaigns;
CREATE TRIGGER set_timestamp_price_campaigns
    BEFORE UPDATE ON price_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_pricing_config ON pricing_config;
CREATE TRIGGER set_timestamp_pricing_config
    BEFORE UPDATE ON pricing_config
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_pricing_rules ON pricing_rules;
CREATE TRIGGER set_timestamp_pricing_rules
    BEFORE UPDATE ON pricing_rules
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_product_attributes ON product_attributes;
CREATE TRIGGER set_timestamp_product_attributes
    BEFORE UPDATE ON product_attributes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_products ON products;
CREATE TRIGGER set_timestamp_products
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_system_settings ON system_settings;
CREATE TRIGGER set_timestamp_system_settings
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();


-- ============================================
-- ESTATÍSTICAS DA BASE DE DADOS
-- ============================================

/*
RESUMO GERADO AUTOMATICAMENTE:
- Total de Tabelas: 42
- Total de Views: 1
- Data de Geração: 2025-06-27T09:43:15.954Z
- Script Gerador: scripts/generate_updated_schema.js

PRINCIPAIS TABELAS:
- admin_notifications
- attributes
- bulk_price_operations
- campaign_prices
- categories
- content_banners
- content_pages
- customer_addresses
- customer_admin_data
- customer_audit_log
- customer_banks
- customer_contacts
- customer_suppliers
- email_configurations
- email_logs
- email_templates
- faqs
- geko_products
- order_items
- orders
- pending_geko_price_updates
- permissions
- price_campaigns
- price_history
- price_list_assignments
- price_lists
- prices
- pricing_config
- pricing_rules
- producers
- product_attributes
- product_categories
- product_images
- product_sizes
- product_variants
- products
- role_permissions
- roles
- stock_levels
- system_settings
- units
- users
*/
