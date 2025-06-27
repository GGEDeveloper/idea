# Changelog

Todas as mudanças notáveis do projeto AliTools B2B serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v2.2.0-B2B-UX-ENHANCED] - 2025-01-26

### 🎨 Enhanced
- **[FILTROS]** Sistema de filtros collapsible implementado
  - Todas as seções de filtro agora podem ser expandidas/colapsadas
  - Filtros Rápidos: Expandido por padrão
  - Categorias, Marcas e Preços: Colapsados por padrão
  - Badges informativos mostrando contadores de filtros ativos
  - Descrições contextuais em cada seção

- **[BRANDING]** Ícones pequenos das marcas nos filtros
  - 5 marcas principais com logos SVG personalizados:
    - GEKO: Logo azul com gradiente
    - TVARDY: Logo vermelho profissional
    - John Gardener: Logo verde para ferramentas de jardim
    - Keltin: Logo roxo para linha acessível
    - Heidmann: Logo cinza para linha profissional/industrial
  - Fallback inteligente: Iniciais em gradiente para marcas sem logo

### 🔧 Fixed
- **[UX]** Corrigida confusão de interface com controles duplicados
  - Removido controle de visualização das categorias (cards vs lista)
  - Mantido apenas controle principal dos produtos (grid vs lista)
  - Interface mais limpa sem controles conflitantes
  - UX mais clara - sem ambiguidade sobre função de cada controle

### ⚡ Optimized
- **[PERFORMANCE]** Build mais leve (15.9 kB vs 16.5 kB anterior)
- **[CODE]** Removidas ~150 linhas de código desnecessário
- **[LOGIC]** Lógica simplificada com modo cards fixo para categorias

### 🎯 Improved
- **[NAVIGATION]** Navegação hierárquica das categorias mantida em modo cards
- **[SEARCH]** Busca de categorias e marcas melhorada
- **[RESPONSIVE]** Layout responsivo mantido em todos os tamanhos

## [v2.1.0-B2B-STABLE] - 2025-01-26

### 🔧 Fixed
- **[CRÍTICO]** Corrigido erro de TypeScript na página `/admin/settings`
  - Adicionado tipo 'email' ao union type de `activeTab`
  - Build agora compila sem erros de tipo
- **[API]** Validação de API `POST /api/pedido-cooperacao` confirmada funcional
  - Testado com dados válidos portugueses (NIF, código postal)
  - Response: `{"success":true,"message":"Pedido de cooperação submetido com sucesso","reference_id":"7e9a0e55"}`

### ✅ Validated
- **Sistema de Base de Dados**: 10 tabelas funcionais
  - `customer_addresses`, `customer_contacts`, `customer_banks`
  - `customer_suppliers`, `customer_admin_data`, `email_configurations` 
  - `email_templates`, `admin_notifications`, `email_logs`, `customer_audit_log`
- **APIs de Notificações**: Testadas e funcionais
  - `GET /api/admin/notifications` - Retorna 4 notificações (2 não lidas)
  - `PATCH /api/admin/notifications` - Atualização de estado funcional
- **Frontend Completo**:
  - Hook `useNotifications` com polling automático
  - Badge de notificações no layout admin
  - Página completa de gestão de notificações
  - Formulário público de pedido de cooperação

### 🎨 Design System
- **CSS Modular**: Validado e funcional
  - `variables.css` - Sistema de temas light/dark
  - `utilities.css` - Classes utilitárias (`.bg-base`, `.text-base`)
  - `components.css` - Componentes específicos
  - `base.css` - Estilos base e scrollbars
- **Dark Mode**: Implementado em todos os componentes

### 📊 Compliance
- ✅ Todas as regras do projeto seguidas
- ✅ Sem alterações de BD não aprovadas
- ✅ Logging detalhado implementado
- ✅ Sistema de auditoria completo
- ✅ UX mobile responsivo

### 🧪 Testing
- Build sem erros TypeScript
- APIs testadas via curl
- Workflow completo validado (formulário → notificação → admin)

---

## [v2.0.0-B2B] - 2025-01-20

### Added
- Sistema completo de gestão de clientes B2B
- Base de dados com 10 tabelas especializadas
- APIs completas para pedidos de cooperação
- Sistema de notificações admin
- Formulário público de pedido de cooperação
- Design system CSS modular com dark mode

### Security
- Validação portuguesa (NIF, códigos postais)
- Sistema de auditoria completo
- Logging detalhado de todas as ações

---

## Formato das Versões

- **MAJOR.MINOR.PATCH-ENVIRONMENT**
- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Funcionalidades adicionadas (compatível)
- **PATCH**: Correções de bugs (compatível)
- **ENVIRONMENT**: B2B, ADMIN, CLIENT, etc. 