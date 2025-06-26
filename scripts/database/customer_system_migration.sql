-- ============================================
-- MIGRAÇÃO SISTEMA DE GESTÃO DE CLIENTES
-- Data: 2025-01-20
-- Descrição: Implementação completa do sistema de pedidos de cooperação,
--           gestão de clientes, configurações de email e notificações
-- NOTA: Script não destrutivo - mantém todos os dados existentes
-- ============================================

-- Extensões necessárias (caso não existam)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. EXPANSÃO TABELA USERS (não destrutiva)
-- ============================================

-- Adicionar novos campos à tabela users existente
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

-- Adicionar constraint para approved_by
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_users_approved_by'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT FK_users_approved_by 
        FOREIGN KEY (approved_by) REFERENCES users(user_id);
    END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_application_status ON users(application_status);
CREATE INDEX IF NOT EXISTS idx_users_vat_number ON users(vat_number);
CREATE INDEX IF NOT EXISTS idx_users_customer_number ON users(customer_number);

-- ============================================
-- 2. TABELAS DE RELACIONAMENTO CLIENTE
-- ============================================

-- Múltiplas moradas por cliente
CREATE TABLE IF NOT EXISTS customer_addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL, -- 'billing', 'delivery', 'correspondence'
    company_name VARCHAR(255), -- pode ser diferente da empresa principal
    street_address TEXT NOT NULL,
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(50) DEFAULT 'Portugal',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para addresses
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_type ON customer_addresses(address_type);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_primary ON customer_addresses(is_primary) WHERE is_primary = true;

