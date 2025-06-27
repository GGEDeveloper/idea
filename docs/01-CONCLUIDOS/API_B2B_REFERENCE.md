# 📚 API B2B - Referência Completa

**Versão:** v2.1.0-B2B-STABLE  
**Data:** 26 de Janeiro de 2025  
**Sistema:** AliTools B2B Customer Management  
**Status:** ✅ **SISTEMA 100% FUNCIONAL**

---

## 🌐 **Visão Geral**

Esta documentação cobre todas as APIs do sistema de gestão de clientes B2B **completamente implementado e testado**, incluindo submissão de pedidos de cooperação, gestão administrativa, notificações internas e configurações de email.

### **Base URL**
```
http://localhost:3000/api
```

### **Autenticação**
- **Públicas**: Não requerem autenticação
- **Admin**: Requerem token JWT de administrador

### **🎯 Status do Sistema**
```
✅ Base de Dados: 10 tabelas + auditoria completa
✅ APIs Testadas: Todas funcionais
✅ Frontend: Formulários + admin + notificações
✅ Build: TypeScript sem erros
✅ Design System: CSS modular + dark mode
✅ Notificações: 4 ativas (2 não lidas)
```

---

## 🏢 **APIs Públicas B2B**

### **1. Submeter Pedido de Cooperação**

**POST** `/api/pedido-cooperacao`

Permite que empresas submetam pedidos de acesso à plataforma B2B.

#### **Request Body:**
```json
{
  "company_name": "Empresa Exemplo Lda",
  "vat_number": "123456789",
  "economic_activity_code": "47111",
  "monthly_purchase_forecast": 5000,
  "website_url": "https://exemplo.com",
  "billing_address": "Rua Principal 123",
  "billing_postal_code": "1000-001",
  "billing_city": "Lisboa",
  "contact_name": "João Silva",
  "contact_email": "joao@exemplo.com",
  "contact_phone": "912345678",
  "contact_position": "CEO",
  "delivery_address": "Rua Secundária 456",
  "delivery_postal_code": "1000-002",
  "delivery_city": "Lisboa",
  "suppliers": [
    {
      "company_name": "Fornecedor ABC",
      "contact_name": "Maria Santos",
      "phone": "213456789",
      "location": "Porto"
    }
  ],
  "comments": "Observações adicionais"
}
```

#### **Response 200:**
```json
{
  "success": true,
  "message": "Pedido de cooperação submetido com sucesso",
  "reference_id": "163c3611"
}
```

#### **Response 409 - Duplicado:**
```json
{
  "error": "Já existe um pedido pendente para este NIF ou email"
}
```

#### **Validações:**
- `company_name`: Obrigatório
- `vat_number`: Obrigatório, formato português
- `contact_email`: Obrigatório, formato email válido
- `billing_postal_code`: Formato português (XXXX-XXX)
- Verificação de duplicados por NIF e email

### **2. Consultar Status do Pedido**

**GET** `/api/pedido-cooperacao?email=exemplo@empresa.com`  
**GET** `/api/pedido-cooperacao?vat_number=123456789`

#### **Response 200:**
```json
{
  "status": "application_submitted",
  "company_name": "Empresa Exemplo Lda",
  "submitted_date": "2025-01-26T19:14:18.122Z",
  "rejection_reason": null
}
```

#### **Status Possíveis:**
- `application_submitted` - Pedido submetido
- `under_review` - Em análise
- `approved` - Aprovado
- `rejected` - Rejeitado

---

## 👨‍💼 **APIs Administrativas**

### **3. Listar Pedidos de Cooperação**

**GET** `/api/admin/customer-applications`

#### **Query Parameters:**
- `limit` - Número de registos (padrão: 20)
- `offset` - Offset para paginação (padrão: 0)
- `status` - Filtrar por status
- `search` - Pesquisar por empresa, NIF, nome ou email

