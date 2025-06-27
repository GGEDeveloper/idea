# 📊 Relatório de Validação do Database Schema

**Data da Validação:** 27 de Janeiro de 2025  
**Base de Dados:** PostgreSQL (Neon)  
**Total de Tabelas:** 42  
**Total de Views:** 1  

---

## ❌ **DISCREPÂNCIAS CRÍTICAS ENCONTRADAS**

### **1. TABELAS EXTRAS NA BASE DE DADOS (19 tabelas não documentadas)**

O `database_schema.sql` está **DESATUALIZADO**. A base de dados real tem **19 tabelas extras** que não estão documentadas:

#### **🔧 Sistema Admin/Notificações**
- `admin_notifications` - Sistema de notificações para administradores
- `bulk_price_operations` - Operações de preços em lote
- `campaign_prices` - Preços de campanhas promocionais
- `price_campaigns` - Campanhas de preços
- `price_history` - Histórico de alterações de preços
- `price_list_assignments` - Atribuições de listas de preços
- `pricing_rules` - Regras de pricing
- `pending_geko_price_updates` - Updates pendentes de preços Geko

#### **📧 Sistema de Email**
- `email_configurations` - Configurações SMTP
- `email_logs` - Logs de emails enviados
- `email_templates` - Templates de email

#### **👥 Sistema de Clientes Avançado**
- `customer_addresses` - Endereços de clientes
- `customer_admin_data` - Dados administrativos de clientes
- `customer_audit_log` - Auditoria de ações de clientes
- `customer_banks` - Dados bancários de clientes
- `customer_contacts` - Contactos de clientes
- `customer_suppliers` - Relação clientes-fornecedores

#### **📄 Conteúdo e FAQs**
- `content_pages` - Páginas de conteúdo
- `faqs` - Perguntas frequentes

#### **📈 Views**
- `pending_geko_updates_summary` - Resumo de updates pendentes

---

## ✅ **TABELAS CORRETAMENTE DOCUMENTADAS**

### **Estrutura das Tabelas Principais Validada:**

#### **🛍️ Produtos (8.126 produtos)**
- ✅ `products` - Estrutura correta (10 colunas)
- ✅ `product_variants` - Estrutura correta (6 colunas, 8.126 registos)
- ✅ `product_categories` - Estrutura correta (2 colunas, 8.122 registos)
- ✅ `product_images` - Estrutura correta (5 colunas, 31.511 registos)
- ✅ `product_attributes` - Estrutura correta (6 colunas, 4.240 registos)
- ✅ `geko_products` - Estrutura correta (9 colunas, 8.122 registos)

#### **📂 Categorias (416 categorias)**
- ✅ `categories` - Estrutura correta (6 colunas)

#### **👤 Utilizadores (11 utilizadores)**
- ✅ `users` - **TABELA EXPANDIDA** (23 colunas vs documentadas no schema)
- **Colunas extras na tabela users:**
  - `application_status`
  - `customer_number`
  - `vat_number`
  - `economic_activity_code`
  - `monthly_purchase_forecast`
  - `website_url`
  - `application_date`
  - `approved_by`
  - `approval_date`
  - `rejection_reason`
  - `created_by_admin`

#### **🛒 Encomendas (4 encomendas, 8 itens)**
- ✅ `orders` - Estrutura correta
- ✅ `order_items` - Estrutura correta

#### **💰 Preços (24.368 preços, 4 listas)**
- ✅ `prices` - Estrutura correta
- ✅ `price_lists` - Estrutura correta

#### **🔐 Permissões (2 roles, 10 permissões, 14 atribuições)**
- ✅ `roles` - Estrutura correta
- ✅ `permissions` - Estrutura correta  
- ✅ `role_permissions` - Estrutura correta

---

## 🔧 **AÇÕES NECESSÁRIAS**

### **1. ATUALIZAR DATABASE_SCHEMA.SQL** ⚠️ **PRIORITÁRIO**

O ficheiro `docs/database_schema.sql` deve ser **completamente atualizado** para incluir:

1. **Todas as 19 tabelas extras**
2. **Colunas adicionais na tabela `users`**
3. **View `pending_geko_updates_summary`**
4. **Comentários atualizados com contagens reais**

### **2. DOCUMENTAR SISTEMAS NOVOS**

Criar documentação para os novos sistemas:
- Sistema de notificações admin
- Sistema de email/templates
- Sistema de clientes avançado
- Sistema de pricing campaigns
- Sistema de auditoria

### **3. VERIFICAR MIGRAÇÕES**

Identificar quais migrações criaram estas tabelas e garantir que estão documentadas.

---

## 📈 **ESTATÍSTICAS DA BASE DE DADOS**

| Categoria | Quantidade | Status |
|-----------|------------|--------|
| **Produtos** | 8.126 | ✅ Funcional |
| **Categorias** | 416 | ✅ Funcional |
| **Utilizadores** | 11 | ✅ Funcional |
| **Encomendas** | 4 | ✅ Funcional |
| **Preços** | 24.368 | ✅ Funcional |
| **Imagens** | 31.511 | ✅ Funcional |
| **Atributos** | 4.240 | ✅ Funcional |

---

## ⚠️ **CONCLUSÃO**

A base de dados real está **muito mais avançada** que o schema documentado. O sistema cresceu significativamente com:

- **Sistema de clientes B2B completo**
- **Sistema de notificações admin**
- **Sistema de email avançado**
- **Sistema de pricing campaigns**
- **Sistema de auditoria**

**O `database_schema.sql` precisa de ser URGENTEMENTE atualizado** para refletir a realidade da base de dados em produção.

---

**Gerado por:** `scripts/validate_schema.js`  
**Timestamp:** 2025-06-27T09:41:33.966Z 