-- Múltiplos contactos por cliente
CREATE TABLE IF NOT EXISTS customer_contacts (
    contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    contact_type VARCHAR(20) NOT NULL, -- 'primary', 'purchase', 'financial', 'technical'
    contact_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    position VARCHAR(100),
    department VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para contacts
CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer_id ON customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_type ON customer_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_email ON customer_contacts(email);

-- Múltiplos bancos por cliente
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

-- Índices para banks
CREATE INDEX IF NOT EXISTS idx_customer_banks_customer_id ON customer_banks(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_banks_primary ON customer_banks(is_primary) WHERE is_primary = true;

-- Fornecedores habituais do cliente
CREATE TABLE IF NOT EXISTS customer_suppliers (
    supplier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    location VARCHAR(100),
    website VARCHAR(255),
    product_categories TEXT[], -- array de categorias que fornecem
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para suppliers
CREATE INDEX IF NOT EXISTS idx_customer_suppliers_customer_id ON customer_suppliers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_suppliers_company ON customer_suppliers(company_name);

-- ============================================
-- 3. GESTÃO ADMINISTRATIVA E COMERCIAL
-- ============================================

-- Dados administrativos e comerciais definidos pelo admin
CREATE TABLE IF NOT EXISTS customer_admin_data (
    admin_data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Dados comerciais
    credit_limit DECIMAL(12,2),
    payment_terms INTEGER, -- dias
    discount_percentage DECIMAL(5,2), -- %
    
    -- Análise e risco
    admin_notes TEXT,
    risk_assessment VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
    coface_info TEXT,
    coface_rating VARCHAR(10),
    
    -- Controlo administrativo
    account_manager_id UUID REFERENCES users(user_id),
    preferred_currency VARCHAR(3) DEFAULT 'EUR',
    tax_exempt BOOLEAN DEFAULT false,
    
    -- Auditoria
    created_by UUID NOT NULL REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para admin data
CREATE INDEX IF NOT EXISTS idx_customer_admin_data_customer_id ON customer_admin_data(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_admin_data_manager ON customer_admin_data(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_customer_admin_data_risk ON customer_admin_data(risk_assessment);

-- ============================================
-- 4. SISTEMA DE CONFIGURAÇÕES DE EMAIL
-- ============================================

-- Configurações SMTP customizáveis
CREATE TABLE IF NOT EXISTS email_configurations (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_name VARCHAR(100) NOT NULL UNIQUE, -- 'default', 'customer_notifications', 'system_alerts'
    description TEXT,
    
    -- Configurações SMTP
    smtp_host VARCHAR(255) NOT NULL,
    smtp_port INTEGER NOT NULL DEFAULT 587,
    smtp_username VARCHAR(255),
    smtp_password TEXT, -- será encriptado
    smtp_secure VARCHAR(10) DEFAULT 'tls', -- 'tls', 'ssl', 'none'
    
    -- Configurações de envio
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    reply_to VARCHAR(255),
    
    -- Configurações avançadas
    max_send_rate INTEGER DEFAULT 10, -- emails por minuto
    retry_attempts INTEGER DEFAULT 3,
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para email configurations
CREATE INDEX IF NOT EXISTS idx_email_configs_active ON email_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_email_configs_default ON email_configurations(is_default) WHERE is_default = true;

-- Templates de email customizáveis
CREATE TABLE IF NOT EXISTS email_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) NOT NULL UNIQUE,
    -- Chaves: 'customer_approved', 'customer_rejected', 'account_created', 'first_login_reminder', 'password_reset'
    
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Conteúdo do template
    subject_template TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    
    -- Configurações
    variables_available TEXT[], -- ['{{company_name}}', '{{customer_name}}', '{{credit_limit}}']
    required_variables TEXT[], -- variáveis obrigatórias
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para email templates
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- ============================================
-- 5. SISTEMA DE NOTIFICAÇÕES INTERNAS
-- ============================================

-- Notificações para administradores
CREATE TABLE IF NOT EXISTS admin_notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Classificação da notificação
    type VARCHAR(50) NOT NULL,
    -- Tipos: 'new_application', 'customer_login', 'data_change', 'email_error', 'system_alert', 'payment_overdue'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    
    -- Relacionamento com entidades
    related_entity_type VARCHAR(50), -- 'customer', 'order', 'product', 'system'
    related_entity_id UUID,
    action_url VARCHAR(255), -- URL para ação relacionada
    action_text VARCHAR(100), -- texto do botão de ação
    
    -- Destinatário (NULL = para todos os admins)
    target_admin_id UUID REFERENCES users(user_id),
    target_role VARCHAR(50), -- 'admin', 'manager', 'sales' - para filtrar por role
    
    -- Estado da notificação
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    read_by UUID REFERENCES users(user_id),
    
    -- Auto-expiração
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_target ON admin_notifications(target_admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread ON admin_notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON admin_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);

-- ============================================
-- 6. AUDITORIA E LOGS
-- ============================================

-- Log completo de emails enviados
CREATE TABLE IF NOT EXISTS email_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação do email
    template_key VARCHAR(100),
    config_used VARCHAR(100), -- qual configuração SMTP foi usada
    
    -- Destinatário
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    
    -- Conteúdo
    subject TEXT,
    variables_used JSONB, -- valores das variáveis no momento do envio
    
    -- Status do envio
    status VARCHAR(50), -- 'queued', 'sending', 'sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked'
    error_message TEXT,
    smtp_response TEXT,
    
    -- Métricas
    send_attempts INTEGER DEFAULT 1,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    
    -- Relacionamento
    related_customer_id UUID REFERENCES users(user_id),
    sent_by UUID REFERENCES users(user_id), -- admin que triggou o envio
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_customer ON email_logs(related_customer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_key);

-- Auditoria completa de alterações
CREATE TABLE IF NOT EXISTS customer_audit_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Entidade afetada
    customer_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    table_affected VARCHAR(50) NOT NULL,
    record_id UUID,
    
    -- Ação realizada
    action_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'approved', 'rejected', 'login', 'view'
    action_description TEXT,
    
    -- Dados da alteração
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[], -- campos que foram alterados
    
    -- Contexto da ação
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Quem fez a alteração
    performed_by UUID NOT NULL REFERENCES users(user_id),
    performed_on_behalf_of UUID REFERENCES users(user_id), -- para casos de admin alterando dados de cliente
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_customer ON customer_audit_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON customer_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON customer_audit_log(table_affected);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON customer_audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON customer_audit_log(created_at DESC);

-- ============================================
-- 7. TRIGGERS PARA UPDATED_AT
-- ============================================

-- Função para atualizar updated_at (caso não exista)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para as novas tabelas
DROP TRIGGER IF EXISTS set_timestamp_customer_addresses ON customer_addresses;
CREATE TRIGGER set_timestamp_customer_addresses
    BEFORE UPDATE ON customer_addresses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customer_contacts ON customer_contacts;
CREATE TRIGGER set_timestamp_customer_contacts
    BEFORE UPDATE ON customer_contacts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customer_banks ON customer_banks;
CREATE TRIGGER set_timestamp_customer_banks
    BEFORE UPDATE ON customer_banks
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customer_suppliers ON customer_suppliers;
CREATE TRIGGER set_timestamp_customer_suppliers
    BEFORE UPDATE ON customer_suppliers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_customer_admin_data ON customer_admin_data;
CREATE TRIGGER set_timestamp_customer_admin_data
    BEFORE UPDATE ON customer_admin_data
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

-- ============================================
-- 8. DADOS INICIAIS (SEEDS)
-- ============================================

-- Configuração SMTP padrão (valores de exemplo)
INSERT INTO email_configurations (
    config_name, description, smtp_host, smtp_port, smtp_username, 
    from_email, from_name, is_default
) VALUES (
    'default',
    'Configuração SMTP padrão do sistema',
    'localhost', -- substituir pelos dados reais
    587,
    'sistema@empresa.com',
    'noreply@empresa.com',
    'Sistema Empresa',
    true
) ON CONFLICT (config_name) DO NOTHING;

-- Templates de email padrão
INSERT INTO email_templates (template_key, template_name, description, subject_template, html_body, text_body, variables_available) VALUES
('customer_approved', 'Cliente Aprovado', 'Email enviado quando um pedido de cooperação é aprovado', 
 'Bem-vindo {{company_name}}! Pedido Aprovado',
 '<!DOCTYPE html>
<html>
<head><title>Pedido Aprovado</title></head>
<body>
<h1>Parabéns! O seu pedido foi aprovado</h1>
<p>Caro(a) {{customer_name}},</p>
<p>A sua empresa <strong>{{company_name}}</strong> foi aprovada como nosso parceiro B2B!</p>
<div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
<h3>Condições Aprovadas:</h3>
<ul>
<li><strong>Limite de Crédito:</strong> €{{credit_limit}}</li>
<li><strong>Condições Pagamento:</strong> {{payment_terms}} dias</li>
</ul>
</div>
<p><a href="{{login_url}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Aceder à Minha Conta</a></p>
<p>Credenciais de acesso:<br>Username: {{username}}<br>Password temporária: {{temp_password}}</p>
<p>Atenciosamente,<br>Equipa {{company_name}}</p>
</body>
</html>',
 'Parabéns! O seu pedido foi aprovado. Empresa: {{company_name}} aprovada como parceiro B2B. Limite: €{{credit_limit}}, Pagamento: {{payment_terms}} dias. Login: {{login_url}} Username: {{username}} Password: {{temp_password}}',
 ARRAY['{{company_name}}', '{{customer_name}}', '{{credit_limit}}', '{{payment_terms}}', '{{login_url}}', '{{username}}', '{{temp_password}}']
),
('customer_rejected', 'Cliente Rejeitado', 'Email enviado quando um pedido de cooperação é rejeitado',
 'Pedido de Cooperação - {{company_name}}',
 '<!DOCTYPE html>
<html>
<head><title>Pedido de Cooperação</title></head>
<body>
<h1>Pedido de Cooperação</h1>
<p>Caro(a) {{customer_name}},</p>
<p>Agradecemos o interesse da empresa <strong>{{company_name}}</strong> em estabelecer uma parceria comercial connosco.</p>
<p>Após análise cuidadosa do vosso pedido, informamos que não é possível prosseguir com a aprovação neste momento.</p>
<div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
<strong>Motivo:</strong> {{rejection_reason}}
</div>
<p>Continuamos disponíveis para futuras oportunidades de colaboração.</p>
<p>Atenciosamente,<br>Equipa {{company_name}}</p>
</body>
</html>',
 'Pedido de Cooperação - {{company_name}}. Agradecemos o interesse mas não é possível prosseguir neste momento. Motivo: {{rejection_reason}}',
 ARRAY['{{company_name}}', '{{customer_name}}', '{{rejection_reason}}']
),
('account_created', 'Conta Criada', 'Email enviado quando admin cria conta diretamente',
 'Conta B2B Criada - {{company_name}}',
 '<!DOCTYPE html>
<html>
<head><title>Conta B2B Criada</title></head>
<body>
<h1>Bem-vindo à nossa plataforma B2B!</h1>
<p>Caro(a) {{customer_name}},</p>
<p>Foi criada uma conta B2B para a empresa <strong>{{company_name}}</strong> na nossa plataforma.</p>
<div style="background: #d4edda; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745;">
<h3>Dados de Acesso:</h3>
<p><strong>URL:</strong> {{login_url}}<br>
<strong>Username:</strong> {{username}}<br>
<strong>Password:</strong> {{temp_password}}</p>
</div>
<p>Recomendamos que altere a password no primeiro acesso.</p>
<p><a href="{{login_url}}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none;">Aceder à Plataforma</a></p>
<p>Atenciosamente,<br>Equipa {{company_name}}</p>
</body>
</html>',
 'Conta B2B criada para {{company_name}}. Acesso: {{login_url}} Username: {{username}} Password: {{temp_password}}',
 ARRAY['{{company_name}}', '{{customer_name}}', '{{login_url}}', '{{username}}', '{{temp_password}}']
)
ON CONFLICT (template_key) DO NOTHING;

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

-- Comentários nas tabelas para documentação
COMMENT ON TABLE customer_addresses IS 'Múltiplas moradas por cliente (facturação, entrega, correspondência)';
COMMENT ON TABLE customer_contacts IS 'Múltiplos contactos especializados por cliente (compras, financeiro, técnico)';
COMMENT ON TABLE customer_banks IS 'Informações bancárias do cliente (múltiplos bancos suportados)';
COMMENT ON TABLE customer_suppliers IS 'Fornecedores habituais do cliente';
COMMENT ON TABLE customer_admin_data IS 'Dados comerciais e administrativos definidos pelo admin';
COMMENT ON TABLE email_configurations IS 'Configurações SMTP customizáveis para envio de emails';
COMMENT ON TABLE email_templates IS 'Templates HTML customizáveis para diferentes tipos de email';
COMMENT ON TABLE admin_notifications IS 'Sistema de notificações internas para administradores';
COMMENT ON TABLE email_logs IS 'Log completo de todos os emails enviados pelo sistema';
COMMENT ON TABLE customer_audit_log IS 'Auditoria completa de todas as alterações relacionadas com clientes';

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================

-- Mostrar estatísticas finais
DO $$
DECLARE
    total_tables integer;
    total_indexes integer;
BEGIN
    SELECT COUNT(*) INTO total_tables FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE 'customer_%' OR table_name LIKE 'email_%' OR table_name LIKE 'admin_%';
    
    SELECT COUNT(*) INTO total_indexes FROM pg_indexes 
    WHERE schemaname = 'public' AND (indexname LIKE '%customer_%' OR indexname LIKE '%email_%' OR indexname LIKE '%admin_%');
    
    RAISE NOTICE '✅ Migração concluída com sucesso!';
    RAISE NOTICE '📊 Tabelas criadas/modificadas: %', total_tables;
    RAISE NOTICE '🔍 Índices criados: %', total_indexes;
    RAISE NOTICE '📧 Templates de email inseridos: 3';
    RAISE NOTICE '⚙️ Configuração SMTP padrão criada';
END $$; 