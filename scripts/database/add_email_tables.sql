-- ============================================
-- ADICIONAR TABELAS DE EMAIL (FASE 3)
-- Script para adicionar tabelas de configuração de email
-- ============================================

-- Tabela: email_configurations
CREATE TABLE IF NOT EXISTS email_configurations (
    config_id SERIAL PRIMARY KEY,
    smtp_host VARCHAR(255) NOT NULL,
    smtp_port INTEGER NOT NULL DEFAULT 587,
    smtp_secure BOOLEAN DEFAULT false,
    smtp_user VARCHAR(255),
    smtp_password TEXT,
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) DEFAULT 'ALITOOLS',
    reply_to VARCHAR(255),
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_smtp_port CHECK (smtp_port > 0 AND smtp_port <= 65535),
    CONSTRAINT check_from_email_format CHECK (from_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT check_reply_to_format CHECK (reply_to IS NULL OR reply_to ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Tabela: email_templates
CREATE TABLE IF NOT EXISTS email_templates (
    template_id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL UNIQUE,
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    variables JSONB,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: email_logs (já criada antes mas verificando)
CREATE TABLE IF NOT EXISTS email_logs (
    log_id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    subject TEXT,
    template_used VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    smtp_response JSONB,
    configuration_used JSONB,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_status CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_email_configs_enabled ON email_configurations(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Templates padrão
INSERT INTO email_templates (template_name, subject_template, html_template, text_template, description, variables) VALUES
(
    'customer_application_notification',
    'Novo Pedido de Cooperação - {{company_name}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info { background: #e0f2fe; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Novo Pedido de Cooperação</h1>
        </div>
        <div class="content">
            <p><strong>Boa notícia!</strong> Uma nova empresa submeteu um pedido de cooperação.</p>
            
            <div class="info">
                <strong>📋 Dados da Empresa:</strong><br>
                <strong>Nome:</strong> {{company_name}}<br>
                <strong>NIF:</strong> {{vat_number}}<br>
                <strong>CAE:</strong> {{economic_activity_code}}<br>
                <strong>Previsão Mensal:</strong> €{{monthly_purchase_forecast}}<br>
                <strong>Website:</strong> {{website_url}}<br>
                <strong>Contacto:</strong> {{contact_name}} ({{contact_position}})<br>
                <strong>Email:</strong> {{contact_email}}<br>
                <strong>Telefone:</strong> {{contact_phone}}
            </div>

            <p><strong>🎯 Próximos Passos:</strong></p>
            <ul>
                <li>Analisar dados da empresa</li>
                <li>Validar informações comerciais</li>
                <li>Aprovar ou rejeitar pedido</li>
            </ul>

            <a href="{{admin_url}}" class="button">Ver Pedido no Admin</a>
            
            <p><em>Este email foi enviado automaticamente pelo sistema ALITOOLS.</em></p>
        </div>
    </div>
</body>
</html>',
    'NOVO PEDIDO DE COOPERAÇÃO - {{company_name}}

Uma nova empresa submeteu um pedido de cooperação.

📋 Dados da Empresa:
- Nome: {{company_name}}
- NIF: {{vat_number}}
- CAE: {{economic_activity_code}}
- Previsão Mensal: €{{monthly_purchase_forecast}}
- Website: {{website_url}}
- Contacto: {{contact_name}} ({{contact_position}})
- Email: {{contact_email}}
- Telefone: {{contact_phone}}

🎯 Próximos Passos:
- Analisar dados da empresa
- Validar informações comerciais  
- Aprovar ou rejeitar pedido

Ver pedido: {{admin_url}}

Este email foi enviado automaticamente pelo sistema ALITOOLS.',
    'Template para notificar admin sobre novos pedidos de cooperação',
    '["company_name", "vat_number", "economic_activity_code", "monthly_purchase_forecast", "website_url", "contact_name", "contact_position", "contact_email", "contact_phone", "admin_url"]'::jsonb
)
ON CONFLICT (template_name) DO UPDATE SET
    subject_template = EXCLUDED.subject_template,
    html_template = EXCLUDED.html_template,
    text_template = EXCLUDED.text_template,
    description = EXCLUDED.description,
    variables = EXCLUDED.variables,
    updated_at = NOW();

-- Comentários das tabelas
COMMENT ON TABLE email_configurations IS 'Configurações SMTP customizáveis para envio de emails';
COMMENT ON TABLE email_templates IS 'Templates HTML e texto para emails automáticos';
COMMENT ON TABLE email_logs IS 'Log de todos os emails enviados pelo sistema com status e erros';

-- Verificação final - só verificar se as tabelas existem
SELECT 'Migração concluída! Tabelas criadas:' as resultado; 