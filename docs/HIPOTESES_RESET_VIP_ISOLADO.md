# 🎯 **HIPÓTESES: RESET APENAS ÁREA VIP ISOLADA**

> **Clarificação:** APENAS tabelas `internal_*` - ZERO impacto no sistema Geko  
> **Data:** 19 Janeiro 2025  
> **Objectivo:** Resolver problemas variantes/preços de uma vez

---

## 🛡️ **CONFIRMAÇÃO: ISOLAMENTO PERFEITO**

### **✅ ÁREA VIP (RESET):**
```sql
-- APENAS ESTAS 7 TABELAS (isoladas)
internal_products           -- 410 registos
internal_variants           -- 940 registos  
internal_product_categories -- 410 registos
internal_pricing            -- 3,628 registos
internal_product_images     -- 10 registos
internal_product_attributes -- 1,281 registos
internal_stock              -- 940 registos
```

### **🛡️ SISTEMA GEKO (INTOCADO):**
```sql
-- ZERO MODIFICAÇÕES - ISOLAMENTO GARANTIDO
products (8,126)           ✅ PRESERVADO
product_variants (8,126)   ✅ PRESERVADO  
product_categories (8,122) ✅ PRESERVADO
prices (24,368)            ✅ PRESERVADO
product_images (31,511)    ✅ PRESERVADO
geko_products (8,122)      ✅ PRESERVADO
[+ TODAS as outras tabelas] ✅ PRESERVADO
```

### **🔗 DEPENDÊNCIAS PARTILHADAS (PRESERVAR):**
```sql
categories (416)     ✅ PARTILHADO - Manter
price_lists (4)      ✅ PARTILHADO - Manter  
users                ✅ PARTILHADO - Manter
supplier_registry    ⚠️ ANALISAR - pode ter dados partilhados
```

---

## 🎯 **HIPÓTESES DE IMPLEMENTAÇÃO**

### **💡 HIPÓTESE A: RESET LIMPO + IMPORTAÇÃO CORRIGIDA**

#### **🔄 Processo:**
1. **Backup** dados VIP actuais (segurança)
2. **Limpar** apenas tabelas `internal_*`
3. **Re-importar** do CSV limpo com correções
4. **Validar** integridade total

#### **✅ Vantagens:**
- **Resolve TODOS os problemas** de uma vez
- **Processo limpo** sem dependências quebradas
- **Dados frescos** do CSV corrigido
- **Zero impacto** no sistema Geko
- **Relações produto-variante** correctas desde início

#### **⚠️ Riscos:**
- **BAIXO:** Dados VIP perdidos temporariamente
- **BAIXO:** Processo pode falhar (temos backup)
- **MÍNIMO:** 15-30 min sem produtos VIP visíveis

#### **⏱️ Tempo estimado:** 45-60 minutos

---

### **💡 HIPÓTESE B: RESET PARCIAL + CORREÇÃO MANUAL**

#### **🔄 Processo:**
1. **Manter** `internal_products` (410 produtos OK)
2. **Limpar** apenas `internal_variants` + dependentes
3. **Re-importar** só variantes do CSV
4. **Corrigir** relações manualmente

#### **✅ Vantagens:**
- **Produtos base** preservados
- **Categorização** mantida (100% completa)
- **Preços base** mantidos (396/410)
- **Menos disruptivo**

#### **⚠️ Riscos:**
- **MÉDIO:** Problemas podem persistir
- **MÉDIO:** Relações produto-variante complexas
- **ALTO:** Pode precisar de Hipótese A depois

#### **⏱️ Tempo estimado:** 30-45 minutos

---

### **💡 HIPÓTESE C: CORREÇÃO CIRÚRGICA (ACTUAL)**

#### **🔄 Processo:**
1. **Identificar** exactamente as 31 variantes em falta
2. **Corrigir** relações produto-variante uma a uma
3. **Remover** 14 produtos sem preço
4. **Validar** integridade

#### **✅ Vantagens:**
- **Mínimo impacto** nos dados existentes
- **Preserva trabalho** já feito
- **Approach conservador**

