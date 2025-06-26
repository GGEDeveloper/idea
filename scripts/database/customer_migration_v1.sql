-- ============================================
-- MIGRAÇÃO SISTEMA DE GESTÃO DE CLIENTES V1
-- Data: 2025-01-20
-- ============================================

-- Expansão tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS application_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vat_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS economic_activity_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_purchase_forecast DECIMAL(10,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS application_date TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by_admin BOOLEAN DEFAULT false;

-- Múltiplas moradas por cliente
CREATE TABLE IF NOT EXISTS customer_addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL,
    company_name VARCHAR(255),
    street_address TEXT NOT NULL,
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(50) DEFAULT 'Portugal',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Múltiplos contactos por cliente
CREATE TABLE IF NOT EXISTS customer_contacts (
    contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    contact_type VARCHAR(20) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    position VARCHAR(100),
    department VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fornecedores habituais
CREATE TABLE IF NOT EXISTS customer_suppliers (
    supplier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    location VARCHAR(100),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sistema de configurações de email
CREATE TABLE IF NOT EXISTS email_configurations (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    smtp_host VARCHAR(255) NOT NULL,
    smtp_port INTEGER NOT NULL DEFAULT 587,
    smtp_username VARCHAR(255),
    smtp_password TEXT,
    smtp_secure VARCHAR(10) DEFAULT 'tls',
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    reply_to VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Templates de email
CREATE TABLE IF NOT EXISTS email_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) NOT NULL UNIQUE,
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_template TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    variables_available TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notificações internas admin
CREATE TABLE IF NOT EXISTS admin_notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    action_url VARCHAR(255),
    target_admin_id UUID REFERENCES users(user_id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    read_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO email_configurations (
    config_name, description, smtp_host, smtp_port, 
    from_email, from_name, is_default
) VALUES (
    'default',
    'Configuração SMTP padrão',
    'localhost',
    587,
    'noreply@empresa.com',
    'Sistema Empresa',
    true
) ON CONFLICT (config_name) DO NOTHING; 