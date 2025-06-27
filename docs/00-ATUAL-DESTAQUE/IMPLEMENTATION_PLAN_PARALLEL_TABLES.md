# 🚀 **PLANO DE IMPLEMENTAÇÃO: PARALLEL TABLES APPROACH**

**Data:** 27 de Janeiro de 2025  
**Proposta Escolhida:** Parallel Tables (100% Aditiva)  
**Princípio:** ZERO alterações no sistema atual + aprovação prévia para BD

---

## 📋 **CHECKLIST DE REGRAS E OBJETIVOS**

### ✅ **Regras Críticas Cumpridas:**
- [ ] **BD Changes:** Aprovação prévia obrigatória antes de qualquer CREATE TABLE
- [ ] **Sistema Atual:** 100% intocável, zero alterações
- [ ] **Produtos Próprios:** Via CSV manual + imagens físicas
- [ ] **Interface Admin:** Robusta e integrada
- [ ] **Pricing:** Sistema flexível específico para produtos próprios
- [ ] **Logs:** Detalhados de todas as operações
- [ ] **Zero Breaking Changes:** Compatibilidade total mantida

### ✅ **Funcionalidades Alvo:**
- [ ] Import CSV de produtos próprios
- [ ] Upload físico de imagens (drag & drop)
- [ ] Gestão de stock manual
- [ ] Sistema de pricing por lista/categoria/marca
- [ ] Interface unificada (Geko + Produtos Próprios)
- [ ] Admin pages dedicadas
- [ ] Logs de operações

---

## 🗓️ **TIMELINE DE IMPLEMENTAÇÃO (4 SEMANAS)**

### **📅 SEMANA 1: ESTRUTURA BASE + APROVAÇÃO BD**
**Objetivo:** Setup das novas tabelas (APÓS APROVAÇÃO)

#### **🔹 Tarefas:**
1. **SQL Review & Approval** - Apresentar SQL das 8 novas tabelas para aprovação
2. **Database Setup** - Executar CREATE TABLE (só após aprovação)
3. **Initial Data** - Inserir dados base (supplier_registry, plugin_configs)
4. **Testing** - Validar integridade e foreign keys

#### **📊 Entregáveis:**
- [ ] 8 novas tabelas criadas e testadas
- [ ] Supplier registry configurado
- [ ] Plugin configs inicializados
- [ ] Documentação de estrutura

---

### **📅 SEMANA 2: CSV IMPORT SYSTEM**
**Objetivo:** Interface completa para importação CSV

#### **🔹 Tarefas:**
1. **Admin Page** - `/admin/internal-products/import`
2. **CSV Parser** - Validação, preview, error handling
3. **Background Processing** - Queue system para imports grandes
4. **Logs Interface** - Visualização de imports e erros

#### **📊 Entregáveis:**
- [ ] Interface de upload CSV com preview
- [ ] Sistema de validação de dados
- [ ] Processamento em background
- [ ] Dashboard de logs de import

---

### **📅 SEMANA 3: SISTEMA DE IMAGENS FÍSICAS**
**Objetivo:** Upload e gestão de imagens locais

#### **🔹 Tarefas:**
1. **Upload API** - `/api/internal/images/upload`
2. **Image Processing** - Resize, otimização, thumbnails
3. **File Management** - Organização por produto/categoria
4. **Admin Interface** - Drag & drop, preview, gestão

#### **📊 Entregáveis:**
- [ ] API de upload com validação
- [ ] Processamento automático de imagens
- [ ] Interface admin para gestão
- [ ] Sistema de thumbnails

---

### **📅 SEMANA 4: UNIFICAÇÃO + FRONTEND**
**Objetivo:** Interface unificada e integração completa

#### **🔹 Tarefas:**
1. **Unified View** - `unified_product_catalog` SQL view
2. **Frontend Updates** - Integrar produtos internos nas listagens
3. **Search Integration** - Pesquisa unified
4. **Admin Dashboard** - Estatísticas e gestão centralizada

#### **📊 Entregáveis:**
- [ ] View SQL unificada funcionando
- [ ] Frontend mostra produtos de ambas as fontes
- [ ] Pesquisa integrada
- [ ] Dashboard admin completo

---

## 📊 **ESTRUTURA DE TABELAS PARA APROVAÇÃO**

### **🔒 APROVAÇÃO REQUERIDA - BD CHANGES**

