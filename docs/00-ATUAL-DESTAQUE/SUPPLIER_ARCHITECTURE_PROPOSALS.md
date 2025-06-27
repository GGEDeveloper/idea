# 🏗️ **Propostas de Arquitetura: Produtos Próprios + Fornecedores Externos**

**Data:** 27 de Janeiro de 2025  
**Contexto:** Migração da arquitetura atual (Geko como core) para nova perspectiva (produtos próprios como core + Geko como fornecedor externo)  
**Objetivo:** Manter sistema robusto, adicionar flexibilidade, preservar compatibilidade

---

## 📊 **ANÁLISE DA SITUAÇÃO ATUAL**

### **🔍 Sistema Geko Existente (Para Migrar):**
```
Fluxo Atual:
API Geko XML → geko_products (staging) → ETL → products/variants/images/prices
                     ↓                    ↓
               Raw XML JSONB        Produtos Finais
```

**Componentes Críticos Identificados:**
- **📦 Staging:** `geko_products` com `raw_data` JSONB
- **🔄 ETL:** `process_staged_data.py` transforma XML → estrutura normalizada  
- **🌐 API Sync:** `gekoSyncService.cjs` + `GekoApiClient.cjs`
- **💰 Pricing:** Sistema de margens configuráveis (25% padrão)
- **🖼️ Imagens:** URLs externas (`https://b2b.geko.pl/zasoby/import/`)
- **📈 Admin:** 22 páginas completas gerindo sistema unificado

### **🎯 Nova Perspectiva Requerida:**
```
Arquitectura Desejada:
Produtos Próprios (Core) + Geko (External) + Outros (External)
            ↓                    ↓               ↓
        CSV Manual         API Automática   CSV Manual
            ↓                    ↓               ↓
      Imagens Físicas     URLs Externas   Imagens Físicas
            ↓                    ↓               ↓
        Interface Unificada Frontend/Admin
```

---

## 🔥 **PROPOSTA 1: MIGRAÇÃO GRADUAL COM COMPATIBILIDADE**
**(Risco Baixo - Implementação Faseada - RECOMENDADA)**

### **🎯 Estratégia: Preserved Legacy + New Core**

#### **Fase 1: Criar Sistema de Produtos Próprios (2-3 semanas)**
```sql
-- Sistema de fornecedores (unificado)
CREATE TABLE suppliers (
    supplier_id TEXT PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    supplier_type TEXT NOT NULL, -- 'internal', 'api', 'csv'
    is_active BOOLEAN DEFAULT true,
    
    -- Configurações de pricing
    default_markup_percentage NUMERIC(5,2) DEFAULT 25.0,
    pricing_strategy TEXT DEFAULT 'percentage', -- 'percentage', 'manual', 'hybrid'
    
    -- Configurações técnicas
    sync_method TEXT, -- 'api', 'csv', 'manual'
    api_endpoint TEXT,
    api_key_ref TEXT,
    import_schedule TEXT, -- cron format
    
    -- Metadados
    contact_info JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir suppliers base
INSERT INTO suppliers VALUES 
('internal', 'Produtos Próprios', 'internal', true, 30.0, 'hybrid'),
('geko', 'Geko Poland', 'api', true, 25.0, 'percentage');

-- Estender tabela products existente (NON-BREAKING)
ALTER TABLE products ADD COLUMN supplier_id TEXT DEFAULT 'geko';
ALTER TABLE products ADD COLUMN import_source TEXT DEFAULT 'geko_api';
ALTER TABLE products ADD COLUMN manual_override BOOLEAN DEFAULT false;

-- Estender product_images (HYBRID STORAGE)
ALTER TABLE product_images ADD COLUMN storage_type TEXT DEFAULT 'url';
ALTER TABLE product_images ADD COLUMN local_file_path TEXT;
ALTER TABLE product_images ADD COLUMN file_size INTEGER;
ALTER TABLE product_images ADD COLUMN uploaded_by UUID REFERENCES users(user_id);

-- Sistema de preços flexível
CREATE TABLE supplier_pricing_rules (
    rule_id SERIAL PRIMARY KEY,
    supplier_id TEXT REFERENCES suppliers(supplier_id),
    applies_to TEXT, -- 'all', 'category', 'brand', 'product'
    target_value TEXT, -- categoria_id, brand name, ou 'all'
    markup_percentage NUMERIC(5,2),
    fixed_price_override NUMERIC(12,4),
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    effective_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);
```

