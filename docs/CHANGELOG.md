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