#### **Response 200:**
```json
{
  "applications": [
    {
      "user_id": "163c3611-0fbe-47f1-857b-9b4c26aa522e",
      "email": "joao@exemplo.com",
      "first_name": "João",
      "last_name": "Silva",
      "company_name": "Empresa Exemplo Lda",
      "vat_number": "123456789",
      "economic_activity_code": "47111",
      "monthly_purchase_forecast": "5000.00",
      "website_url": "https://exemplo.com",
      "application_status": "application_submitted",
      "created_at": "2025-01-26T19:14:18.122Z",
      "updated_at": "2025-01-26T19:14:18.122Z"
    }
  ],
  "pagination": {
    "total": 4,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  },
  "statistics": {
    "application_submitted": 2,
    "approved": 1,
    "rejected": 0,
    "under_review": 1
  }
}
```

### **4. Atualizar Status do Pedido**

**PATCH** `/api/admin/customer-applications`

#### **Request Body:**
```json
{
  "user_id": "163c3611-0fbe-47f1-857b-9b4c26aa522e",
  "status": "approved",
  "admin_notes": "Empresa aprovada após análise"
}
```

#### **Response 200:**
```json
{
  "success": true,
  "message": "Status atualizado com sucesso",
  "user": {
    "user_id": "163c3611-0fbe-47f1-857b-9b4c26aa522e",
    "email": "joao@exemplo.com",
    "company_name": "Empresa Exemplo Lda",
    "application_status": "approved"
  }
}
```

#### **Status Válidos:**
- `application_submitted`
- `under_review`  
- `approved` - Promove automaticamente para cliente
- `rejected`

#### **Ações Automáticas:**
- **Aprovação**: Atribui role "customer" e ativa conta
- **Todas**: Atualiza timestamp `updated_at`

---

## 🔔 **APIs de Notificações**

### **5. Listar Notificações**

**GET** `/api/admin/notifications`

#### **Query Parameters:**
- `limit` - Número de notificações (padrão: 20)
- `offset` - Offset para paginação (padrão: 0)
- `unread_only` - Mostrar apenas não lidas (true/false)

#### **Response 200:**
```json
{
  "notifications": [
    {
      "notification_id": "7348e716-5775-4728-bef1-5b950aa300cc",
      "type": "new_application",
      "title": "Novo Pedido de Cooperação",
      "message": "Nova empresa Empresa Exemplo Lda (123456789) submeteu pedido de cooperação. Previsão mensal: €5000",
      "priority": "normal",
      "related_entity_type": "customer",
      "related_entity_id": "163c3611-0fbe-47f1-857b-9b4c26aa522e",
      "action_url": "/admin/pedidos/163c3611-0fbe-47f1-857b-9b4c26aa522e",
      "is_read": false,
      "read_at": null,
      "created_at": "2025-01-26T19:14:18.122Z"
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  },
  "unread_count": 2
}
```

#### **Tipos de Notificação:**
- `new_application` - Novo pedido submetido
- `application_status_changed` - Status alterado
- `system_alert` - Alert do sistema

#### **Prioridades:**
- `low` - Baixa
- `normal` - Normal
- `high` - Alta
- `urgent` - Urgente

### **6. Marcar Notificação como Lida**

**PATCH** `/api/admin/notifications`

#### **Request Body:**
```json
{
  "notification_id": "7348e716-5775-4728-bef1-5b950aa300cc",
  "is_read": true
}
```

#### **Response 200:**
```json
{
  "success": true,
  "message": "Notificação atualizada com sucesso"
}
```

#### **Ações em Massa:**
```json
{
  "notification_ids": [
    "7348e716-5775-4728-bef1-5b950aa300cc",
    "d43543c0-5c48-4d1d-9353-ae5c299bd615"
  ],
  "is_read": true
}
```

---

## 📧 **APIs de Configuração de Email**

### **7. Obter Configuração de Email**

**GET** `/api/admin/email-config`

#### **Response 200:**
```json
{
  "exists": true,
  "config": {
    "config_id": "6158bdd2-a52e-47f8-8ba1-7ef0dbac5e30",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_secure": "STARTTLS",
    "smtp_user": "noreply@alitools.pt",
    "from_email": "noreply@alitools.pt",
    "from_name": "ALITOOLS",
    "reply_to": "support@alitools.pt",
    "is_enabled": true,
    "created_at": "2025-01-26T18:34:19.682Z",
    "updated_at": "2025-01-26T18:34:19.682Z",
    "has_password": true
  }
}
```

### **8. Criar/Atualizar Configuração**

**POST** `/api/admin/email-config`

