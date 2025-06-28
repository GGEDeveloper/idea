# 🏆 **PLANO EXECUÇÃO HIPÓTESE A: ULTRA-SEGURO**

> **Data:** 19 Janeiro 2025  
> **Objectivo:** Reset completo área VIP + Importação corrigida  
> **Garantia:** ZERO impacto sistema Geko  
> **Tempo Total:** 45-60 minutos  

---

## 🎯 **OVERVIEW DA OPERAÇÃO**

### **✅ O QUE VAI SER FEITO:**
- **Reset completo** das 7 tabelas `internal_*` 
- **Backup completo** antes de qualquer operação
- **Importação corrigida** do CSV limpo
- **Validação completa** de integridade

### **🛡️ O QUE NUNCA SERÁ TOCADO:**
- **Sistema Geko:** 8,126 produtos preservados
- **Tabelas partilhadas:** categories, price_lists, users
- **View unificada:** Mantém funcionalidade
- **Frontend:** Zero modificações necessárias

---

## 📋 **SCRIPTS PREPARADOS (ULTRA-SEGUROS)**

### **1. 🔄 RESET PRINCIPAL**
```bash
scripts/RESET_VIP_HIPOTESE_A_SEGURO.py
```
**Funções:**
- ✅ Verificação isolamento Geko
- ✅ Backup completo automático  
- ✅ Reset com confirmações múltiplas
- ✅ Validação passo-a-passo
- ✅ Rollback automático em caso de erro

### **2. 🚨 ROLLBACK DE EMERGÊNCIA**
```bash
scripts/ROLLBACK_VIP_EMERGENCIA.py  
```
**Funções:**
- ✅ Rollback completo em 2 minutos
- ✅ Restaura estado anterior exato
- ✅ Verificações de integridade
- ✅ Usa backup criado automaticamente

---

## ⏱️ **CRONOGRAMA DETALHADO**

### **ETAPA 1: PREPARAÇÃO (5 min)**
```
🔍 Verificação isolamento Geko
💾 Backup completo tabelas VIP:
   ├── internal_products (410 registos)
   ├── internal_variants (940 registos)  
   ├── internal_product_categories (410 registos)
   ├── internal_pricing (3,628 registos)
   ├── internal_product_images (10 registos)
   ├── internal_product_attributes (1,281 registos)
   └── internal_stock (940 registos)
```

### **ETAPA 2: RESET SEGURO (5 min)**
```
🧹 Limpeza ordenada (respeitando foreign keys):
   ├── internal_stock
   ├── internal_product_attributes
   ├── internal_product_images
   ├── internal_pricing
   ├── internal_product_categories
   ├── internal_variants
   └── internal_products
🔍 Verificação: Todas as tabelas vazias
```

### **ETAPA 3: IMPORTAÇÃO CORRIGIDA (30 min)**
```
📥 Re-importação do CSV limpo:
   ├── Filtrar 14 produtos sem preço  
   ├── Importar 396 produtos válidos
   ├── Importar ~940 variantes correctas
   ├── Criar relações produto-variante
   ├── Aplicar categorização (100%)
   └── Gerar sistema preços hierárquico
```

### **ETAPA 4: VALIDAÇÃO FINAL (10 min)**
```
✅ Verificação integridade:
   ├── 396 produtos com preço válido
   ├── ~940 variantes relacionadas
   ├── Relações produto-variante OK
   ├── View unificada funcional
   ├── Sistema Geko intocado
   └── Zero contaminação cruzada
```

---

## 🛡️ **SALVAGUARDAS IMPLEMENTADAS**

### **🔒 Verificações Pre-Execução:**
- ✅ **Isolamento Geko** confirmado
- ✅ **Contagens esperadas** validadas  
- ✅ **Conectividade BD** testada
- ✅ **Espaço disco** verificado
- ✅ **Backup funcional** confirmado

### **🔄 Durante Execução:**
- ✅ **Transações manuais** (rollback instantâneo)
- ✅ **Verificação passo-a-passo** 
- ✅ **Logs detalhados** de cada operação
- ✅ **Interrupção segura** a qualquer momento

### **🚨 Planos de Emergência:**
- ✅ **Rollback automático** se erro detectado
- ✅ **Rollback manual** via script dedicado
- ✅ **Backup persistente** para restauro posterior
- ✅ **Estado preservado** em caso de falha

---

## 📊 **ESTADO ESPERADO PÓS-EXECUÇÃO**