#### **Fase 2: Interface Admin para Produtos Próprios (1-2 semanas)**
```typescript
// Nova página: /admin/products/internal
// Funcionalidades:
// - Upload CSV com preview
// - Upload múltiplas imagens (drag & drop)
// - Gestão de categorias (existentes + novas)
// - Pricing rules per categoria/marca
// - Bulk operations

// Nova página: /admin/suppliers  
// Gestão centralizada de todos os fornecedores
```

#### **Fase 3: Views Unificadas (1 semana)**
```sql
-- View unificada para produtos (BACKWARDS COMPATIBLE)
CREATE VIEW products_unified AS
SELECT 
    p.ean,
    p.name,
    p.brand,
    p.supplier_id,
    s.supplier_name,
    s.supplier_type,
    
    -- Preços com lógica híbrida
    CASE 
        WHEN p.manual_override THEN 
            (SELECT price FROM prices pr WHERE pr.variantid = pv.variantid AND pr.price_list_id = 2)
        ELSE 
            calculate_selling_price_with_supplier(pv.supplier_price, s.supplier_id)
    END as calculated_price,
    
    -- Stock unificado
    pv.stockquantity as current_stock,
    
    -- Imagens híbridas
    (SELECT json_agg(
        json_build_object(
            'url', CASE 
                WHEN pi.storage_type = 'url' THEN pi.url
                ELSE '/api/images/' || pi.local_file_path
            END,
            'is_primary', pi.is_primary,
            'alt', pi.alt
        )
    ) FROM product_images pi WHERE pi.ean = p.ean) as images,
    
    p.active,
    p.is_featured,
    p.created_at
FROM products p
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
LEFT JOIN product_variants pv ON p.ean = pv.ean
WHERE p.active = true;

-- View para admin (FULL DATA)
CREATE VIEW admin_products_view AS
SELECT 
    p.*,
    s.supplier_name,
    s.supplier_type,
    s.default_markup_percentage,
    gp.supplier_price as geko_supplier_price,
    gp.stock_quantity as geko_stock,
    gp.last_sync as geko_last_sync
FROM products p
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
LEFT JOIN geko_products gp ON p.ean = gp.ean;
```

#### **Fase 4: Migration Helper Scripts (1 semana)**
```python
# Script: migrate_geko_to_external.py
def migrate_existing_geko_products():
    """
    Migra produtos Geko existentes para nova estrutura
    mantendo compatibilidade total
    """
    # 1. Update existing products: supplier_id = 'geko'
    # 2. Preserve all data and relationships
    # 3. Update admin interfaces gradually
    # 4. Zero downtime migration
```

### **✅ Vantagens Proposta 1:**
- **Zero Breaking Changes** - sistema atual continua funcional
- **Migração Gradual** - implementação por fases testáveis
- **Backwards Compatible** - APIs e interfaces existentes mantidas
- **Risk Mitigation** - rollback possível a qualquer altura
- **Team Productivity** - desenvolvimento pode continuar em paralelo

### **❌ Desvantagens:**
- **Debt Técnico** - mantém alguma complexidade legacy
- **Dupla Manutenção** - durante período de transição

---

## 🔥 **PROPOSTA 2: REFACTORING ARQUITETURAL COMPLETO**
**(Risco Médio - Clean Architecture)**

### **🎯 Estratégia: Complete System Redesign**

