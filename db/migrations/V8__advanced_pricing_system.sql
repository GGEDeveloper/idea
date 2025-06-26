-- ============================================
-- MIGRATION V8: ADVANCED PRICING MANAGEMENT SYSTEM
-- Data: 2025-01-27
-- Descrição: Sistema completo de gestão de preços com histórico, campanhas e operações em massa
-- ============================================

BEGIN;

-- ============================================
-- 1. TABELA: price_history
-- Histórico completo de alterações de preços para auditoria
-- ============================================
CREATE TABLE IF NOT EXISTS price_history (
    history_id SERIAL PRIMARY KEY,
    variantid TEXT NOT NULL,
    price_list_id INTEGER NOT NULL,
    old_price NUMERIC(12,4),
    new_price NUMERIC(12,4) NOT NULL,
    changed_by UUID NOT NULL,
    change_reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_price_history_variant 
        FOREIGN KEY (variantid) REFERENCES product_variants(variantid) ON DELETE CASCADE,
    CONSTRAINT fk_price_history_price_list 
        FOREIGN KEY (price_list_id) REFERENCES price_lists(price_list_id) ON DELETE CASCADE,
    CONSTRAINT fk_price_history_user 
        FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_price_history_variant ON price_history(variantid);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_price_history_user ON price_history(changed_by);

-- ============================================
-- 2. TABELA: price_campaigns
-- Gestão de campanhas promocionais
-- ============================================
CREATE TABLE IF NOT EXISTS price_campaigns (
    campaign_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('promotional', 'seasonal', 'clearance', 'flash_sale', 'bulk_discount')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_price_campaigns_user 
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_campaign_dates 
        CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_price_campaigns_active ON price_campaigns(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_price_campaigns_type ON price_campaigns(campaign_type);

-- ============================================
-- 3. TABELA: campaign_prices
-- Preços específicos por campanha promocional
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_prices (
    campaign_price_id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL,
    variantid TEXT NOT NULL,
    promotional_price NUMERIC(12,4) NOT NULL CHECK (promotional_price >= 0),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_campaign_prices_campaign 
        FOREIGN KEY (campaign_id) REFERENCES price_campaigns(campaign_id) ON DELETE CASCADE,
    CONSTRAINT fk_campaign_prices_variant 
        FOREIGN KEY (variantid) REFERENCES product_variants(variantid) ON DELETE CASCADE,
    CONSTRAINT uk_campaign_prices_unique 
        UNIQUE (campaign_id, variantid)
);

CREATE INDEX IF NOT EXISTS idx_campaign_prices_campaign ON campaign_prices(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_prices_variant ON campaign_prices(variantid);
CREATE INDEX IF NOT EXISTS idx_campaign_prices_priority ON campaign_prices(priority DESC);

-- ============================================
-- 4. TABELA: bulk_price_operations
-- Log de operações em massa para rastreabilidade
-- ============================================
CREATE TABLE IF NOT EXISTS bulk_price_operations (
    operation_id SERIAL PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('markup', 'discount', 'fixed_price', 'import', 'category_update', 'brand_update')),
    operation_name VARCHAR(255) NOT NULL,
    filter_criteria JSONB,
    operation_data JSONB,
    affected_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    created_by UUID NOT NULL,
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_bulk_operations_user 
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bulk_operations_status ON bulk_price_operations(status);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_type ON bulk_price_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_date ON bulk_price_operations(created_at);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_user ON bulk_price_operations(created_by);

-- ============================================
-- 5. MELHORIAS NA TABELA: pricing_rules
-- Adicionar colunas para gestão temporal e automática
-- ============================================
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS applies_from TIMESTAMPTZ;
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS applies_until TIMESTAMPTZ;
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS auto_apply BOOLEAN DEFAULT false;
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS created_by UUID;

-- Adicionar constraints se as colunas foram criadas
DO $$
BEGIN
    -- Adicionar FK apenas se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_pricing_rules_user' 
                   AND table_name = 'pricing_rules') THEN
        ALTER TABLE pricing_rules ADD CONSTRAINT fk_pricing_rules_user 
            FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;
    END IF;
    
    -- Adicionar CHECK apenas se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'chk_pricing_rules_dates' 
                   AND table_name = 'pricing_rules') THEN
        ALTER TABLE pricing_rules ADD CONSTRAINT chk_pricing_rules_dates 
            CHECK (applies_until IS NULL OR applies_until > applies_from);
    END IF;
END $$;

-- ============================================
-- 6. TABELA: price_list_assignments (OPCIONAL)
-- Controlar que listas de preços cada cliente vê
-- ============================================
CREATE TABLE IF NOT EXISTS price_list_assignments (
    assignment_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    price_list_id INTEGER NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID NOT NULL,
    
    CONSTRAINT fk_price_assignments_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_price_assignments_price_list 
        FOREIGN KEY (price_list_id) REFERENCES price_lists(price_list_id) ON DELETE CASCADE,
    CONSTRAINT fk_price_assignments_admin 
        FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT uk_price_assignments_unique 
        UNIQUE (user_id, price_list_id)
);

CREATE INDEX IF NOT EXISTS idx_price_assignments_user ON price_list_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_price_assignments_list ON price_list_assignments(price_list_id);

-- ============================================
-- 7. FUNÇÕES AUXILIARES
-- ============================================

-- Função para obter preço efetivo (considerando campanhas)
CREATE OR REPLACE FUNCTION get_effective_price(
    p_variantid TEXT,
    p_price_list_id INTEGER,
    p_check_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS NUMERIC(12,4) AS $$
DECLARE
    base_price NUMERIC(12,4);
    campaign_price NUMERIC(12,4);
BEGIN
    -- Obter preço base
    SELECT price INTO base_price
    FROM prices 
    WHERE variantid = p_variantid AND price_list_id = p_price_list_id;
    
    -- Verificar se há campanha ativa com preço promocional
    SELECT cp.promotional_price INTO campaign_price
    FROM campaign_prices cp
    JOIN price_campaigns pc ON cp.campaign_id = pc.campaign_id
    WHERE cp.variantid = p_variantid
      AND pc.is_active = true
      AND pc.start_date <= p_check_date
      AND (pc.end_date IS NULL OR pc.end_date > p_check_date)
    ORDER BY cp.priority DESC, pc.campaign_id DESC
    LIMIT 1;
    
    -- Retornar preço promocional se existir, senão preço base
    RETURN COALESCE(campaign_price, base_price);
END;
$$ LANGUAGE plpgsql;

-- Trigger para registar alterações de preços no histórico
CREATE OR REPLACE FUNCTION log_price_changes() RETURNS TRIGGER AS $$
BEGIN
    -- Apenas registar se o preço realmente mudou
    IF TG_OP = 'UPDATE' AND OLD.price IS DISTINCT FROM NEW.price THEN
        INSERT INTO price_history (
            variantid, 
            price_list_id, 
            old_price, 
            new_price, 
            changed_by, 
            change_reason,
            changed_at
        ) VALUES (
            NEW.variantid,
            NEW.price_list_id,
            OLD.price,
            NEW.price,
            COALESCE(current_setting('app.current_user_id', true)::UUID, 
                    (SELECT user_id FROM users WHERE role_id = 1 LIMIT 1)), -- fallback para admin
            'Automatic price update',
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela prices
DROP TRIGGER IF EXISTS trigger_log_price_changes ON prices;
CREATE TRIGGER trigger_log_price_changes
    AFTER UPDATE ON prices
    FOR EACH ROW
    EXECUTE FUNCTION log_price_changes();

-- Trigger para atualizar updated_at em campanhas
CREATE OR REPLACE FUNCTION update_campaign_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_campaign_timestamp ON price_campaigns;
CREATE TRIGGER trigger_update_campaign_timestamp
    BEFORE UPDATE ON price_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_timestamp();

-- ============================================
-- 8. DADOS INICIAIS (SEED)
-- ============================================

-- Inserir campanha de exemplo (inativa)
INSERT INTO price_campaigns (
    name, 
    description, 
    campaign_type, 
    start_date, 
    end_date, 
    is_active, 
    created_by
) VALUES (
    'Campanha de Exemplo',
    'Campanha de demonstração do sistema de preços promocionais',
    'promotional',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '30 days',
    false,
    (SELECT user_id FROM users WHERE role_id = 1 LIMIT 1)
) ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================
-- VERIFICAÇÃO DE INTEGRIDADE
-- ============================================
DO $$
BEGIN
    -- Verificar se todas as tabelas foram criadas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'price_history') THEN
        RAISE EXCEPTION 'Tabela price_history não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'price_campaigns') THEN
        RAISE EXCEPTION 'Tabela price_campaigns não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_prices') THEN
        RAISE EXCEPTION 'Tabela campaign_prices não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bulk_price_operations') THEN
        RAISE EXCEPTION 'Tabela bulk_price_operations não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'price_list_assignments') THEN
        RAISE EXCEPTION 'Tabela price_list_assignments não foi criada';
    END IF;
    
    RAISE NOTICE 'Migration V8 executada com sucesso - Sistema avançado de preços implementado!';
END $$; 