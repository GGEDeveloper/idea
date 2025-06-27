# 🔥 **PROPOSTAS 100% ADITIVAS - ZERO ALTERAÇÕES NO EXISTENTE**

**Data:** 27 de Janeiro de 2025  
**Princípio:** NUNCA tocar no sistema atual - apenas ADICIONAR módulos e tabelas  
**Objetivo:** Integrar produtos próprios mantendo sistema Geko 100% intacto

---

## 🎯 **FILOSOFIA: SIDE-BY-SIDE ARCHITECTURE**

```
Sistema Atual (INTOCÁVEL)          +          Sistema Novo (ADITIVO)
┌─────────────────────────┐                  ┌─────────────────────────┐
│ products (geko)         │                  │ internal_products       │
│ geko_products           │                  │ internal_stock          │
│ product_variants        │                  │ internal_images         │
│ product_images (urls)   │                  │ internal_pricing        │
│ prices                  │                  │ csv_import_logs         │
│ categories              │        +         │ supplier_registry       │
│ API Geko workflows      │                  │ unified_catalog_view    │
│ Admin pages             │                  │ plugin_configs          │
└─────────────────────────┘                  └─────────────────────────┘
            ↓                                              ↓
    Continua igual                              Novo sistema paralelo
            ↓                                              ↓
            └──────────── UNIFIED FRONTEND ─────────────┘
```

---

## 🔥 **PROPOSTA 1: PARALLEL TABLES APPROACH**
**(100% Aditivo - Risco ZERO)**

### **🎯 Estratégia: Tabelas Paralelas + Plugin Layer**

#### **APENAS NOVAS TABELAS (Zero alterações existentes):**
```sql
-- 1. Registry de fornecedores NOVO
CREATE TABLE supplier_registry (
    supplier_id TEXT PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    supplier_type TEXT NOT NULL, -- 'internal', 'external_csv', 'api'
    is_active BOOLEAN DEFAULT true,
    markup_percentage NUMERIC(5,2) DEFAULT 30.0,
    import_config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir registos base
INSERT INTO supplier_registry VALUES 
('internal', 'Produtos Próprios', 'internal', true, 30.0, '{"csv_path": "/uploads/internal"}'),
('geko', 'Geko Poland', 'api', true, 25.0, '{"api_endpoint": "existing_geko_system"}');

-- 2. Produtos internos PARALELOS (não confundem com 'products')
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

-- 3. Stock interno SEPARADO
CREATE TABLE internal_stock (
    stock_id SERIAL PRIMARY KEY,
    internal_ean TEXT REFERENCES internal_products(internal_ean),
    quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    location TEXT DEFAULT 'Armazém Principal',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(user_id)
);

-- 4. Imagens internas FÍSICAS
CREATE TABLE internal_images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_ean TEXT REFERENCES internal_products(internal_ean),
    file_path TEXT NOT NULL, -- '/uploads/internal/images/123456.jpg'
    original_filename TEXT,
    file_size INTEGER,
    mime_type TEXT,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES users(user_id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Categorias internas (reutiliza 'categories' existente via foreign key)
CREATE TABLE internal_product_categories (
    internal_ean TEXT REFERENCES internal_products(internal_ean),
    category_id TEXT REFERENCES categories(categoryid),
    PRIMARY KEY (internal_ean, category_id)
);

-- 6. Pricing interno FLEXÍVEL
CREATE TABLE internal_pricing (
    pricing_id SERIAL PRIMARY KEY,
    internal_ean TEXT REFERENCES internal_products(internal_ean),
    price_list_id INTEGER REFERENCES price_lists(price_list_id),
    selling_price NUMERIC(12,4) NOT NULL,
    cost_basis NUMERIC(12,4),
    margin_percentage NUMERIC(5,2),
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    effective_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CSV Import Logs
CREATE TABLE csv_import_logs (
    import_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id TEXT REFERENCES supplier_registry(supplier_id),
    import_type TEXT NOT NULL, -- 'products', 'stock', 'prices'
    file_name TEXT NOT NULL,
    file_path TEXT,
    total_rows INTEGER,
    processed_rows INTEGER,
    success_rows INTEGER,
    error_rows INTEGER,
    error_details JSONB,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    imported_by UUID REFERENCES users(user_id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 8. Plugin Configuration MODULAR
CREATE TABLE plugin_configs (
    plugin_id TEXT PRIMARY KEY,
    plugin_name TEXT NOT NULL,
    plugin_type TEXT NOT NULL, -- 'product_provider', 'price_calculator', 'image_handler'
    is_enabled BOOLEAN DEFAULT true,
    config_data JSONB,
    load_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plugins base
INSERT INTO plugin_configs VALUES 
('geko_provider', 'Geko Product Provider', 'product_provider', true, '{"uses_existing_system": true}', 1),
('internal_provider', 'Internal Product Provider', 'product_provider', true, '{"csv_based": true}', 2),
('hybrid_pricing', 'Hybrid Pricing Calculator', 'price_calculator', true, '{"supports_multiple_sources": true}', 1);
```

