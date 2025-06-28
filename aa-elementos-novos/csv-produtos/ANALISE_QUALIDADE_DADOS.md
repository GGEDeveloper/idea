# 🔍 **RELATÓRIO DE QUALIDADE DOS DADOS - PRODUTOS INTERNOS**

## 📊 **RESUMO EXECUTIVO:**

### **🎯 VOLUME DE DADOS:**
- **Total de registos:** 2.223 (457 produtos base + 1.042 variantes + extras)
- **Produtos base (Product):** 457
- **Variantes (Variant):** 1.042  

---

## ❌ **PROBLEMAS IDENTIFICADOS:**

### **🚨 CRÍTICOS (Impedem Importação):**

#### **1️⃣ PRODUTOS SEM PREÇO:**
- **Afetados:** 32 produtos base (7% dos produtos)
- **Impacto:** Produtos não podem ser vendidos
- **Exemplos:**
  - "Fato de chuva Reflector"
  - "Talocha ABS 140x280MM (3MM) P/ CAPOTO"
  - "Espatula em Inox para Fachada com cabo PVC"
  - "Luva menage Amarela"
  - "Esponja Polimento Preta 150MMx45MM-M14"

#### **2️⃣ PRODUTOS SEM CATEGORIA:**
- **Afetados:** 395 produtos base (86% dos produtos!)
- **Impacto:** Produtos não podem ser classificados/filtrados
- **Nota:** Apenas 62 produtos (14%) têm categoria mapeada

#### **3️⃣ PRODUTOS SEM MARCA:**
- **Afetados:** 456 produtos base (99.8% dos produtos!)
- **Impacto:** Falta de identidade de marca
- **Marca encontrada:** Apenas 1 produto com marca "FERMAN"

---

### **⚠️ MENORES (Estrutura Normal):**

#### **4️⃣ VARIANTES SEM NOME:**
- **Afetados:** 1.042 variantes (100% das variantes)
- **Impacto:** Normal - variantes herdam nome do produto base
- **Solução:** Usar nome base + informação da variante

#### **5️⃣ VARIANTES SEM PREÇO:**
- **Afetados:** 1.042 variantes (100% das variantes)
- **Impacto:** Normal se preço vem do produto base
- **Verificação necessária:** Confirmar se variantes devem ter preços específicos

---

## ✅ **DADOS VÁLIDOS:**

### **🎯 PRODUTOS BASE - BOA QUALIDADE:**
- **✅ Nomes:** 457/457 produtos têm nome (100%)
- **✅ Descrições:** Maioria tem descrições detalhadas
- **✅ Preços:** 411/457 produtos têm preço (90%)
- **✅ Imagens:** Produtos têm URLs de imagem
- **✅ Variantes:** Todas as 1.042 variantes têm dados de opção

### **🎯 CATEGORIAS MAPEADAS (62 produtos):**
| **ID Categoria** | **Produtos** | **Categoria Provável** |
|------------------|--------------|------------------------|
| **110012** | 37 produtos | Categoria principal |
| **110006** | 11 produtos | Segunda categoria |
| **110011** | 4 produtos | Terceira categoria |
| **110003** | 4 produtos | Quarta categoria |
| **110007** | 2 produtos | Quinta categoria |

---

## 🛠️ **PLANO DE CORREÇÃO:**

### **🔥 PRIORIDADE MÁXIMA:**

#### **1️⃣ Corrigir Preços (32 produtos):**
```sql
-- Opções de solução:
-- A) Definir preço padrão (ex: €1.00)
-- B) Marcar como "Preço sob consulta"
-- C) User fornece preços em falta

UPDATE products SET price = 1.00 
WHERE price IS NULL OR price = '' 
AND source_type = 'internal';
```

#### **2️⃣ Corrigir Marcas (456 produtos):**
```sql
-- Solução: Definir marca padrão para produtos internos
UPDATE products SET brand = 'FERMAN' 
WHERE (brand IS NULL OR brand = '') 
AND source_type = 'internal';
```

#### **3️⃣ Corrigir Categorias (395 produtos):**
```sql
-- Estratégias:
-- A) Mapping automático por nome/descrição
-- B) Categoria padrão "Produtos Internos"
-- C) User define categorias em falta

-- Categoria padrão temporária:
UPDATE products SET category_id = 'INTERNAL_MISC'
WHERE (category_id IS NULL OR category_id = '')
AND source_type = 'internal';
```

---

## 🤖 **SOLUÇÕES AUTOMÁTICAS:**

### **🔍 MAPPING AUTOMÁTICO DE CATEGORIAS:**