### **✅ SISTEMA VIP CORRIGIDO:**
```sql
internal_products: 396 produtos (sem os 14 problemáticos)
internal_variants: ~940 variantes (correctamente relacionadas)  
internal_product_categories: 396 categorizações
internal_pricing: ~1,500 preços (hierarchical pricing)
internal_product_images: 10 placeholders
internal_product_attributes: ~1,200 atributos
internal_stock: ~940 stocks iniciais
```

### **✅ PROBLEMAS RESOLVIDOS:**
- ❌ **14 produtos sem preço** → ✅ Removidos da importação activa
- ❌ **235 produtos sem variantes** → ✅ Relações correctas criadas
- ❌ **31 variantes em falta** → ✅ Importadas do CSV
- ❌ **Sistema preços** → ✅ Hierarquia produto→variante funcional

### **🛡️ SISTEMA GEKO PRESERVADO:**
```sql
products: 8,126 (INALTERADO)
product_variants: 8,126 (INALTERADO)  
product_categories: 8,122 (INALTERADO)
prices: 24,368 (INALTERADO)
product_images: 31,511 (INALTERADO)
geko_products: 8,122 (INALTERADO)
[+ TODAS as outras tabelas] (INALTERADO)
```

---

## 🎮 **COMANDOS DE EXECUÇÃO**

### **1. 🚀 EXECUTAR HIPÓTESE A:**
```bash
cd /home/pixie/idea
python3 scripts/RESET_VIP_HIPOTESE_A_SEGURO.py
```

### **2. 🔄 ROLLBACK (se necessário):**
```bash
cd /home/pixie/idea
python3 scripts/ROLLBACK_VIP_EMERGENCIA.py
```

### **3. 🔍 VERIFICAR ESTADO:**
```bash
# Verificar contagens pós-operação
python3 -c "
import psycopg2
conn = psycopg2.connect('DATABASE_URL')
cur = conn.cursor()

# Estado sistema VIP
cur.execute('SELECT COUNT(*) FROM internal_products')
print(f'Produtos VIP: {cur.fetchone()[0]}')

# Estado sistema Geko (deve ser inalterado)  
cur.execute('SELECT COUNT(*) FROM products')
print(f'Produtos Geko: {cur.fetchone()[0]} (deve ser 8126)')
"
```

---

## ⚠️ **CONFIRMAÇÕES NECESSÁRIAS**

### **🎯 ANTES DE EXECUTAR:**
1. **✅ User confirmou Hipótese A** 
2. **✅ Backup será criado automaticamente**
3. **✅ Rollback disponível a qualquer momento**
4. **✅ Zero impacto no sistema Geko garantido**

### **🔐 DURANTE EXECUÇÃO:**
- **Confirmar isolamento Geko** ✅ 
- **Confirmar backup criado** ✅
- **Confirmar reset** (escrever 'RESET') ✅
- **Verificar cada etapa** ✅

---

## 🎉 **RESULTADO FINAL ESPERADO**

### **🏆 SISTEMA VIP PERFEITO:**
- **396 produtos** operacionais com preços válidos
- **~940 variantes** correctamente relacionadas  
- **100% categorização** funcional
- **Sistema preços hierárquico** implementado
- **Base limpa** para implementar Opção A (inventário)

### **🛡️ SISTEMA GEKO INTOCADO:**
- **8,126 produtos** preservados
- **View unificada** funcionando
- **Frontend** sem alterações
- **Clientes** sem impacto

### **🚀 PRÓXIMOS PASSOS:**
- **Implementar inventário** (Opção A original)
- **Interface controlo preços**
- **Logos marcas reais**
- **Funcionalidades avançadas**

---

## 💬 **COMANDO FINAL DE EXECUÇÃO**

**🎯 Para executar a Hipótese A, confirma:**

```bash
cd /home/pixie/idea && python3 scripts/RESET_VIP_HIPOTESE_A_SEGURO.py
```

**🛡️ Garantias:**
- ✅ Backup automático criado
- ✅ Rollback disponível em caso de problema  
- ✅ Zero impacto no sistema Geko
- ✅ Processo interrompível a qualquer momento

**Estás pronto para executar? 🚀**

---

**Documento preparado:** 19 Janeiro 2025  
**Scripts prontos:** ✅ Reset + ✅ Rollback  
**Salvaguardas:** ✅ Máxima segurança implementada  
**Próxima acção:** **AGUARDAR COMANDO DE EXECUÇÃO** 🎯 