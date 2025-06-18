# Changelog - Projeto IDEA E-commerce

## [v2.4.0] - 2025-01-18

### 🐞 **Correções Críticas no Sistema de Filtragem**

#### **Filtragem Hierárquica de Categorias**
-   ✅ **Correção Definitiva**: Substituída a lógica de `LIKE` por uma **CTE Recursiva** no SQL, garantindo que o filtro de categorias funcione corretamente para todos os níveis (raiz, intermédio e folha).
-   ✅ **Consistência de Dados**: Criado e executado um script de migração (`V6__normalize_category_ids.sql`) para normalizar todos os `categoryid`s gerados (`GEN_...`) para IDs numéricos, e reconstruir a hierarquia de `parent_id`s, resolvendo a causa raiz do problema.
-   ✅ **Validação**: Confirmado que a seleção de qualquer categoria agora retorna todos os produtos de todas as suas subcategorias.

#### **Outros Filtros**
-   ✅ **Filtros Rápidos e de Marcas**: Corrigida a comunicação de estado entre o `FilterSidebar` e a `ProductsPage`, garantindo que todos os filtros são aplicados corretamente.
-   ✅ **Lógica Refatorada**: `FilterSidebar` agora é um componente "puro" que depende de callbacks, tornando o sistema mais robusto e previsível.

---

## [v2.3.0] - 2025-01-14

### 🎨 **Melhorias na Página de Detalhes do Produto**

#### **Galeria de Imagens Premium**
- ✅ **Correção de posicionamento**: Ajustado conflito de classes CSS entre `ProductImageGallery` e container pai
- ✅ **Layout responsivo otimizado**: Galeria ocupa exatamente 50% da largura em desktop
- ✅ **Funcionalidade de zoom interativo**: Click para ampliar/reduzir imagens
- ✅ **Navegação entre imagens**: Setas de navegação com hover effects
- ✅ **Miniaturas elegantes**: Seleção visual com indicadores de estado
- ✅ **Contador de imagens**: Display "X / Y" para múltiplas imagens
- ✅ **Placeholder profissional**: Estado sem imagem com design consistente

#### **Design e UX Aprimorados**
- ✅ **Gradientes premium**: Backgrounds com gradientes sutis
- ✅ **Sombras e bordas**: Efeitos de profundidade com shadow-2xl
- ✅ **Transições suaves**: Animações em hover e interações
- ✅ **Indicadores visuais**: Estados de loading, erro e sucesso
- ✅ **Responsividade completa**: Otimizado para todos os dispositivos

#### **Estrutura de Preços Revolucionária**
- ✅ **Cards de preço contextuais**: Diferentes estados para usuários autenticados/não autenticados
- ✅ **Cálculo automático de descontos**: Percentuais e valores de poupança
- ✅ **Badges de promoção animados**: Indicadores visuais de ofertas
- ✅ **Informações complementares**: IVA e garantia incluídos

#### **Sistema de Stock Inteligente**
- ✅ **Indicadores visuais de stock**: Dots coloridos para diferentes níveis
- ✅ **Informações por variante**: Stock específico para cada SKU
- ✅ **Grid de benefícios**: Entrega rápida, garantia, suporte 24h
- ✅ **Permissões granulares**: Visibilidade baseada em roles de usuário

#### **Seletor de Variantes Avançado**
- ✅ **Cards interativos**: Design elegante para seleção de variantes
- ✅ **Informações detalhadas**: Nome, referência e stock por variante
- ✅ **Estados visuais**: Selecionado, hover e indisponível
- ✅ **Validação em tempo real**: Controle de quantidade baseado em stock

### 🛠 **Correções Técnicas**

#### **Estrutura de Layout**
- 🔧 **Remoção de classes conflitantes**: `lg:w-1/2` removida do componente filho
- 🔧 **Container flexbox otimizado**: `lg:flex lg:items-stretch` para alinhamento perfeito
- 🔧 **Altura mínima definida**: `lg:min-h-[600px]` para consistência visual
- 🔧 **Posicionamento absoluto**: Elementos de navegação corretamente posicionados

#### **Performance e Acessibilidade**
- 🔧 **Lazy loading de imagens**: Otimização de carregamento
- 🔧 **Alt text apropriado**: Descrições para acessibilidade
- 🔧 **Fallback de imagens**: Placeholder automático em caso de erro
- 🔧 **Keyboard navigation**: Suporte para navegação por teclado