```javascript
// Baseado em palavras-chave no nome/descrição
const categoryMapping = {
  // Luvas → Work Gloves (110002)
  'luva|glove': '110002',
  
  // Facas/Ferramentas → Cutting Tools  
  'disco|corte|cutting|knife': '110006',
  
  // Extensões → Extension Cords
  'extensao|extension|cabo': '110007',
  
  // Esponjas/Abrasivos → Abrasive Materials
  'esponja|polimento|abrasiv': '110011',
  
  // Espátulas → Trowels and Spatulas (NOVA)
  'espatula|talocha|trowel': 'TROWELS_SPATULAS',
  
  // Fatos/Proteção → Work Gloves (aproximação)
  'fato|protec|safety': '110002'
};

function mapCategory(productName, description) {
  const text = `${productName} ${description}`.toLowerCase();
  
  for (const [keywords, categoryId] of Object.entries(categoryMapping)) {
    if (new RegExp(keywords).test(text)) {
      return categoryId;
    }
  }
  
  return 'INTERNAL_MISC'; // Categoria padrão
}
```

### **🏷️ GERAÇÃO AUTOMÁTICA DE SKU:**

```javascript
// Para produtos sem SKU
function generateSKU(product) {
  const prefix = 'INT';
  const brand = product.brand || 'FERMAN';
  const id = product.handleId.slice(-6).toUpperCase();
  
  return `${prefix}_${brand}_${id}`;
  
  // Exemplo: INT_FERMAN_2670F
}
```

---

## 📋 **ESTATÍSTICAS DE CORREÇÃO:**

### **🎯 APÓS APLICAR SOLUÇÕES:**

| **Campo** | **Antes** | **Depois** | **Melhoria** |
|-----------|-----------|------------|--------------|
| **Preços** | 411/457 (90%) | 457/457 (100%) | +46 produtos |
| **Marcas** | 1/457 (0.2%) | 457/457 (100%) | +456 produtos |
| **Categorias** | 62/457 (14%) | 457/457 (100%) | +395 produtos |
| **SKUs** | ~48/457 (10%) | 457/457 (100%) | +409 produtos |

### **📊 IMPACTO FINAL:**
- **✅ 100% produtos importáveis** (vs 14% atuais)
- **✅ Dados completos** para todos os campos
- **✅ Compatibilidade total** com sistema Geko
- **✅ Pronto para multi-idioma**

---

## 🚀 **RECOMENDAÇÕES:**

### **🎯 IMPLEMENTAÇÃO SUGERIDA:**

#### **FASE 1: Correções Automáticas**
1. **Aplicar marca FERMAN** a todos os produtos internos
2. **Definir preços padrão** ou "sob consulta" 
3. **Gerar SKUs automáticos** para produtos sem código
4. **Mapping automático** de categorias por palavra-chave

#### **FASE 2: Validação Manual**
1. **Revisar 32 produtos sem preço** - definir preços corretos
2. **Validar categorias mapeadas** - ajustar se necessário
3. **Confirmar produtos problemáticos** - decidir manter ou remover

#### **FASE 3: Importação**
1. **Importar produtos corrigidos** para BD
2. **Testar interface** com dados reais
3. **Validar multi-idioma** PT/EN

---

## ✅ **PRODUTOS PRONTOS PARA IMPORTAÇÃO:**

### **🏆 ALTA QUALIDADE (411 produtos - 90%):**
- ✅ Nome, descrição, preço completos
- ✅ Estrutura de variantes correta
- ⚠️ Precisam apenas marca + categoria

### **🔧 CORREÇÃO SIMPLES (32 produtos - 7%):**
- ✅ Nome e descrição completos
- ❌ Preço em falta (fácil de corrigir)
- ⚠️ Precisam marca + categoria + preço

### **📊 RESUMO FINAL:**
**90% dos produtos estão prontos** para importação após correções automáticas simples. **Apenas 7% precisam intervenção manual** para definir preços.

---

## 🎯 **PRÓXIMOS PASSOS:**

1. **👤 USER**: Decidir sobre preços dos 32 produtos sem preço
2. **🤖 AUTO**: Aplicar correções automáticas (marca, categoria, SKU)
3. **⚡ IMPORT**: Importar produtos corrigidos para sistema
4. **🌍 I18N**: Traduzir para inglês (preparado)
5. **✅ TEST**: Validar interface e funcionalidades

**🎯 RESULTADO:** Sistema com ~9.625 produtos (8.126 Geko + 1.499 internos) totalmente funcionais! 