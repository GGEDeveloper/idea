# Implementação do Botão "Guardar" para Configurações de Preços

## Problema Solicitado
O utilizador queria que as alterações na percentagem da margem base apenas fossem aplicadas quando pressionasse o botão "Guardar", em vez de serem aplicadas automaticamente.

## Solução Implementada

### 1. Estado Local para Alterações Pendentes
- **`pricingFormData`**: Estado local que armazena os valores do formulário
- **`pricingHasChanges`**: Boolean que indica se há alterações pendentes
- **Separação** entre dados salvos (`pricingConfig`) e dados do formulário (`pricingFormData`)

### 2. Funcionalidades Adicionadas

#### Gestão de Estado:
```javascript
const [pricingFormData, setPricingFormData] = useState({});
const [pricingHasChanges, setPricingHasChanges] = useState(false);
```

#### Funções Principais:
- **`updatePricingFormData(key, value)`**: Atualiza apenas o estado local
- **`savePricingConfig()`**: Envia alterações para a API usando endpoint batch
- **`resetPricingChanges()`**: Reverte alterações pendentes
- **`loadPricingConfig()`**: Inicializa formulário com valores atuais

### 3. Interface Visual

#### Indicadores de Alterações Pendentes:
- **Ponto animado** laranja no cabeçalho da secção
- **Texto "Alterações pendentes"** visível
- **Campos destacados** com borda laranja quando há alterações
- **Aviso** sobre necessidade de guardar alterações

#### Botões de Ação:
- **"Guardar Configurações"**: Apenas ativo quando há alterações
- **"Cancelar"**: Aparece quando há alterações pendentes
- **"Recalcular"**: Desabilitado quando há alterações não guardadas

#### Estatísticas Dinâmicas:
- **Margem Atual**: Valor atualmente guardado na base de dados
- **Nova Margem (pendente)**: Valor do formulário (quando há alterações)

### 4. Validações e Segurança

#### Proteção contra Perda de Dados:
- **Aviso antes de sair**: Prompt do browser quando há alterações pendentes
- **Botão recálculo bloqueado**: Previne cálculos com valores não guardados
- **Estado visual claro**: Utilizador sempre sabe o estado das alterações

#### Validação de API:
- **Endpoint batch**: `/api/admin/pricing/config/batch` para múltiplas configurações
- **Validação de valores**: Margem entre 0-1000%
- **Feedback imediato**: Toast notifications para sucesso/erro

### 5. Fluxo de Utilizador

#### Antes (Problemático):
1. Utilizador altera margem → **Aplicado imediatamente**
2. Preços recalculados automaticamente
3. Sem controlo sobre quando aplicar

#### Depois (Solução):
1. Utilizador altera margem → **Guardado apenas localmente**
2. Interface mostra "Alterações pendentes"
3. Utilizador clica "Guardar Configurações"
4. **Apenas então** a API é chamada e preços podem ser recalculados

### 6. Benefícios da Implementação

#### Para o Utilizador:
- **Controlo total** sobre quando aplicar alterações
- **Possibilidade de cancelar** alterações antes de guardar
- **Feedback visual claro** sobre o estado das configurações
- **Proteção** contra alterações acidentais

#### Para o Sistema:
- **Menos chamadas à API** (batch operations)
- **Transações atómicas** (todas as configurações ou nenhuma)
- **Estado consistente** entre interface e base de dados
- **Melhor performance** (não recalcula a cada keystroke)

### 7. Endpoints API Utilizados

#### Novo Endpoint Batch:
```
PUT /api/admin/pricing/config/batch
{
  "configs": [
    { "config_key": "base_margin_percentage", "config_value": 30 },
    { "config_key": "currency_symbol", "config_value": "€" },
    { "config_key": "auto_update_prices_on_sync", "config_value": true }
  ]
}
```

#### Resposta:
- **Sucesso**: Todas as configurações atualizadas + recálculo automático se necessário
- **Erro**: Rollback completo + mensagem de erro específica

### 8. Comportamentos Especiais

#### Recálculo de Preços:
- **Automático**: Quando margem base é alterada via API
- **Manual**: Botão disponível apenas quando não há alterações pendentes
- **Bloqueado**: Quando há alterações não guardadas (para evitar inconsistências)

#### Navegação:
- **Aviso antes de sair**: Browser prompt se há alterações pendentes
- **Reset automático**: Quando dados são carregados da API
- **Estado limpo**: Após guardar com sucesso

## Resultado Final

O utilizador agora tem **controlo total** sobre quando as alterações de margem são aplicadas, com **feedback visual claro** e **proteção contra perda de dados**. As alterações só são efetivamente aplicadas quando o botão "Guardar" é pressionado, exatamente como solicitado. 