#### **VIEW UNIFICADA (Junta tudo sem alterar nada):**
```sql
-- View que UNE produtos Geko (existentes) + produtos internos (novos)
CREATE VIEW unified_product_catalog AS
-- Produtos Geko EXISTENTES (zero alterações)
SELECT 
    'geko' as source_type,
    p.ean,
    p.name,
    p.brand,
    p.shortdescription,
    p.longdescription,
    p.active as is_active,
    p.is_featured,
    
    -- Preços do sistema EXISTENTE
    (SELECT pr.price FROM prices pr 
     JOIN product_variants pv ON pr.variantid = pv.variantid 
     WHERE pv.ean = p.ean AND pr.price_list_id = 2 LIMIT 1) as selling_price,
    
    -- Stock do sistema EXISTENTE
    (SELECT pv.stockquantity FROM product_variants pv WHERE pv.ean = p.ean LIMIT 1) as stock_quantity,
    
    -- Imagens do sistema EXISTENTE
    (SELECT json_agg(json_build_object('url', pi.url, 'is_primary', pi.is_primary, 'alt', pi.alt))
     FROM product_images pi WHERE pi.ean = p.ean) as images,
    
    -- Categorias do sistema EXISTENTE
    (SELECT json_agg(c.name) FROM product_categories pc 
     JOIN categories c ON pc.category_id = c.categoryid 
     WHERE pc.product_ean = p.ean) as categories,
    
    p.created_at,
    p.updated_at

FROM products p 
WHERE p.active = true

UNION ALL

-- Produtos INTERNOS NOVOS
SELECT 
    'internal' as source_type,
    ip.internal_ean as ean,
    ip.name,
    ip.brand,
    ip.short_description as shortdescription,
    ip.long_description as longdescription,
    ip.is_active,
    ip.is_featured,
    
    -- Preços do sistema NOVO
    (SELECT ipr.selling_price FROM internal_pricing ipr 
     WHERE ipr.internal_ean = ip.internal_ean AND ipr.price_list_id = 2 
     AND ipr.is_active = true ORDER BY ipr.created_at DESC LIMIT 1) as selling_price,
    
    -- Stock do sistema NOVO
    (SELECT ist.quantity FROM internal_stock ist WHERE ist.internal_ean = ip.internal_ean LIMIT 1) as stock_quantity,
    
    -- Imagens do sistema NOVO (ficheiros físicos)
    (SELECT json_agg(json_build_object(
        'url', '/api/internal/images/' || ii.file_path, 
        'is_primary', ii.is_primary, 
        'alt', ii.alt_text
    )) FROM internal_images ii WHERE ii.internal_ean = ip.internal_ean) as images,
    
    -- Categorias REUTILIZADAS
    (SELECT json_agg(c.name) FROM internal_product_categories ipc 
     JOIN categories c ON ipc.category_id = c.categoryid 
     WHERE ipc.internal_ean = ip.internal_ean) as categories,
    
    ip.created_at,
    ip.updated_at

FROM internal_products ip 
WHERE ip.is_active = true

ORDER BY source_type, name;
```

