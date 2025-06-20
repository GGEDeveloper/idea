# Sistema de Configuração de Margem Base - Resumo da Implementação

## Objetivo
Implementar um sistema configurável de margem base para o cálculo do preço de venda ao público, substituindo as margens hardcoded no código.

## Implementação Realizada

### 1. Base de Dados (Migração V4)

**Tabela `pricing_config`:**
- Armazena configurações de preços do sistema
- Campos: `config_id`, `config_key`, `config_value`, `description`, `data_type`, etc.
- Configurações padrão incluídas:
  - `base_margin_percentage`: 25.0% (configurável)
  - `currency_symbol`: €
  - `price_rounding_method`: round
  - `tax_included_in_base_price`: false
  - `auto_update_prices_on_sync`: true

**Funções SQL:**
- `get_pricing_config(key_name)`: Obter configuração específica
- `get_base_margin_decimal()`: Obter margem base como decimal
- `calculate_selling_price(supplier_price)`: Calcular preço de venda com margem configurável

### 2. API Administrativa

**Endpoint: `/api/admin/pricing`**
- `GET /config`: Obter todas as configurações de preços
- `PUT /config/:configKey`: Atualizar configuração específica
- `POST /recalculate`: Recalcular todos os preços base
- `GET /stats`: Obter estatísticas dos preços
- `PUT /config/batch`: Atualizar múltiplas configurações

**Funcionalidades:**
- Validação automática de valores (margem entre 0-1000%)
- Recálculo automático de preços quando margem é alterada
- Estatísticas em tempo real (cobertura, preços médios, etc.)

### 3. Interface Administrativa

**Página de Configurações (`/admin/settings`):**
- Novo card "Configurações de Preços"
- Campo para definir margem base (%)
- Controle para símbolo da moeda
- Toggle para atualização automática
- Botão para recálculo manual de preços

**Estatísticas de Preços:**
- Total de variantes
- Variantes com preço de fornecedor
- Variantes com preço de venda
- Cobertura de preços (%)
- Preço médio
- Margem atual

### 4. Scripts de Sincronização Atualizados

**`process_staged_data.py`:**
- Usa função SQL `calculate_selling_price()` para preços de venda
- Preços de fornecedor inseridos diretamente
- Preços de venda calculados com margem configurável

**`gekoSyncService.cjs`:**
- Removida margem hardcoded (30%)
- Usa função SQL para cálculo de preços
- Atualiza tanto preços de fornecedor quanto de venda
- Baseia-se em `variantid` em vez de `product_ean`

**`products.cjs`:**
- Função `calculateMarkup()` agora usa margem configurável
- Busca margem da base de dados via função SQL
- Fallback para 30% em caso de erro

### 5. Estrutura de Preços

**Listas de Preços:**
- ID 1: "Supplier Price" (preços de fornecedor)
- ID 2: "Base Selling Price" (preços de venda com margem)
- ID 3: "Promotional Price" (preços promocionais)

**Fluxo de Cálculo:**
1. Preço de fornecedor é inserido na tabela `product_variants.supplier_price`
2. Preço de fornecedor é inserido em `prices` (price_list_id = 1)
3. Preço de venda é calculado usando `calculate_selling_price()` (price_list_id = 2)
4. Função SQL consulta margem atual em `pricing_config`
5. Aplica fórmula: `supplier_price * (1 + margin_percentage / 100)`

## Vantagens da Implementação

1. **Flexibilidade:** Margem pode ser alterada sem redeploy
2. **Automação:** Recálculo automático quando margem é alterada
3. **Auditoria:** Histórico de alterações na configuração
4. **Validação:** Verificação de valores válidos (0-1000%)
5. **Estatísticas:** Visibilidade sobre impacto das mudanças
6. **Consistência:** Uma única fonte de verdade para margem
7. **Performance:** Cálculos feitos na base de dados

## Como Utilizar

### Alterar Margem Base:
1. Aceder a `/admin/settings`
2. Navegar para "Configurações de Preços"
3. Alterar valor no campo "Margem Base (%)"
4. Preços são automaticamente recalculados

### Recálculo Manual:
- Usar botão "Recalcular Todos os Preços" na interface
- Ou chamada POST para `/api/admin/pricing/recalculate`

### Monitorização:
- Ver estatísticas em tempo real no card "Estatísticas de Preços"
- Monitorizar cobertura de preços e valores médios

## Migração Executada

A migração V4 foi executada com sucesso na base de dados Neon:
- Tabela `pricing_config` criada
- Funções SQL criadas
- Configurações padrão inseridas
- Triggers para `updated_at` configurados

## Impacto nos Preços Existentes

- Preços existentes mantêm-se inalterados até próxima sincronização
- Nova margem aplica-se apenas a novos produtos ou recálculos manuais
- Sistema é backwards compatible com estrutura existente 