### 📱 **Responsividade Aprimorada**
- ✅ **Mobile-first design**: Layout otimizado para dispositivos móveis
- ✅ **Breakpoints consistentes**: sm:, md:, lg: aplicados uniformemente
- ✅ **Touch-friendly**: Botões e controles adequados para touch
- ✅ **Viewport adaptativo**: Ajuste automático para diferentes telas

---

## [v2.2.0] - 2025-01-13

### 🔐 **Sistema de Autenticação Local**
- ✅ **Migração do Clerk**: Implementado sistema de autenticação próprio
- ✅ **JWT tokens**: Autenticação segura com tokens
- ✅ **Roles e permissões**: Sistema RBAC completo
- ✅ **Middleware de segurança**: Proteção de rotas admin

### 🛒 **Área Administrativa**
- ✅ **Gestão de produtos**: CRUD completo para produtos
- ✅ **Gestão de pedidos**: Visualização e gestão de encomendas
- ✅ **Gestão de utilizadores**: Criação e gestão de contas
- ✅ **Dashboard administrativo**: Interface centralizada

### 🗄️ **Estrutura de Base de Dados**
- ✅ **Schema refatorado**: Estrutura otimizada para e-commerce
- ✅ **Migrações**: V1 e V2 implementadas
- ✅ **Integridade referencial**: Foreign keys e constraints
- ✅ **Triggers automáticos**: Updated_at automático

---

## [v2.1.0] - 2025-01-12

### 🏗️ **Arquitetura Base**
- ✅ **Configuração inicial**: Estrutura do projeto
- ✅ **Integração Geko API**: Sincronização de produtos
- ✅ **Sistema de categorias**: Hierarquia dinâmica
- ✅ **Gestão de imagens**: Upload e otimização

### 🎨 **Interface de Utilizador**
- ✅ **Design responsivo**: Layout adaptativo
- ✅ **Componentes reutilizáveis**: Biblioteca de componentes
- ✅ **Internacionalização**: Suporte PT/EN
- ✅ **Tema consistente**: Design system implementado

---

*Documentação completa disponível em `/docs/`* 

## [3.0.0] - 2025-01-18

### 🎉 ÁREA ADMIN 100% COMPLETA

#### ✨ Added - Novas Funcionalidades Principais
- **Sistema de Relatórios Completo**
  - ReportsPage.jsx com interface tabbed para diferentes tipos de relatórios
  - API `/api/admin/reports` com 7 endpoints para analytics
  - Dashboard overview com KPIs principais
  - Relatórios de vendas por período (dia/mês/ano)
  - Performance de produtos e análise de stock
  - Analytics de utilizadores e alertas de inventário

- **Gestão de Roles e Permissões (RBAC)**
  - RolesPage.jsx com interface completa para gestão RBAC
  - API `/api/admin/roles` com 8 endpoints para gestão de roles
  - Criação, edição e eliminação de roles
  - Gestão granular de permissões
  - Atribuição de utilizadores a roles
  - Proteção de roles de sistema (admin/customer)

- **Configurações de Sistema**
  - SettingsPage.jsx com interface organizada por tabs
  - API `/api/admin/settings` com 8 endpoints para configurações
  - Configurações por categoria (geral, geko, sync, security)
  - Testes de conectividade (Geko API e Base de Dados)
  - Configuração de intervalos de sincronização
  - Gestão de margens de preço e timeouts

#### 🔧 Enhanced - Melhorias
- **AdminDashboard.jsx atualizado**
  - Todas as funcionalidades agora marcadas como disponíveis
  - Ações rápidas funcionais para todas as áreas
  - Status atualizado para "Área Admin Completa"
  - Grid de funcionalidades com acesso direto

- **Rotas do App.jsx**
  - Adicionadas rotas para `/admin/reports`, `/admin/roles`, `/admin/settings`
  - Todas as rotas protegidas com middleware `requireAdmin`
  - Navegação completa entre todas as páginas admin

#### 🔐 Security
- **Sistema RBAC Completo**
  - 8 permissões granulares definidas
  - Middleware de autenticação em todas as APIs
  - Proteção contra modificação de roles críticos
  - Validação e sanitização de inputs

#### 🏗️ Technical
- **6 APIs Admin Completas**
  - products.cjs, orders.cjs, users.cjs (existentes)
  - reports.cjs, roles.cjs, settings.cjs (novos)
  - Total de 38 endpoints implementados
  - Tratamento de erros robusto em todas as APIs

- **14 Páginas Admin Funcionais**
  - Interface moderna e responsiva
  - Componentes reutilizáveis
  - Estados de loading e feedback visual
  - Validação de formulários consistente

#### 🧪 Testing
- **Testes de Conectividade**
  - Endpoint para testar API Geko
  - Endpoint para testar Base de Dados
  - Validação de configurações
  - Todas as APIs retornando status corretos