### **🔌 PLUGIN SYSTEM (Modular e Aditivo):**
```typescript
// Plugin registry NOVO (não altera nada existente)
interface ProductProvider {
    getProducts(filters: any): Promise<Product[]>;
    getProduct(ean: string): Promise<Product>;
    updateStock(ean: string, quantity: number): Promise<void>;
}

// Plugin para sistema EXISTENTE (wrapper apenas)
class GekoProductProvider implements ProductProvider {
    async getProducts(filters: any) {
        // Usa queries EXISTENTES do sistema Geko
        // ZERO alterações no código atual
        return await existing_geko_queries.getProducts(filters);
    }
}

// Plugin para sistema NOVO
class InternalProductProvider implements ProductProvider {
    async getProducts(filters: any) {
        // Usa NOVAS tabelas internal_products
        return await new_internal_queries.getProducts(filters);
    }
}

// Aggregator que junta tudo
class UnifiedProductService {
    providers = new Map<string, ProductProvider>();
    
    constructor() {
        this.providers.set('geko', new GekoProductProvider());
        this.providers.set('internal', new InternalProductProvider());
    }
    
    async getAllProducts(filters: any) {
        const results = [];
        for (const [type, provider] of this.providers) {
            const products = await provider.getProducts(filters);
            results.push(...products.map(p => ({...p, source: type})));
        }
        return results;
    }
}
```

### **✅ Vantagens Proposta 1:**
- **ZERO RISCO** - sistema atual completamente intocado
- **Coexistência Perfeita** - ambos os sistemas funcionam simultaneamente
- **Rollback Trivial** - apagar novas tabelas restaura estado original
- **Extensibilidade** - novos fornecedores = novas tabelas paralelas
- **Testing Isolado** - testar sistema novo sem afetar produção

---

## 🔥 **PROPOSTA 2: NAMESPACE SEPARATION**
**(100% Aditivo - Isolamento por Schema)**

### **🎯 Estratégia: Schemas Separados + Bridge APIs**

```sql
-- Criar schema SEPARADO (não toca em 'public')
CREATE SCHEMA internal_products;
CREATE SCHEMA csv_imports;
CREATE SCHEMA plugins;

-- Todas as tabelas NOVAS vão para schemas específicos
CREATE TABLE internal_products.products (
    -- Estrutura igual mas em namespace separado
);

CREATE TABLE csv_imports.import_sessions (
    -- Logs e controlo de importações
);

CREATE TABLE plugins.provider_registry (
    -- Registry de plugins/providers
);

-- Bridge functions que conectam schemas
CREATE OR REPLACE FUNCTION public.get_unified_products()
RETURNS TABLE(...) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.products  -- Sistema EXISTENTE
    UNION ALL
    SELECT * FROM internal_products.products; -- Sistema NOVO
END;
$$ LANGUAGE plpgsql;
```

### **✅ Vantagens Proposta 2:**
- **Isolamento Total** - schemas completamente separados
- **Zero Conflitos** - nomes de tabelas podem ser iguais
- **Permissões Granulares** - acesso controlado por schema
- **Backup Separado** - pode fazer backup só do schema novo

---

## 🔥 **PROPOSTA 3: MICROSERVICE SIDECAR**
**(100% Aditivo - Serviço Paralelo)**

### **🎯 Estratégia: API Gateway + Service Paralelo**

```
Sistema EXISTENTE (Intocável)     Sistema NOVO (Paralelo)
┌─────────────────────────┐      ┌─────────────────────────┐
│ Next.js App             │      │ Internal Products API   │
│ PostgreSQL (atual)      │      │ PostgreSQL (novas tabs) │
│ Geko workflows          │      │ CSV Import Service      │
│ Admin pages             │      │ Image Upload Service    │
└─────────────────────────┘      └─────────────────────────┘
            │                                    │
            └─────── API GATEWAY ──────────────┘
                    (Roteamento)
```

#### **API Gateway Routes:**
```typescript
// routes/api/unified/[...path].ts
export default async function handler(req, res) {
    const { path } = req.query;
    
    if (path[0] === 'geko' || path[0] === 'products') {
        // Redireciona para sistema EXISTENTE
        return await existingGekoHandler(req, res);
    }
    
    if (path[0] === 'internal' || path[0] === 'csv') {
        // Redireciona para sistema NOVO
        return await newInternalHandler(req, res);
    }
    
    if (path[0] === 'unified') {
        // Agrega dados de ambos os sistemas
        return await unifiedHandler(req, res);
    }
}
```

### **✅ Vantagens Proposta 3:**
- **Independence** - sistemas completamente independentes
- **Scalability** - pode escalar serviços separadamente
- **Technology Freedom** - sistema novo pode usar tecnologias diferentes
- **Zero Impact** - falha num sistema não afeta o outro

---

## 🔥 **PROPOSTA 4: PLUGIN ARCHITECTURE PURA**
**(100% Aditivo - Sistema de Plugins)**