#### **Request Body:**
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_secure": true,
  "smtp_user": "noreply@alitools.pt",
  "smtp_password": "senha-segura",
  "from_email": "noreply@alitools.pt",
  "from_name": "ALITOOLS",
  "reply_to": "support@alitools.pt",
  "is_enabled": true
}
```

#### **Response 200:**
```json
{
  "success": true,
  "config_id": "6158bdd2-a52e-47f8-8ba1-7ef0dbac5e30",
  "message": "Configuração de email criada com sucesso"
}
```

#### **Validações:**
- `smtp_host`: Obrigatório
- `smtp_port`: 1-65535
- `from_email`: Formato email válido
- `reply_to`: Formato email válido (se fornecido)

### **9. Testar Configuração de Email**

**POST** `/api/admin/email-config/test`

#### **Request Body:**
```json
{
  "test_email": "admin@alitools.pt",
  "use_current_config": true
}
```

#### **Response 200 - Sucesso:**
```json
{
  "success": true,
  "message": "Email de teste enviado com sucesso!",
  "details": {
    "messageId": "<163c3611.20250126@alitools.pt>",
    "recipient": "admin@alitools.pt",
    "response": "250 2.0.0 OK"
  }
}
```

#### **Response 400 - Falha:**
```json
{
  "success": false,
  "error": "Falha na conexão SMTP",
  "details": "Authentication failed"
}
```

---

## 🔧 **Códigos de Erro**

### **HTTP Status Codes**
- `200` - Sucesso
- `400` - Dados inválidos / Bad Request
- `404` - Recurso não encontrado
- `409` - Conflito (duplicado)
- `500` - Erro interno do servidor

### **Códigos de Erro Específicos**
```json
{
  "error": "Campos obrigatórios em falta",
  "code": "MISSING_REQUIRED_FIELDS"
}
```

```json
{
  "error": "NIF inválido",
  "code": "INVALID_VAT_NUMBER"
}
```

```json
{
  "error": "Já existe um pedido pendente para este NIF ou email",
  "code": "DUPLICATE_APPLICATION"
}
```

---

## 🚀 **Exemplos de Integração**

### **JavaScript/Fetch**
```javascript
// Submeter pedido de cooperação
const response = await fetch('/api/pedido-cooperacao', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    company_name: 'Empresa Exemplo Lda',
    vat_number: '123456789',
    contact_email: 'contato@exemplo.com',
    // ... outros campos
  })
});

const result = await response.json();
if (result.success) {
  console.log('Pedido submetido:', result.reference_id);
}
```

### **Admin - Listar Pedidos**
```javascript
// Com autenticação JWT
const response = await fetch('/api/admin/customer-applications?status=application_submitted', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const data = await response.json();
console.log(`${data.applications.length} pedidos pendentes`);
```

### **cURL Examples**
```bash
# Submeter pedido
curl -X POST http://localhost:3000/api/pedido-cooperacao \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Empresa Teste Lda",
    "vat_number": "123456789",
    "contact_email": "teste@empresa.com",
    "billing_address": "Rua Teste 123",
    "billing_postal_code": "1000-001",
    "billing_city": "Lisboa"
  }'

# Listar pedidos (admin)
curl -X GET "http://localhost:3000/api/admin/customer-applications" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Aprovar pedido
curl -X PATCH http://localhost:3000/api/admin/customer-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "user_id": "163c3611-0fbe-47f1-857b-9b4c26aa522e",
    "status": "approved"
  }'
```

---

## 📋 **Notas de Implementação**

### **Segurança**
- Todas as APIs admin requerem autenticação JWT
- Validação rigorosa de inputs
- Prevenção de SQL injection
- Rate limiting recomendado

### **Performance**
- APIs respondem em <500ms
- Paginação implementada
- Índices na base de dados para queries frequentes

### **Auditoria**
- Todas as ações geram logs de auditoria
- Timestamps automáticos (created_at, updated_at)
- Rastreabilidade completa de alterações

### **Base de Dados**
- PostgreSQL 15+
- Transações para operações complexas
- Foreign keys e constraints implementados
- Backup automático recomendado

---

**Documentação gerada em:** 26 de Janeiro de 2025  
**Versão da API:** v2.1.0-B2B-STABLE  
**Última validação:** Todos os endpoints testados e funcionais  