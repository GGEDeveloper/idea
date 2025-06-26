-- Migration V9: Sistema de Aprovação de Preços da Geko
-- Data: 2025-01-28
-- Objetivo: Implementar sistema para que preços da Geko sejam aprovados antes de aplicar aos clientes

-- 1. Tabela para armazenar atualizações de preços pendentes da Geko
CREATE TABLE IF NOT EXISTS pending_geko_price_updates (
    update_id SERIAL PRIMARY KEY,
    ean TEXT NOT NULL,
    current_supplier_price NUMERIC(12,4),
    new_supplier_price NUMERIC(12,4) NOT NULL,
    current_stock_quantity INTEGER,
    new_stock_quantity INTEGER NOT NULL,
    price_change_percentage NUMERIC(10,2), -- Calculado automaticamente
    
    -- Metadados da atualização
    geko_sync_batch_id TEXT, -- Para agrupar updates do mesmo sync
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    geko_last_sync TIMESTAMPTZ,
    raw_geko_data JSONB,
    
    -- Status da aprovação
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    reviewed_by UUID REFERENCES users(user_id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Auto-expiry para evitar acúmulo
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Prevent duplicates for same EAN in pending status  
    CONSTRAINT unique_pending_ean UNIQUE (ean),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para performance
CREATE INDEX idx_pending_geko_updates_ean ON pending_geko_price_updates(ean);
CREATE INDEX idx_pending_geko_updates_status ON pending_geko_price_updates(status);
CREATE INDEX idx_pending_geko_updates_batch ON pending_geko_price_updates(geko_sync_batch_id);
CREATE INDEX idx_pending_geko_updates_detected_at ON pending_geko_price_updates(detected_at);
CREATE INDEX idx_pending_geko_updates_expires_at ON pending_geko_price_updates(expires_at);

-- 3. Trigger para calcular percentage de mudança automaticamente
CREATE OR REPLACE FUNCTION calculate_price_change_percentage()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular percentagem de mudança de preço
    IF NEW.current_supplier_price IS NOT NULL AND NEW.current_supplier_price > 0 THEN
        NEW.price_change_percentage = ROUND(
            ((NEW.new_supplier_price - NEW.current_supplier_price) / NEW.current_supplier_price) * 100, 
            2
        );
    ELSE
        NEW.price_change_percentage = NULL;
    END IF;
    
    -- Auto-set expires_at se não definido
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at = NEW.detected_at + INTERVAL '30 days';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_price_change_percentage
    BEFORE INSERT OR UPDATE ON pending_geko_price_updates
    FOR EACH ROW
    EXECUTE FUNCTION calculate_price_change_percentage();

-- 4. Trigger para atualizar updated_at
CREATE TRIGGER trigger_pending_geko_updates_updated_at
    BEFORE UPDATE ON pending_geko_price_updates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- 5. Função para limpar updates expirados (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_pending_updates()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM pending_geko_price_updates 
    WHERE status = 'pending' AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Função para detectar mudanças de preços automáticamente
CREATE OR REPLACE FUNCTION detect_geko_price_changes(
    p_ean TEXT,
    p_new_supplier_price NUMERIC(12,4),
    p_new_stock_quantity INTEGER,
    p_geko_sync_batch_id TEXT DEFAULT NULL,
    p_raw_geko_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_price NUMERIC(12,4);
    current_stock INTEGER;
    price_threshold NUMERIC(5,2) := 0.01; -- 1% threshold para detectar mudanças significativas
    has_significant_change BOOLEAN := FALSE;
BEGIN
    -- Buscar preços e stock atuais
    SELECT supplier_price, stock_quantity 
    INTO current_price, current_stock
    FROM geko_products 
    WHERE ean = p_ean;
    
    -- Se não existe produto, não há mudança a detectar
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Detectar mudanças significativas de preço (mais de 1%)
    IF current_price IS NOT NULL AND current_price > 0 THEN
        IF ABS(p_new_supplier_price - current_price) / current_price > (price_threshold / 100) THEN
            has_significant_change := TRUE;
        END IF;
    ELSIF current_price IS NULL AND p_new_supplier_price IS NOT NULL THEN
        has_significant_change := TRUE;
    END IF;
    
    -- Detectar mudanças de stock (qualquer mudança é significativa)
    IF current_stock != p_new_stock_quantity THEN
        has_significant_change := TRUE;
    END IF;
    
    -- Se há mudança significativa, criar pending update
    IF has_significant_change THEN
        INSERT INTO pending_geko_price_updates (
            ean,
            current_supplier_price,
            new_supplier_price,
            current_stock_quantity,
            new_stock_quantity,
            geko_sync_batch_id,
            geko_last_sync,
            raw_geko_data
        ) VALUES (
            p_ean,
            current_price,
            p_new_supplier_price,
            current_stock,
            p_new_stock_quantity,
            p_geko_sync_batch_id,
            NOW(),
            p_raw_geko_data
        ) ON CONFLICT (ean) 
        DO UPDATE SET
            new_supplier_price = EXCLUDED.new_supplier_price,
            new_stock_quantity = EXCLUDED.new_stock_quantity,
            geko_last_sync = EXCLUDED.geko_last_sync,
            raw_geko_data = EXCLUDED.raw_geko_data,
            detected_at = NOW(),
            updated_at = NOW();
    END IF;
    
    RETURN has_significant_change;
END;
$$ LANGUAGE plpgsql;

-- 7. Função para aprovar updates pendentes
CREATE OR REPLACE FUNCTION approve_pending_price_update(
    p_update_id INTEGER,
    p_admin_user_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    update_record RECORD;
    variant_id TEXT;
BEGIN
    -- Buscar o update pendente
    SELECT * INTO update_record 
    FROM pending_geko_price_updates 
    WHERE update_id = p_update_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Update pendente não encontrado ou já processado';
    END IF;
    
    -- Marcar como aprovado
    UPDATE pending_geko_price_updates 
    SET 
        status = 'approved',
        reviewed_by = p_admin_user_id,
        reviewed_at = NOW(),
        review_notes = p_notes,
        updated_at = NOW()
    WHERE update_id = p_update_id;
    
    -- Aplicar as mudanças nas tabelas de produção
    
    -- 1. Atualizar geko_products
    UPDATE geko_products 
    SET 
        supplier_price = update_record.new_supplier_price,
        stock_quantity = update_record.new_stock_quantity,
        last_sync = NOW(),
        updated_at = NOW()
    WHERE ean = update_record.ean;
    
    -- 2. Atualizar product_variants
    UPDATE product_variants 
    SET 
        supplier_price = update_record.new_supplier_price,
        stockquantity = update_record.new_stock_quantity
    WHERE ean = update_record.ean;
    
    -- 3. Atualizar preços baseados em markup (usar configurações existentes)
    -- Buscar variant ID
    SELECT variantid INTO variant_id 
    FROM product_variants 
    WHERE ean = update_record.ean 
    LIMIT 1;
    
    IF variant_id IS NOT NULL THEN
        -- Atualizar preço de fornecedor (lista 1)
        INSERT INTO prices (variantid, price_list_id, price)
        VALUES (variant_id, 1, update_record.new_supplier_price)
        ON CONFLICT (variantid, price_list_id)
        DO UPDATE SET price = EXCLUDED.price;
        
        -- Aplicar markups configurados para outras listas
        -- Lista 2 (Base Selling Price)
        INSERT INTO prices (variantid, price_list_id, price)
        VALUES (
            variant_id, 
            2, 
            update_record.new_supplier_price * (1 + COALESCE(
                (SELECT CAST(config_value AS NUMERIC) / 100 FROM pricing_config WHERE config_key = 'markup_base_selling_price'),
                0.25
            ))
        )
        ON CONFLICT (variantid, price_list_id)
        DO UPDATE SET price = EXCLUDED.price;
        
        -- Lista 4 (Preço Cliente)
        INSERT INTO prices (variantid, price_list_id, price)
        VALUES (
            variant_id, 
            4, 
            update_record.new_supplier_price * (1 + COALESCE(
                (SELECT CAST(config_value AS NUMERIC) / 100 FROM pricing_config WHERE config_key = 'markup_customer_price'),
                0.35
            ))
        )
        ON CONFLICT (variantid, price_list_id)
        DO UPDATE SET price = EXCLUDED.price;
    END IF;
    
    -- 4. Registrar no histórico
    INSERT INTO price_history (
        variantid,
        price_list_id,
        old_price,
        new_price,
        change_reason,
        changed_by,
        changed_at
    ) VALUES (
        variant_id,
        1, -- Lista de fornecedor
        update_record.current_supplier_price,
        update_record.new_supplier_price,
        'Aprovação automática de update da Geko: ' || COALESCE(p_notes, 'Sem notas'),
        p_admin_user_id,
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Configurações de aprovação automática (opcional)
INSERT INTO pricing_config (config_key, config_value, data_type, description) VALUES
('geko_auto_approval_threshold', '5', 'string', 'Percentagem máxima de mudança de preço para aprovação automática'),
('geko_approval_required', 'true', 'string', 'Se true, mudanças da Geko requerem aprovação manual'),
('geko_update_retention_days', '30', 'string', 'Dias para manter updates pendentes antes de expirar')
ON CONFLICT (config_key) DO NOTHING;

-- 9. View para facilitar consultas de updates pendentes
CREATE OR REPLACE VIEW pending_geko_updates_summary AS
SELECT 
    pgu.*,
    p.name as product_name,
    p.brand,
    u.first_name || ' ' || u.last_name as reviewed_by_name,
    EXTRACT(DAYS FROM (pgu.expires_at - NOW())) as days_until_expiry
FROM pending_geko_price_updates pgu
LEFT JOIN products p ON pgu.ean = p.ean
LEFT JOIN users u ON pgu.reviewed_by = u.user_id
WHERE pgu.status = 'pending'
ORDER BY pgu.detected_at DESC;

COMMENT ON TABLE pending_geko_price_updates IS 'Tabela para armazenar atualizações de preços da Geko que aguardam aprovação admin';
COMMENT ON FUNCTION detect_geko_price_changes IS 'Função para detectar automaticamente mudanças significativas de preços da Geko';
COMMENT ON FUNCTION approve_pending_price_update IS 'Função para aprovar e aplicar updates pendentes de preços da Geko';
COMMENT ON VIEW pending_geko_updates_summary IS 'View resumida dos updates pendentes com informações do produto e revisor';

-- Mensagem de confirmação
SELECT 'Migration V9: Sistema de Aprovação de Preços Geko - Executada com sucesso!' as result; 