-- =======================================================================================
-- Migração V4: Adicionar Configurações de Preços
--
-- Data: 2025-01-21
-- Descrição: Adiciona tabela para configurações de preços, incluindo margem base configurável
-- =======================================================================================

-- Tabela para armazenar configurações de preços do sistema
CREATE TABLE IF NOT EXISTS pricing_config (
    config_id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pricing_config IS 'Configurações de preços do sistema, incluindo margem base e outras configurações comerciais';

-- Trigger para updated_at
DROP TRIGGER IF EXISTS set_timestamp_pricing_config ON pricing_config;
CREATE TRIGGER set_timestamp_pricing_config
BEFORE UPDATE ON pricing_config
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Inserir configurações padrão
INSERT INTO pricing_config (config_key, config_value, description, data_type) VALUES
('base_margin_percentage', '25.0', 'Margem base aplicada sobre o preço de fornecedor para calcular preço de venda (em percentagem)', 'number'),
('currency_symbol', '€', 'Símbolo da moeda padrão', 'string'),
('price_rounding_method', 'round', 'Método de arredondamento de preços (round, floor, ceil)', 'string'),
('tax_included_in_base_price', 'false', 'Se o IVA está incluído no preço base', 'boolean'),
('auto_update_prices_on_sync', 'true', 'Se os preços devem ser atualizados automaticamente durante a sincronização com fornecedor', 'boolean')
ON CONFLICT (config_key) DO NOTHING;

-- Função auxiliar para obter configuração de preços
CREATE OR REPLACE FUNCTION get_pricing_config(key_name TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT config_value INTO result 
    FROM pricing_config 
    WHERE config_key = key_name;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função auxiliar para obter margem base como decimal
CREATE OR REPLACE FUNCTION get_base_margin_decimal()
RETURNS DECIMAL(5,2) AS $$
DECLARE
    margin_percentage TEXT;
    margin_decimal DECIMAL(5,2);
BEGIN
    SELECT get_pricing_config('base_margin_percentage') INTO margin_percentage;
    
    IF margin_percentage IS NULL THEN
        -- Valor padrão se não encontrar configuração
        RETURN 25.0;
    END IF;
    
    margin_decimal := margin_percentage::DECIMAL(5,2);
    RETURN margin_decimal;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função para calcular preço de venda com margem configurável
CREATE OR REPLACE FUNCTION calculate_selling_price(supplier_price DECIMAL(12,4))
RETURNS DECIMAL(12,4) AS $$
DECLARE
    margin_percentage DECIMAL(5,2);
    selling_price DECIMAL(12,4);
BEGIN
    IF supplier_price IS NULL OR supplier_price <= 0 THEN
        RETURN NULL;
    END IF;
    
    margin_percentage := get_base_margin_decimal();
    selling_price := supplier_price * (1 + margin_percentage / 100);
    
    -- Arredondar para 2 casas decimais
    RETURN ROUND(selling_price, 2);
END;
$$ LANGUAGE plpgsql STABLE; 