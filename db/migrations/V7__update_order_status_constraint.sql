-- ============================================
-- MIGRAÇÃO V7: Atualização da Constraint de Status de Encomendas
-- Data: 2025-01-28
-- Descrição: Expandir os estados permitidos de 6 para 11 estados avançados
-- ============================================

-- Remover a constraint antiga
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;

-- Adicionar nova constraint com todos os 11 estados permitidos
ALTER TABLE orders ADD CONSTRAINT orders_order_status_check 
CHECK (order_status IN (
    'pending_approval',    -- Pendente de Aprovação (10%)
    'approved',           -- Aprovada (20%)
    'processing',         -- Em Processamento (30%)
    'ready_to_ship',      -- Pronta para Envio (40%)
    'shipped',            -- Enviada (60%)
    'in_transit',         -- Em Rota (70%)
    'out_for_delivery',   -- Saiu para Entrega (85%)
    'delivered',          -- Entregue (100%)
    'rejected',           -- Rejeitada (0%)
    'cancelled',          -- Cancelada (0%)
    'returned'            -- Devolvida (0%)
));

-- Adicionar comentário explicativo
COMMENT ON CONSTRAINT orders_order_status_check ON orders IS 
'Constraint atualizada em V7 (2025-01-28) para suportar 11 estados avançados de workflow de encomendas';

-- Log da migração
INSERT INTO schema_version (version, description, executed_at) 
VALUES (7, 'Update order status constraint to support 11 advanced workflow states', NOW())
ON CONFLICT (version) DO UPDATE SET 
    description = EXCLUDED.description,
    executed_at = EXCLUDED.executed_at; 