### **🎯 Estratégia: Core Unchanged + Plugin Layer**

```typescript
// Plugin registry CENTRALIZADO
class ProductPluginRegistry {
    private plugins = new Map<string, ProductPlugin>();
    
    register(id: string, plugin: ProductPlugin) {
        this.plugins.set(id, plugin);
    }
    
    async aggregateProducts(filters: any) {
        const results = [];
        for (const [id, plugin] of this.plugins) {
            if (plugin.isEnabled()) {
                const products = await plugin.getProducts(filters);
                results.push(...products.map(p => ({...p, source: id})));
            }
        }
        return results;
    }
}

// Plugin para sistema EXISTENTE (read-only wrapper)
class ExistingGekoPlugin implements ProductPlugin {
    async getProducts(filters: any) {
        // Wraps existing Geko system without changes
        return await fetch('/api/products/geko', {
            method: 'POST',
            body: JSON.stringify(filters)
        }).then(r => r.json());
    }
}

// Plugin para sistema NOVO
class InternalProductsPlugin implements ProductPlugin {
    async getProducts(filters: any) {
        // Uses new internal_products tables
        return await internalProductsService.getProducts(filters);
    }
}

// Auto-registration
PluginRegistry.register('geko', new ExistingGekoPlugin());
PluginRegistry.register('internal', new InternalProductsPlugin());
```

#### **Estrutura de Ficheiros Aditiva:**
```
projeto/
├── existing_system/          # Sistema atual INTOCÁVEL
│   ├── pages/
│   ├── api/
│   └── components/
├── plugins/                  # Sistema NOVO
│   ├── internal-products/
│   │   ├── api/
│   │   ├── components/
│   │   └── services/
│   ├── csv-import/
│   └── unified-catalog/
└── unified/                  # Interface unificada
    ├── pages/
    └── components/
```

### **✅ Vantagens Proposta 4:**
- **Pure Addition** - apenas adicionar ficheiros, zero alterações
- **Plugin Ecosystem** - facilita adição de novos fornecedores
- **Modular Development** - cada plugin desenvolvido independentemente
- **Easy Disable** - pode desativar plugins sem afetar sistema

---

## 🏆 **RECOMENDAÇÃO ADITIVA FINAL**

### **🥇 PROPOSTA 1 - PARALLEL TABLES** 
**(Mais simples e eficaz)**

**Por que é a melhor:**
- ✅ **Simplicidade** - apenas novas tabelas na mesma BD
- ✅ **Performance** - views SQL nativas muito rápidas
- ✅ **Debugging** - tudo visível na mesma interface de BD
- ✅ **Admin Integration** - pode reutilizar components admin existentes
- ✅ **Zero Learning Curve** - usa padrões que a equipa já conhece

### **🚀 IMPLEMENTAÇÃO RECOMENDADA:**

#### **Fase 1 (1 semana) - Setup Base:**
```sql
-- Apenas CRIAR novas tabelas (zero alterações)
CREATE TABLE supplier_registry (...);
CREATE TABLE internal_products (...);
CREATE TABLE internal_stock (...);
CREATE TABLE internal_images (...);
```

#### **Fase 2 (1 semana) - Interface CSV Import:**
```typescript
// Nova página: /admin/internal-products/import
// Funcionalidades:
// - Upload CSV com preview
// - Validação de dados
// - Import em background
// - Logs detalhados
```

#### **Fase 3 (1 semana) - Sistema Imagens:**
```typescript
// Novo endpoint: /api/internal/images/upload
// Funcionalidades:
// - Upload múltiplas imagens
// - Resize automático
// - Gestão de ficheiros físicos
```

#### **Fase 4 (1 semana) - View Unificada:**
```sql
-- CREATE VIEW unified_product_catalog AS ...
-- Interface frontend usa esta view transparentemente
```

### **📋 ESTRUTURA FINAL:**
```
Sistema Geko (INTOCÁVEL)        Sistema Interno (NOVO)
├── products                    ├── internal_products
├── geko_products              ├── internal_stock  
├── product_variants           ├── internal_images
├── product_images             ├── internal_pricing
├── prices                     ├── csv_import_logs
└── [todo o resto igual]       └── supplier_registry
                                      ↓
                              unified_product_catalog
                                (VIEW que junta tudo)
```

---

**Esta abordagem é 100% aditiva, zero risco, e mantém tudo funcionando exatamente como está!** 🚀 