#### 📊 Metrics
- **Cobertura Completa:**
  - 14 páginas frontend implementadas
  - 6 APIs backend completas
  - 38 endpoints funcionais
  - 100% das funcionalidades principais

### 🎯 Summary
A área de administração está agora **100% completa e funcional**, incluindo todas as funcionalidades principais para gestão de uma loja online B2B: produtos, encomendas, utilizadores, relatórios, roles/permissões e configurações de sistema.

---

## [2.0.0] - 2025-01-17

### ✨ Added - Gestão Completa de Encomendas
- **OrdersAdminPage.jsx** - Listagem completa de encomendas com filtros avançados
- **OrderDetailPage.jsx** - Página de detalhes e gestão de status de encomendas
- **OrderCreatePage.jsx** - Criação manual de encomendas pelo admin
- **API `/api/admin/orders`** - Endpoints completos para gestão de encomendas
- **Filtros avançados** - Por status, cliente, período, valor
- **Ações rápidas** - Aprovar/rejeitar diretamente na listagem
- **Workflow de status** - Gestão completa do ciclo de vida das encomendas

### 🔧 Fixed - Correções Críticas
- **Erro na edição de produtos** - `column pv_detail.sku does not exist`
  - Substituído `pv_detail.sku` por `pv_detail.name as variant_name`
  - Query de produtos funcionando corretamente
- **Paginação placeholder** - Implementado componente `Pagination` reutilizável
- **Criação de produtos** - Corrigido para nova estrutura da tabela `prices`
- **Rotas comentadas** - Ativada rota `/admin/products/create`

### 🏗️ Enhanced - Melhorias
- **AdminDashboard.jsx** - Adicionadas estatísticas de encomendas
- **Paginação consistente** - Componente comum em todas as páginas
- **Interface responsiva** - Otimizada para mobile e desktop
- **Validação robusta** - Frontend e backend

### 🧪 Testing
- Todos os endpoints de produtos testados e funcionais
- Endpoints de encomendas validados
- Sistema de autenticação verificado
- Performance de queries otimizada

---

## [1.0.0] - 2025-01-16

### ✨ Added - Funcionalidades Iniciais
- **Sistema de Autenticação Local** - JWT com roles (admin/customer)
- **Gestão Completa de Produtos**
  - ProductsAdminPage.jsx - Listagem com filtros e busca
  - ProductEditPage.jsx - Edição completa de produtos
  - ProductCreatePage.jsx - Criação de novos produtos
  - ProductViewPage.jsx - Visualização detalhada
- **AdminDashboard.jsx** - Painel principal com estatísticas
- **UsersAdminPage.jsx** - Gestão de utilizadores
- **UserCreatePage.jsx** - Criação de novos utilizadores
- **UserEditPage.jsx** - Edição de dados de utilizadores

### 🔐 Security
- **Middleware `requireAdmin`** - Proteção de todas as rotas admin
- **Validação JWT** - Tokens seguros com expiração
- **Sanitização de inputs** - Prevenção de injeções
- **Logging de ações** - Auditoria de operações administrativas

### 🏗️ Technical
- **APIs REST completas** - CRUD para produtos e utilizadores
- **Base de dados PostgreSQL** - Schema otimizado com relacionamentos
- **Frontend React** - Componentes modulares e reutilizáveis
- **Tailwind CSS** - Design system consistente

### 📱 Interface
- **Design responsivo** - Mobile-first approach
- **Navegação intuitiva** - Breadcrumbs e menus claros
- **Feedback visual** - Estados de loading, sucesso e erro
- **Componentes reutilizáveis** - Consistência em toda a aplicação

---

## [0.1.0] - 2025-01-15

### ✨ Added - Setup Inicial
- **Estrutura base** do projeto
- **Configuração inicial** da base de dados
- **Sistema de autenticação** básico
- **Páginas públicas** - Home, produtos, contato
- **Integração Geko API** - Configuração inicial

### 🔧 Infrastructure
- **Servidor Express.js** - API backend
- **PostgreSQL (Neon)** - Base de dados cloud
- **React Router** - Navegação SPA
- **Variáveis de ambiente** - Configuração segura

---

**Legenda:**
- ✨ Added: Novas funcionalidades
- 🔧 Fixed: Correções de bugs
- 🏗️ Enhanced: Melhorias em funcionalidades existentes
- 🔐 Security: Melhorias de segurança
- 🧪 Testing: Testes e validações
- 📱 Interface: Melhorias de UI/UX
- 📊 Metrics: Métricas e analytics 