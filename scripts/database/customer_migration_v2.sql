-- ============================================
-- MIGRAÇÃO SISTEMA DE GESTÃO DE CLIENTES V2
-- Tabelas adicionais que podem estar em falta
-- Data: 2025-01-20
-- ============================================

-- Múltiplos bancos por cliente (caso não tenha sido criada)
CREATE TABLE IF NOT EXISTS customer_banks (
    bank_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    branch_code VARCHAR(20),
    iban VARCHAR(34),
    swift_code VARCHAR(20),
    manager_name VARCHAR(100),
    manager_phone VARCHAR(20),
    manager_email VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dados administrativos e comerciais
CREATE TABLE IF NOT EXISTS customer_admin_data (
    admin_data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    credit_limit DECIMAL(12,2),
    payment_terms INTEGER,
    discount_percentage DECIMAL(5,2),
    admin_notes TEXT,
    risk_assessment VARCHAR(50),
    coface_info TEXT,
    coface_rating VARCHAR(10),
    account_manager_id UUID REFERENCES users(user_id),
    preferred_currency VARCHAR(3) DEFAULT 'EUR',
    tax_exempt BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Log completo de emails enviados
CREATE TABLE IF NOT EXISTS email_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100),
    config_used VARCHAR(100),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject TEXT,
    variables_used JSONB,
    status VARCHAR(50),
    error_message TEXT,
    smtp_response TEXT,
    send_attempts INTEGER DEFAULT 1,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    related_customer_id UUID REFERENCES users(user_id),
    sent_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Auditoria completa de alterações
CREATE TABLE IF NOT EXISTS customer_audit_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    table_affected VARCHAR(50) NOT NULL,
    record_id UUID,
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    performed_by UUID NOT NULL REFERENCES users(user_id),
    performed_on_behalf_of UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_customer_banks_customer_id ON customer_banks(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_admin_data_customer_id ON customer_admin_data(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_customer ON email_logs(related_customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_customer ON customer_audit_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON customer_audit_log(action_type);

-- Triggers para updated_at
DROP TRIGGER IF EXISTS set_timestamp_customer_banks ON customer_banks;
CREATE TRIGGER set_timestamp_customer_banks
    BEFORE UPDATE ON customer_banks
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customer_admin_data ON customer_admin_data;
CREATE TRIGGER set_timestamp_customer_admin_data
    BEFORE UPDATE ON customer_admin_data
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Adicionar campos que podem estar em falta na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Templates de email adicionais
INSERT INTO email_templates (template_key, template_name, description, subject_template, html_body, text_body, variables_available) VALUES
('customer_approved', 'Cliente Aprovado', 'Email enviado quando um pedido de cooperação é aprovado', 
 'Bem-vindo {{company_name}}! Pedido Aprovado',
 '<!DOCTYPE html><html><head><title>Pedido Aprovado</title></head><body><h1>Parabéns! O seu pedido foi aprovado</h1><p>Caro(a) {{customer_name}},</p><p>A sua empresa <strong>{{company_name}}</strong> foi aprovada como nosso parceiro B2B!</p></body></html>',
 'Parabéns! O seu pedido foi aprovado. Empresa: {{company_name}} aprovada como parceiro B2B.',
 ARRAY['{{company_name}}', '{{customer_name}}', '{{login_url}}', '{{username}}', '{{temp_password}}']
),
('customer_rejected', 'Cliente Rejeitado', 'Email enviado quando um pedido de cooperação é rejeitado',
 'Pedido de Cooperação - {{company_name}}',
 '<!DOCTYPE html><html><head><title>Pedido de Cooperação</title></head><body><h1>Pedido de Cooperação</h1><p>Caro(a) {{customer_name}},</p><p>Agradecemos o interesse mas não é possível prosseguir neste momento.</p><p><strong>Motivo:</strong> {{rejection_reason}}</p></body></html>',
 'Pedido de Cooperação - {{company_name}}. Agradecemos o interesse mas não é possível prosseguir neste momento. Motivo: {{rejection_reason}}',
 ARRAY['{{company_name}}', '{{customer_name}}', '{{rejection_reason}}']
)
ON CONFLICT (template_key) DO NOTHING; 