#### **Nova Arquitetura de Dados:**
```sql
-- NOVA ESTRUTURA PRINCIPAL

-- 1. Core Products (Produtos Próprios)
CREATE TABLE core_products (
    ean TEXT PRIMARY KEY,
    internal_sku TEXT UNIQUE,
    name TEXT NOT NULL,
    short_description TEXT,
    long_description TEXT,
    brand TEXT,
    base_cost NUMERIC(12,4),
    suggested_price NUMERIC(12,4),
    markup_percentage NUMERIC(5,2),
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    supplier_lead_time INTEGER, -- dias
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. External Suppliers (Incluindo Geko)
CREATE TABLE external_suppliers (
    supplier_id TEXT PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    supplier_type TEXT NOT NULL, -- 'api', 'csv', 'ftp'
    base_url TEXT,
    auth_config JSONB,
    sync_frequency TEXT, -- 'hourly', 'daily', 'weekly'
    markup_config JSONB,
    is_active BOOLEAN DEFAULT true
);

-- 3. External Products 
CREATE TABLE external_products (
    ean TEXT,
    supplier_id TEXT REFERENCES external_suppliers(supplier_id),
    supplier_product_id TEXT,
    name TEXT NOT NULL,
    brand TEXT,
    supplier_price NUMERIC(12,4),
    calculated_price NUMERIC(12,4),
    stock_quantity INTEGER DEFAULT 0,
    last_sync TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'pending',
    raw_data JSONB,
    is_active BOOLEAN DEFAULT true,
    PRIMARY KEY (ean, supplier_id)
);

-- 4. Unified Product Catalog (MATERIALIZED VIEW)
CREATE MATERIALIZED VIEW unified_product_catalog AS
-- Union de core_products + external_products com lógicas específicas
SELECT 
    ean, 'internal' as source_type, name, brand, suggested_price as price,
    stock_quantity, is_active, is_featured, '/images/internal/' as image_base_path
FROM core_products WHERE is_active = true
UNION ALL
SELECT 
    ean, supplier_id as source_type, name, brand, calculated_price as price,
    stock_quantity, is_active, false as is_featured, '/images/external/' as image_base_path
FROM external_products WHERE is_active = true;

-- Refresh automático da view
CREATE OR REPLACE FUNCTION refresh_product_catalog()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY unified_product_catalog;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

#### **Sistema de Imagens Renovado:**
```sql
CREATE TABLE product_images_v2 (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_ean TEXT NOT NULL,
    source_type TEXT NOT NULL, -- 'internal', 'geko', 'external'
    
    -- Para imagens internas
    local_file_path TEXT,
    original_filename TEXT,
    file_size INTEGER,
    mime_type TEXT,
    
    -- Para imagens externas
    external_url TEXT,
    
    -- Metadados
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES users(user_id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **✅ Vantagens Proposta 2:**
- **Clean Architecture** - estrutura limpa e bem definida
- **Performance Otimizada** - materialized views para queries rápidas
- **Flexibilidade Máxima** - arquitetura preparada para múltiplos fornecedores
- **Separation of Concerns** - lógicas específicas bem isoladas

### **❌ Desvantagens:**
- **Risco Alto** - mudanças breaking em sistema estável
- **Complexidade Migration** - migração de dados complexa
- **Timeline Longo** - 4-6 semanas implementação + testes
- **Downtime Necessário** - período de indisponibilidade

---

## 🔥 **PROPOSTA 3: HYBRID MODULAR APPROACH**
**(Risco Médio - Modularidade Máxima)**

### **🎯 Estratégia: Plugin Architecture + Service Layer**

#### **Arquitetura de Serviços:**
```typescript
// Service Layer Architecture
interface ProductProvider {
    getProducts(filters: FilterOptions): Promise<Product[]>;
    updateStock(ean: string, quantity: number): Promise<void>;
    calculatePricing(basePrice: number): Promise<number>;
    syncData(): Promise<SyncResult>;
}

// Implementações específicas
class InternalProductProvider implements ProductProvider {
    // Gestão de produtos próprios via CSV
}

class GekoProductProvider implements ProductProvider {
    // Gestão via API Geko (existente)
}

class GenericCSVProvider implements ProductProvider {
    // Provider genérico para outros fornecedores CSV
}

// Orchestrator
class ProductAggregatorService {
    providers: Map<string, ProductProvider> = new Map();
    
    async getUnifiedCatalog(): Promise<Product[]> {
        // Agrega dados de todos os providers
    }
}
```

#### **Plugin Registry:**
```sql
CREATE TABLE provider_configs (
    provider_id TEXT PRIMARY KEY,
    provider_type TEXT NOT NULL, -- 'internal', 'geko_api', 'csv', 'ftp'
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sync_schedule TEXT,
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurações de exemplo
INSERT INTO provider_configs VALUES
('internal', 'internal', '{"base_path": "/uploads/internal"}'),
('geko', 'geko_api', '{"api_url": "https://b2b.geko.pl/", "api_key": "***"}'),
('supplier_x', 'csv', '{"csv_path": "/uploads/supplier_x", "delimiter": ","}');
```

### **✅ Vantagens Proposta 3:**
- **Extensibilidade Infinita** - novos fornecedores = novos plugins
- **Isolation** - falha num provider não afeta outros
- **Testability** - cada provider testado independentemente
- **Configuration Driven** - setup via interface admin

### **❌ Desvantagens:**
- **Over-Engineering** - complexidade pode ser excessiva para necessidades atuais
- **Learning Curve** - equipa precisa adaptar-se à nova arquitetura
- **Debugging Complexity** - mais difícil debuggar problemas inter-serviços

---

## 🔥 **PROPOSTA 4: GEKO EXTERNAL + TABLE PARTITIONING**
**(Risco Baixo - Performance Focada)**

### **🎯 Estratégia: Table Partitioning + Supplier Separation**

#### **Structured Data Separation:**
```sql
-- Partitioned Products Table
CREATE TABLE products_master (
    ean TEXT,
    supplier_type TEXT,
    name TEXT NOT NULL,
    brand TEXT,
    base_price NUMERIC(12,4),
    stock_quantity INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY LIST (supplier_type);

-- Partições específicas
CREATE TABLE products_internal PARTITION OF products_master
FOR VALUES IN ('internal');

CREATE TABLE products_geko PARTITION OF products_master  
FOR VALUES IN ('geko');

CREATE TABLE products_external PARTITION OF products_master
FOR VALUES IN ('external_csv', 'external_api');

-- Indexes específicos por partição
CREATE INDEX idx_products_internal_ean ON products_internal (ean);
CREATE INDEX idx_products_geko_sync ON products_geko (ean, created_at);
```

#### **Supplier-Specific Storage:**
```
file_structure/
├── products/
│   ├── internal/
│   │   ├── images/
│   │   ├── csv_imports/
│   │   └── temp/
│   ├── geko/
│   │   ├── cache/
│   │   └── temp/
│   └── external/
│       ├── supplier_x/
│       └── supplier_y/
```

### **✅ Vantagens Proposta 4:**
- **Performance Otimizada** - queries específicas por supplier
- **Data Isolation** - dados separados fisicamente
- **Backup Granular** - backup/restore por supplier
- **Query Optimization** - indexes específicos

### **❌ Desvantagens:**
- **Complexity Queries** - necessidade de unions para dados globais
- **Maintenance Overhead** - múltiplas partições para gerir

---

## 🎯 **RECOMENDAÇÃO FINAL**

### **🏆 PROPOSTA HÍBRIDA: 1 + 3 (Elementos Modulares)**

**Estratégia Recomendada:** Migração Gradual com Elementos Modulares

#### **Implementação Sugerida:**
1. **Base Sólida:** Proposta 1 (migração gradual, baixo risco)
2. **Elementos Modulares:** Service layer da Proposta 3 para extensibilidade
3. **Performance Optimization:** Views materializadas da Proposta 2

#### **Timeline Otimizada (4-5 semanas):**
```
Semana 1: Setup base + suppliers table + product extensions
Semana 2: Sistema upload imagens + CSV import interface  
Semana 3: Admin interfaces + pricing rules
Semana 4: Views unificadas + service layer
Semana 5: Testes + refinements + documentation
```

#### **Implementação Phased:**
```sql
-- FASE 1: Estrutura Base (Non-Breaking)
ALTER TABLE products ADD COLUMN supplier_id TEXT DEFAULT 'geko';
CREATE TABLE suppliers (...);
CREATE TABLE supplier_pricing_rules (...);

-- FASE 2: Sistema Imagens Híbrido  
ALTER TABLE product_images ADD COLUMN storage_type TEXT DEFAULT 'url';
CREATE TABLE internal_product_images (...);

-- FASE 3: Views Unificadas
CREATE VIEW products_unified AS (...);
CREATE MATERIALIZED VIEW admin_dashboard_data AS (...);

-- FASE 4: Service Layer (TypeScript)
ProductProviderFactory.register('internal', new InternalProvider());
ProductProviderFactory.register('geko', new GekoProvider());
```

### **🎯 Resultado Final:**
- ✅ **Produtos próprios como core** via CSV + imagens físicas
- ✅ **Geko como external supplier** mantendo API atual
- ✅ **Interface unificada** transparente para utilizador
- ✅ **Pricing independente** mas sistema unified
- ✅ **Zero breaking changes** durante transição
- ✅ **Extensibilidade futura** para novos fornecedores
- ✅ **Admin robusto** com gestão centralizada

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

### **Validações Técnicas:**
- [ ] Backup completo da BD antes de qualquer alteração
- [ ] Testes de performance com dataset atual
- [ ] Verificação de compatibility com APIs existentes
- [ ] Plan de rollback detalhado

### **Validações de Negócio:**
- [ ] Mapeamento de categorias existentes vs novas
- [ ] Definição de pricing rules para produtos próprios  
- [ ] Workflow de aprovação para novos produtos
- [ ] Integração com sistema de encomendas existente

### **Validações de UX:**
- [ ] Interface admin mantém usabilidade atual
- [ ] Frontend cliente não sofre disruption
- [ ] Sistema de pesquisa funciona com dados unificados
- [ ] Performance de carregamento mantida ou melhorada

---

**Esta arquitetura híbrida oferece o melhor de todos os mundos: segurança na migração, flexibilidade para o futuro, e performance otimizada!** 🚀 