**IMPORTANTE:** Seguindo as regras do projeto, preciso de **aprovação categórica** antes de executar qualquer SQL na base de dados.

#### **📋 SQL DAS NOVAS TABELAS (8 tabelas):**

```sql
-- ============================================
-- NOVAS TABELAS PARA PRODUTOS PRÓPRIOS
-- Versão: 1.0 - Para aprovação
-- Zero alterações em tabelas existentes
-- ============================================

-- 1. SUPPLIER REGISTRY (Central)
CREATE TABLE supplier_registry (
    supplier_id TEXT PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    supplier_type TEXT NOT NULL CHECK (supplier_type IN ('internal', 'external_csv', 'api')),
    is_active BOOLEAN DEFAULT true,
    markup_percentage NUMERIC(5,2) DEFAULT 30.0,
    import_config JSONB,
    contact_info JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INTERNAL PRODUCTS (Produtos Próprios)
CREATE TABLE internal_products (
    internal_ean TEXT PRIMARY KEY,
    internal_sku TEXT UNIQUE,
    name TEXT NOT NULL,
    short_description TEXT,
    long_description TEXT,
    brand TEXT,
    base_cost NUMERIC(12,4),
    suggested_retail_price NUMERIC(12,4),
    markup_percentage NUMERIC(5,2) DEFAULT 30.0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INTERNAL STOCK (Stock Separado)
CREATE TABLE internal_stock (
    stock_id SERIAL PRIMARY KEY,
    internal_ean TEXT NOT NULL REFERENCES internal_products(internal_ean) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    location TEXT DEFAULT 'Armazém Principal',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(user_id),
    notes TEXT
);

-- 4. INTERNAL IMAGES (Imagens Físicas)
CREATE TABLE internal_images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_ean TEXT NOT NULL REFERENCES internal_products(internal_ean) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    original_filename TEXT,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES users(user_id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INTERNAL PRODUCT CATEGORIES (Reutiliza categories existente)
CREATE TABLE internal_product_categories (
    internal_ean TEXT NOT NULL REFERENCES internal_products(internal_ean) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES categories(categoryid) ON DELETE CASCADE,
    PRIMARY KEY (internal_ean, category_id)
);

-- 6. INTERNAL PRICING (Pricing Flexível)
CREATE TABLE internal_pricing (
    pricing_id SERIAL PRIMARY KEY,
    internal_ean TEXT NOT NULL REFERENCES internal_products(internal_ean) ON DELETE CASCADE,
    price_list_id INTEGER NOT NULL REFERENCES price_lists(price_list_id) ON DELETE CASCADE,
    selling_price NUMERIC(12,4) NOT NULL,
    cost_basis NUMERIC(12,4),
    margin_percentage NUMERIC(5,2),
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    effective_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(internal_ean, price_list_id, effective_from)
);

-- 7. CSV IMPORT LOGS (Auditoria)
CREATE TABLE csv_import_logs (
    import_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id TEXT REFERENCES supplier_registry(supplier_id),
    import_type TEXT NOT NULL CHECK (import_type IN ('products', 'stock', 'prices', 'images')),
    file_name TEXT NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    total_rows INTEGER,
    processed_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    error_rows INTEGER DEFAULT 0,
    error_details JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    imported_by UUID NOT NULL REFERENCES users(user_id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    processing_time_seconds INTEGER
);

-- 8. PLUGIN CONFIGS (Sistema Modular)
CREATE TABLE plugin_configs (
    plugin_id TEXT PRIMARY KEY,
    plugin_name TEXT NOT NULL,
    plugin_type TEXT NOT NULL CHECK (plugin_type IN ('product_provider', 'price_calculator', 'image_handler', 'import_processor')),
    is_enabled BOOLEAN DEFAULT true,
    config_data JSONB,
    load_order INTEGER DEFAULT 0,
    version TEXT DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS AUTOMÁTICOS (updated_at)
-- ============================================

-- Trigger para supplier_registry
CREATE TRIGGER trigger_supplier_registry_updated_at
    BEFORE UPDATE ON supplier_registry
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger para internal_products
CREATE TRIGGER trigger_internal_products_updated_at
    BEFORE UPDATE ON internal_products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger para plugin_configs
CREATE TRIGGER trigger_plugin_configs_updated_at
    BEFORE UPDATE ON plugin_configs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================
-- INDEXES PARA PERFORMANCE
-- ============================================

-- Indexes críticos
CREATE INDEX idx_internal_products_active ON internal_products(is_active) WHERE is_active = true;
CREATE INDEX idx_internal_products_brand ON internal_products(brand) WHERE brand IS NOT NULL;
CREATE INDEX idx_internal_stock_ean ON internal_stock(internal_ean);
CREATE INDEX idx_internal_images_ean ON internal_images(internal_ean);
CREATE INDEX idx_internal_images_primary ON internal_images(internal_ean, is_primary) WHERE is_primary = true;
CREATE INDEX idx_internal_pricing_active ON internal_pricing(internal_ean, price_list_id) WHERE is_active = true;
CREATE INDEX idx_csv_import_logs_status ON csv_import_logs(status, started_at);
CREATE INDEX idx_plugin_configs_enabled ON plugin_configs(plugin_type, is_enabled) WHERE is_enabled = true;

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Suppliers base
INSERT INTO supplier_registry (supplier_id, supplier_name, supplier_type, markup_percentage, import_config) VALUES 
('internal', 'Produtos Próprios', 'internal', 30.0, '{"csv_path": "/uploads/internal", "allowed_extensions": [".csv", ".xlsx"]}'),
('geko', 'Geko Poland', 'api', 25.0, '{"api_endpoint": "existing_geko_system", "sync_method": "xml_api"}');

-- Plugin configs base
INSERT INTO plugin_configs (plugin_id, plugin_name, plugin_type, config_data, load_order) VALUES 
('geko_provider', 'Geko Product Provider', 'product_provider', '{"uses_existing_system": true, "source_tables": ["products", "geko_products"]}', 1),
('internal_provider', 'Internal Product Provider', 'product_provider', '{"csv_based": true, "source_tables": ["internal_products"]}', 2),
('hybrid_pricing', 'Hybrid Pricing Calculator', 'price_calculator', '{"supports_multiple_sources": true, "default_markup": 30}', 1),
('csv_processor', 'CSV Import Processor', 'import_processor', '{"batch_size": 100, "validation_strict": true}', 1),
('image_handler', 'Local Image Handler', 'image_handler', '{"thumbnail_sizes": [150, 300, 600], "allowed_formats": ["jpg", "png", "webp"]}', 1);
```