#### **⚠️ Riscos:**
- **ALTO:** Problemas complexos podem persistir
- **ALTO:** Múltiplas intervenções necessárias  
- **MÉDIO:** Tempo > outras opções
- **ALTO:** Pode não resolver tudo

#### **⏱️ Tempo estimado:** 2-3 horas

---

## 📊 **COMPARAÇÃO DETALHADA**

| **Critério** | **Hipótese A** | **Hipótese B** | **Hipótese C** |
|--------------|----------------|----------------|----------------|
| **Resolve problemas** | ✅ **100%** | ⚠️ **~80%** | ⚠️ **~60%** |
| **Risco técnico** | 🟢 **Baixo** | 🟡 **Médio** | 🔴 **Alto** |
| **Tempo execução** | 🟡 **45-60min** | 🟢 **30-45min** | 🔴 **2-3h** |
| **Impacto Geko** | ✅ **Zero** | ✅ **Zero** | ✅ **Zero** |
| **Dados perdidos** | ⚠️ **Temp (c/ backup)** | 🟢 **Mínimos** | 🟢 **Zero** |
| **Garantia sucesso** | ✅ **Alta** | ⚠️ **Média** | ❌ **Baixa** |

---

## 🎯 **RECOMENDAÇÃO: HIPÓTESE A**

### **💪 Justificação:**
1. **✅ Resolve 100%** dos problemas identificados
2. **✅ Processo limpo** sem "remendos"
3. **✅ Dados frescos** do CSV corrigido
4. **✅ Base sólida** para funcionalidades futuras
5. **✅ Risco controlado** com backup total

### **📋 Plano de Implementação Hipótese A:**

#### **FASE 1: PREPARAÇÃO (5 min)**
```sql
-- 1. Backup completo da área VIP
CREATE TABLE backup_internal_products AS SELECT * FROM internal_products;
CREATE TABLE backup_internal_variants AS SELECT * FROM internal_variants;
-- [+ todas as outras tabelas internal_*]
```

#### **FASE 2: LIMPEZA (5 min)**
```sql
-- 2. Limpar apenas área VIP (ordem por foreign keys)
DELETE FROM internal_stock;
DELETE FROM internal_product_attributes;
DELETE FROM internal_product_images;
DELETE FROM internal_pricing;
DELETE FROM internal_product_categories;
DELETE FROM internal_variants;
DELETE FROM internal_products;
```

#### **FASE 3: IMPORTAÇÃO CORRIGIDA (30 min)**
```python
# 3. Re-importar com correções
# - Filtrar 14 produtos sem preço
# - Importar 396 produtos válidos
# - Importar 971 variantes corretamente
# - Criar relações produto-variante correctas
# - Aplicar categorização (100%)
# - Gerar preços hierárquicos
```

#### **FASE 4: VALIDAÇÃO (10 min)**
```sql
-- 4. Verificar integridade
-- ✅ 396 produtos com preço
-- ✅ ~940 variantes relacionadas
-- ✅ Relações produto-variante OK
-- ✅ View unificada funcional
-- ✅ Zero contaminação Geko
```

---

## ⚠️ **SALVAGUARDAS E ROLLBACK**

### **🛡️ Plano de Segurança:**
1. **Backup completo** antes de começar
2. **Snapshot BD** antes da operação
3. **Scripts rollback** preparados
4. **Validação** a cada passo
5. **Processo interrompível** em qualquer momento

### **🔙 Rollback (se necessário):**
```sql
-- Restaurar de backup em 2 minutos
DROP TABLE internal_products;
CREATE TABLE internal_products AS SELECT * FROM backup_internal_products;
-- [repetir para todas as tabelas]
```

---

## 💬 **DECISÃO NECESSÁRIA**

**🎯 Qual hipótese preferes?**

- **🏆 Hipótese A:** Reset limpo + importação corrigida (RECOMENDADA)
- **⚖️ Hipótese B:** Reset parcial + correção manual  
- **🔧 Hipótese C:** Correção cirúrgica (actual approach)

**💡 Ou preferes uma variação/combinação?**

---

**📋 Próximo passo:** Aguardar tua decisão para preparar scripts específicos da hipótese escolhida.

**🛡️ Garantia:** ZERO impacto no sistema Geko em qualquer hipótese! 