---

## 🔍 **PONTOS DE VALIDAÇÃO**

### **✅ Checklist de Aprovação BD:**
- [ ] **Zero Alterações:** Nenhum `ALTER TABLE` em tabelas existentes
- [ ] **Foreign Keys:** Todas as referências são válidas
- [ ] **Constraints:** Check constraints para validação de dados
- [ ] **Indexes:** Performance otimizada para queries comuns
- [ ] **Triggers:** updated_at automático onde necessário
- [ ] **Naming:** Convenções consistentes (`internal_*`)

### **✅ Funcionalidades Cobertas:**
- [ ] **CSV Import:** Logs completos e auditoria
- [ ] **Imagens Físicas:** Upload e metadados
- [ ] **Pricing Flexível:** Por lista, temporal, margem
- [ ] **Stock Management:** Controlo separado
- [ ] **Plugin System:** Extensibilidade futura
- [ ] **Admin Integration:** Reutiliza `users` e `price_lists`

---

## 🚨 **APROVAÇÃO NECESSÁRIA**

**PERGUNTA CRÍTICA:** 
Posso **executar este SQL na base de dados** para criar as 8 novas tabelas?

- ✅ **São apenas adições** (zero alterações existentes)
- ✅ **Seguem as convenções** do projeto
- ✅ **Incluem auditoria completa** 
- ✅ **Performance otimizada**
- ✅ **Rollback simples** (DROP tables)

**Aguardo aprovação categórica antes de prosseguir!** 🔒

---

## 📱 **PRÓXIMAS FASES (Após Aprovação BD)**

### **Semana 2-4: Desenvolvimento**
1. **Admin Interfaces** - Pages para gestão
2. **CSV Import** - Sistema completo
3. **Image Upload** - API e interface
4. **Unified View** - SQL view + frontend integration

### **Timeline Detalhada:**
- **Hoje:** Aprovação BD + Execução SQL
- **Esta semana:** Admin base + CSV import
- **Próxima semana:** Images + unified view
- **Semana 3-4:** Testes + refinements

---

**Está aprovado para executar o SQL das novas tabelas?** 🚀 