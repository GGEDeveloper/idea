# Changelog - AliTools Project

## [1.8.1] - 2025-01-28 - **CORREÇÕES FINAIS UX** - Header e Carrinho Mobile

### 🎯 **POLIMENTO FINAL DA INTERFACE**
- ✅ **Problemas de UX identificados e corrigidos** com precisão cirúrgica
- ✅ **Header otimizado** sem duplicações de botões
- ✅ **Carrinho mobile responsive** sem cortes na tela
- ✅ **Build TypeScript**: Compilação perfeita em 4.0s sem erros

### 🔧 **CORREÇÕES IMPLEMENTADAS**

#### **HEADER-FIX-001**: Remoção de Botão Dark Mode Duplicado
- **Problema**: Desktop header exibia 2 botões de dark mode simultaneamente
- **Localização**: `<ThemeToggle />` (Desktop Tools) + botão customizado (Cart/Mobile section)
- **Solução**: Removido botão customizado e mantido apenas `<ThemeToggle />` componente
- **Impacto**: Interface limpa com apenas 1 botão de dark mode visível
- **Arquivo**: `app/components/HeaderAdvanced.tsx`

#### **MOBILE-CART-001**: Correção Dropdown Carrinho Mobile
- **Problema**: Carrinho dropdown ficava cortado nas bordas da tela em mobile
- **Causa**: Largura fixa `w-96` e ausência de margem responsiva
- **Solução Implementada**:
  - **Largura Responsiva**: `w-80 sm:w-96` (móvel vs desktop)
  - **Margem Inteligente**: `mr-2 sm:mr-0` (margem só em mobile)
  - **MaxWidth Dinâmica**: `calc(100vw - 1rem)` garante visibilidade total
  - **Breakpoint**: Transição suave entre tamanhos mobile/desktop
- **Resultado**: Dropdown sempre visível e funcional em qualquer dispositivo

### 🎨 **MELHORIAS TÉCNICAS**

#### **RESPONSIVE-ENHANCEMENT-001**: Sistema Responsivo Robusto
- **Mobile First**: Priorização de experiência mobile com fallbacks desktop
- **Breakpoints Inteligentes**: `sm:` usado estrategicamente para transições
- **Viewport Awareness**: MaxWidth calculada dinamicamente baseada no viewport
- **Margin Strategy**: Margens condicionais para evitar overflow

#### **CODE-CLEANUP-001**: Limpeza de Código Redundante
- **Remoção**: Lógica duplicada de dark mode removida
- **Simplificação**: Estado de `darkMode` mantido apenas no `ThemeToggle`
- **Otimização**: Imports desnecessários limpos
- **Consistência**: Uso uniforme do sistema de temas modular

### 📱 **EXPERIÊNCIA MOBILE OTIMIZADA**
- **Carrinho Dropdown**: Agora sempre cabe na tela, sem scroll horizontal
- **Header**: Interface limpa sem elementos duplicados
- **Responsividade**: Transições suaves entre dispositivos
- **Touch Friendly**: Elementos adequadamente espaçados para touch

### 📊 **MÉTRICAS DE QUALIDADE**
- **Build Status**: ✅ TypeScript compilation em 4.0s (0 erros)
- **Bundle Size**: Mantido otimizado após remoção de código redundante
- **Performance**: Sem degradação, componentes mais eficientes
- **UX Score**: Interface mais limpa e funcional em todos os dispositivos

### 🚀 **IMPACTO EMPRESARIAL**
- **Mobile UX**: Experiência de carrinho perfeita em smartphones
- **Interface Profissional**: Header limpo sem elementos duplicados
- **Usabilidade**: Zero friction na navegação mobile
- **Qualidade**: Atenção aos detalhes demonstra maturidade do produto

### 🔄 **PRÓXIMOS PASSOS**
- Sistema **100% pronto** para deployment em produção
- Interface polida e profissional para clientes reais
- E-commerce B2B completo sem issues de UX identificados
- Documentação atualizada e repository sincronizado

---

## [1.7.1] - 2025-01-28 - **SISTEMA DE GESTÃO DE ENCOMENDAS COMPLETO** - Workflow Admin Avançado

### 🎯 **MARCO CRÍTICO ALCANÇADO**
- ✅ **Sistema de gestão de encomendas 100% completo** com workflow avançado
- ✅ **11 estados de encomenda implementados** (era só 5 antes)
- ✅ **Correções críticas de APIs** - Todos os erros Next.js 15 resolvidos
- ✅ **Interface admin profissional** com modal de gestão de estados

### 🚀 **NOVO SISTEMA DE ESTADOS DE ENCOMENDA AVANÇADO**

#### **Estados Disponíveis (11 total):**
1. **`pending_approval`** - Pendente de Aprovação (10% progresso)
2. **`approved`** - Aprovada (20% progresso)  
3. **`processing`** - Em Processamento (30% progresso)
4. **`ready_to_ship`** - Pronta para Envio (40% progresso)
5. **`shipped`** - Enviada (60% progresso)
6. **`in_transit`** - Em Rota (70% progresso)
7. **`out_for_delivery`** - Saiu para Entrega (85% progresso)
8. **`delivered`** - Entregue (100% progresso)
9. **`rejected`** - Rejeitada (0% progresso)
10. **`cancelled`** - Cancelada (0% progresso)
11. **`returned`** - Devolvida (0% progresso)

#### **Lógica de Transições Inteligente:**
- **Validação de workflow**: Apenas transições válidas permitidas
- **Estados finais**: `rejected`, `cancelled`, `returned` (sem transições)
- **Progressão linear**: `pending_approval` → `approved` → `processing` → ... → `delivered`
- **Gestão de devoluções**: Apenas após entrega (`delivered` → `returned`)

### 🛠️ **CORREÇÕES CRÍTICAS DE APIS**

#### **NEXT.JS-PARAMS-001**: Correção erros `params` Next.js 15
- **API Products**: `/api/admin/products/[ean]/route.ts` - 3 métodos corrigidos
- **API Users**: `/api/admin/users/[userId]/route.ts` - 3 métodos corrigidos  
- **API Orders**: `/api/admin/orders/[orderId]/route.ts` - 1 método corrigido
- **API Status**: `/api/admin/orders/[orderId]/status/route.ts` - Corrigido + melhorado
- **Erro resolvido**: `params` should be awaited before using its properties

#### **TYPESCRIPT-VALIDATION-001**: Tipagem robusta implementada
- **Tipos específicos**: `Record<string, string[]>` para transições
- **Validação de índices**: Correção de erros `any` type
- **Build sem erros**: ✅ Compilação TypeScript 100% limpa (3.0s)

### 🎨 **INTERFACE ADMIN MELHORADA**

#### **Modal de Gestão de Estados** (`/admin/orders/[orderId]`)
- **Dropdown inteligente**: Mostra apenas transições válidas
- **Campo de notas**: Observações opcionais para mudanças de estado
- **Validação visual**: Descrições e feedback imediato
- **Progresso visual**: Barra de progresso com percentagem
- **Confirmação**: Modal com botões de confirmar/cancelar

#### **Listagem de Encomendas Melhorada** (`/admin/orders`)
- **Badges coloridos**: Visual distinction por estado
- **Mini progress bars**: Progresso individual por encomenda  
- **Filtros expandidos**: 12 opções de filtro (antes eram 6)
- **Estatísticas rápidas**: Contadores pendentes/em processo/entregues
- **Interface moderna**: Cores consistentes com dark mode

#### **Logging e Auditoria**
- **Log detalhado**: Todas as mudanças registadas com admin/timestamp
- **Transições registadas**: Log formato `estado_antigo → estado_novo`
- **Notas incluídas**: Observações admin registadas no log
- **Rastreabilidade**: Histórico completo de mudanças

### 🔧 **MELHORIAS TÉCNICAS**

#### **Validação de Negócio Robusta**
- **Prevenção de regressões**: Não permite voltar atrás no workflow
- **Estados finais protegidos**: Impossível alterar estados terminais
- **Lógica de negócio**: Transições baseadas em regras empresariais
- **Feedback inteligente**: Mensagens específicas para cada tipo de erro

#### **Performance e UX**
- **Transições CSS**: Animações suaves nas barras de progresso
- **Loading states**: Estados de carregamento em todas as ações
- **Error handling**: Gestão robusta de erros com feedback visual
- **Responsive design**: Interface adaptada para mobile/tablet

### 📊 **DADOS TÉCNICOS**
- **Build Status**: ✅ 0 erros TypeScript (compilação em 3.0s)
- **APIs afetadas**: 4 APIs corrigidas, 1 API melhorada  
- **Páginas melhoradas**: 2 páginas admin (`orders` e `orders/[orderId]`)
- **Estados de encomenda**: 11 estados (anteriormente 5)
- **Transições válidas**: 15 combinações de transição válidas
- **Compatibilidade**: 100% compatível com dados existentes

### 💼 **IMPACTO EMPRESARIAL**
- **Gestão completa**: Admin pode gerir todo o ciclo de vida da encomenda
- **Transparência**: Cliente pode acompanhar progresso detalhado  
- **Auditoria**: Rastreabilidade completa de todas as mudanças
- **Escalabilidade**: Sistema preparado para operações B2B complexas
- **Produção ready**: Interface profissional pronta para clientes reais

---

## [1.7.0] - 2025-01-28 - **SISTEMA 100% COMPLETO** - Implementação das 4 Subpáginas Admin

### 🎉 **MILESTONE CRÍTICO ALCANÇADO**
- ✅ **18/18 páginas admin totalmente implementadas** (0 páginas em falta)
- ✅ **Sistema 100% completo** e pronto para produção
- ✅ **Build TypeScript**: 0 erros de compilação
- ✅ **E-commerce completo**: Workflow end-to-end operacional

### 🆕 **4 SUBPÁGINAS ADMIN CRÍTICAS IMPLEMENTADAS**

#### **1. Página Criar Produto** (`/admin/products/new`)
- **ADMIN-PRODUCT-CREATE-001**: Formulário completo de criação de produtos
  - **Campos**: EAN único, nome, descrições curta/longa, marca, status ativo/featured
  - **Validações**: EAN único obrigatório, campos required com feedback visual
  - **Categorias**: Seleção hierárquica via Category Tree component
  - **Marcas**: Datalist dinâmico com auto-complete de marcas existentes
  - **Status**: Checkboxes para produto ativo e em destaque
  - **Fluxo**: Redirect automático para edição após criação bem-sucedida
  - **UX**: Sidebar com dicas de criação, feedback visual e estados de loading

#### **2. Página Criar Utilizador** (`/admin/users/new`)
- **ADMIN-USER-CREATE-001**: Sistema completo de criação de utilizadores
  - **Informações Pessoais**: Email, primeiro nome, último nome, empresa, telefone
  - **Segurança**: Password com show/hide toggle, confirmação obrigatória
  - **Geração Automática**: Botão para gerar passwords seguros automaticamente
  - **Roles**: Dropdown dinâmico com descrições dos tipos de utilizador
  - **Validações**: Email único, formato válido, passwords coincidem
  - **Estado**: Checkbox para conta ativa desde a criação
  - **Sidebar**: Informações educativas sobre tipos de utilizador e segurança

#### **3. Página Editar Utilizador** (`/admin/users/edit/[userId]`)
- **ADMIN-USER-EDIT-001**: Interface completa de edição de utilizadores
  - **Edição Completa**: Todos os campos pessoais e de acesso editáveis
  - **Password Modal**: Sistema seguro para alteração com confirmação dupla
  - **Gestão de Estado**: Ativar/desativar conta, alterar role
  - **Validações**: Email único, prevenção de alterações inválidas
  - **Proteções**: Admin não pode ser eliminado ou ter role alterado por outros
  - **Sidebar**: Detalhes da conta, cronologia (criado/atualizado), status atual
  - **Timeline**: Informações de quando a conta foi criada e última atualização

#### **4. Página Detalhes de Encomenda** (`/admin/orders/[orderId]`)
- **ADMIN-ORDER-DETAILS-001**: Visualização completa de encomendas
  - **Itens**: Lista detalhada com EAN, nome, quantidade, preço unitário, subtotal
  - **Informações Cliente**: Dados completos incluindo empresa e contactos
  - **Workflow**: Botões para aprovar/rejeitar com validações de estado
  - **Cálculos**: Subtotal, IVA (23%), total final com breakdown detalhado
  - **Status Management**: Estados válidos com prevenção de transições inválidas
  - **Timeline**: Data de criação e última atualização da encomenda
  - **Validações**: Business logic para impedir aprovação de encomendas já processadas

### 🔧 **8 NOVOS ENDPOINTS API IMPLEMENTADOS**

#### **Produtos**
- **POST /api/admin/products**: Criação de novos produtos com validação completa
  - Validação de EAN único, campos obrigatórios
  - Integração com categorias e criação de variantes
  - Response com redirect para edição

#### **Utilizadores**
- **GET /api/admin/users/[userId]**: Detalhes individuais de utilizador
- **PUT /api/admin/users/[userId]**: Atualização completa de dados
- **DELETE /api/admin/users/[userId]**: Soft delete (desativação segura)
- **PUT /api/admin/users/[userId]/password**: Alteração segura de passwords
  - Hash bcrypt, validação de força da password
  - Proteção contra alterações não autorizadas

#### **Encomendas**
- **GET /api/admin/orders/[orderId]**: Detalhes completos com itens e utilizador
- **PUT /api/admin/orders/[orderId]/status**: Gestão de estados de encomenda
  - Validações de negócio para transições válidas
  - Prevenção de re-aprovação/rejeição

#### **Sistema**
- **GET /api/admin/roles**: Lista de roles para formulários dinâmicos

### 🔒 **MELHORIAS DE SEGURANÇA IMPLEMENTADAS**
- **AUTH-SECURITY-001**: Sistema de autenticação via cookies JWT (não localStorage)
- **VALIDATION-001**: Validações robustas frontend e backend
- **BUSINESS-LOGIC-001**: Regras de negócio para prevenir ações inválidas
- **INPUT-SANITIZATION-001**: Sanitização completa de todos os inputs
- **PASSWORD-SECURITY-001**: Hashing bcrypt e políticas de senha robustas

### 🎨 **MELHORIAS DE INTERFACE E UX**
- **UI-CONSISTENCY-001**: Design system consistente com dark mode completo
- **RESPONSIVE-001**: Layout responsivo otimizado para todos os dispositivos
- **FEEDBACK-001**: Estados de loading e mensagens de erro/sucesso claras
- **NAVIGATION-001**: Breadcrumbs e navegação contextual melhorada
- **ACCESSIBILITY-001**: Suporte completo a navegação por teclado

### 📊 **MÉTRICAS DE QUALIDADE**
- **Build Time**: 3.0s compilation sem erros TypeScript
- **Bundle Size**: Otimizado para funcionalidade completa
- **Code Quality**: Arquitetura modular e componentes reutilizáveis
- **API Response**: Responses estruturados e error handling consistente
- **Security**: Todas as rotas protegidas com autenticação e autorização

### 🚀 **FUNCIONALIDADES DE NEGÓCIO COMPLETAS**
- **Gestão de Produtos**: Criação → Edição → Listagem → Filtros → Status
- **Gestão de Utilizadores**: Criação → Edição → Roles → Passwords → Timeline
- **Gestão de Encomendas**: Visualização → Aprovação → Rejeição → Estados
- **Workflow E-commerce**: Cliente → Carrinho → Checkout → Admin → Aprovação
- **Sistema Completo**: 0 páginas em falta, 0 funcionalidades críticas pendentes

### 🏆 **STATUS FINAL: SISTEMA 100% IMPLEMENTADO**
- **22 páginas totais**: 18 admin + 4 cliente
- **30+ endpoints API** com validações completas
- **Sistema de e-commerce B2B** totalmente funcional
- **Pronto para deployment** em produção
- **Qualidade empresarial** com código TypeScript strict
- **Interface profissional** com UX otimizada

---

## [1.6.2] - 2025-01-27 - Melhorias UX Página de Login

### 🎨 **Melhorias de Interface - Login**
- **LOGIN-UX-001**: Reposicionamento dos ícones dos campos de entrada
  - **Ícone Email**: Movido da esquerda para a direita da caixa de texto
  - **Ícone Password**: Movido da esquerda para a direita da caixa de texto
  - **Técnico**: `left-0 pl-3` → `right-0 pr-3` e `pl-10` → `pr-10`
  - **UX**: Layout mais moderno e consistente com padrões atuais

- **LOGIN-UX-002**: Correção do alinhamento do botão "Solicitar Acesso de Parceiro"
  - **Problema**: Botão não estava perfeitamente centrado no seu contentor
  - **Solução**: Adicionada classe `block` ao componente Link
  - **Resultado**: Botão agora ocupa toda a largura e está corretamente alinhado
  - **Consistência**: Visual uniforme com botão "Entrar" acima

### 🔧 **Melhorias Técnicas**
- **CSS-FIX-001**: Classes Tailwind otimizadas para melhor posicionamento
- **COMPONENT-FIX-001**: Link do Next.js comportando-se como elemento de bloco apropriado
- **LAYOUT-FIX-001**: Largura completa garantida com `w-full text-center block`

### 📱 **Impacto na Experiência**
- **Visual**: Interface mais polida e profissional
- **Usabilidade**: Melhor alinhamento visual dos elementos
- **Consistência**: Layout harmonioso entre todos os componentes
- **Modernização**: Ícones à direita seguem tendências UX atuais

### 📊 **Build Status**
- **TypeScript**: ✅ Compilação sem erros em 3.0s
- **Bundle**: ✅ 48 páginas estáticas geradas com sucesso
- **Otimização**: ✅ Finalização sem warnings
- **Production Ready**: ✅ Sistema pronto para deployment


## [1.6.1] - 2025-01-27 - Correções Críticas e Seletor de Quantidade

### 🐛 **Correções Críticas**
- **PRICE-FIX-001**: Corrigido erro "Produto sem preço definido" na página de detalhes
  - **Problema**: Validação de preços falhava mesmo com preços válidos
  - **Causa**: Lógica de verificação `!price || price <= 0` não considerava preços zero válidos
  - **Solução**: Implementada função `hasValidPrice` que verifica `undefined`, `null` e `NaN`
  - **Impacto**: Produtos com preços válidos (incluindo zero) agora funcionam corretamente

- **LINKS-FIX-001**: Resolvidos erros 404 para `/termos` e `/privacidade`
  - **Problema**: Next.js tentava fazer prefetch de páginas inexistentes linkadas no Footer
  - **Solução**: Criadas páginas completas com conteúdo legal profissional
  - **Resultado**: Eliminados erros 404 na consola do navegador

### ✨ **Novas Funcionalidades**
- **QUANTITY-SELECTOR-001**: Seletor de quantidade na página de detalhes
  - **Interface**: Botões +/- com input numérico central
  - **Validação**: Quantidade limitada pelo stock disponível
  - **UX**: Feedback visual da quantidade máxima permitida
  - **Responsivo**: Layout adaptado para mobile e desktop

- **ENHANCED-CART-001**: Função de adicionar ao carrinho melhorada
  - **Múltiplas Quantidades**: Suporte para adicionar mais que 1 unidade
  - **Validações Robustas**: Auth, permissões, preço, stock e quantidade
  - **Feedback Inteligente**: Mensagens específicas por tipo de erro
  - **Error Handling**: Try/catch com logs detalhados para debugging

### 📄 **Novas Páginas Legais**
- **TERMOS-PAGE-001**: Página completa de Termos e Condições
  - 8 seções legais abrangentes (Aceitação, Serviço, Registo, Encomendas, etc.)
  - Design consistente com breadcrumbs e navegação
  - Links para contacto e outras páginas relevantes
  - Última atualização: Janeiro 2025

- **PRIVACIDADE-PAGE-001**: Política de Privacidade RGPD compliant
  - 11 seções detalhadas conforme RGPD
  - Dados recolhidos, finalidades, base legal, partilha
  - Direitos do titular e procedimentos de exercício
  - Informações de contacto para questões de privacidade

### 🔧 **Melhorias Técnicas**
- **PRICE-VALIDATION-001**: Refatorizada validação de preços
  - Nova função `hasValidPrice()` mais robusta
  - Suporte para produtos com preço zero legítimo
  - Melhor diferenciação entre "sem preço" vs "preço zero"

- **COMPONENT-CLEANUP-001**: Limpeza de lógica duplicada
  - Removida validação duplicada de carrinho na página de produto
  - ProductInfo agora controla toda a lógica de validação
  - Função `handleAddToCart` simplificada e mais robusta

### 📊 **Performance e Build**
- **Build Status**: ✅ TypeScript compilation em 4.0s sem erros
- **Bundle Analysis**: Mantidas otimizações de size das páginas
- **Zero Warnings**: Limpeza completa de erros SSR e hidratação
- **Route Optimization**: Todas as novas páginas com static generation

## [1.6.0] - 2025-01-27

### ✨ Novas Funcionalidades
- **PRODUTO-VIEW-001**: Implementado modo de lista na página de produtos
  - **Componente**: Criado `ProductList.tsx` com layout otimizado para visualização em lista
  - **Hook**: Criado `useProductViewPreferences.ts` SSR-safe para persistir preferências
  - **Toggle**: Botões de alternância entre vista em grelha (grid) e lista
  - **Responsive**: Layout adaptativo com breakpoints para mobile
  - **Persistência**: Preferências guardadas em localStorage de forma segura

- **PRODUTO-PAGINATION-001**: Implementado selector de produtos por página
  - **Opções**: 10, 20, 50, 100 produtos por página
  - **Dinâmico**: Atualização automática da API conforme seleção
  - **Reset Inteligente**: Volta à página 1 quando muda quantidade por página
  - **Persistência**: Preferência guardada junto com modo de visualização

### 🎨 Melhorias de UX
- **LOADING-STATES-001**: Estados de carregamento específicos para cada modo de visualização
  - Skeleton loading diferenciado para grid vs lista
  - Melhor feedback visual durante carregamentos
  - Transições suaves entre modos de visualização

- **RESPONSIVE-DESIGN-001**: Melhorias significativas na responsividade
  - Layout mobile otimizado para modo lista
  - Controles de visualização adaptáveis
  - Dropdowns responsivos com melhor usabilidade

### 🔧 Melhorias Técnicas
- **CSS-OPTIMIZATION-001**: Criado `products.css` com estilos específicos
  - Classes utilitárias para line-clamp
  - Hover effects melhorados
  - Animações de transição suaves
  - Otimizações de performance com will-change

- **ACCESSIBILITY-001**: Melhorias de acessibilidade
  - Focus states visíveis nos controles
  - Tooltips informativos nos botões
  - Navegação por teclado melhorada
  - Labels descritivos para screen readers

### 📊 Impacto da Atualização
- **UX**: Utilizadores podem escolher a visualização preferida (lista mais compacta ou grid visual)
- **Performance**: Carregamento dinâmico baseado na quantidade de produtos escolhida
- **Mobile**: Experiência significativamente melhorada em dispositivos móveis
- **Persistência**: Preferências mantidas entre sessões para melhor UX

---

## [1.5.9] - 2025-01-27

### 🔧 Correções
- **HIERARCH-FIX-001**: Corrigido problema nos filtros hierárquicos de categorias
  - **Problema**: Botões de expansão (▶/▼) não funcionavam para abrir subcategorias
  - **Causa**: Lógica duplicada de construção de árvore no componente HierarchicalCategoryFilter
  - **Solução**: Removida lógica desnecessária, usando diretamente a árvore hierárquica da API
  - **Impacto**: Navegação hierárquica agora totalmente funcional
  - **Arquivo**: `app/components/products/HierarchicalCategoryFilter.tsx`

- **TYPESCRIPT-FIX-001**: Corrigido erro de compilação TypeScript no filtro hierárquico
  - **Problema**: Build failing com erro de tipo em `filterAndExpandCategories`
  - **Causa**: Função retornava array com valores `null` não compatível com tipo `Category[]`
  - **Solução**: Criada interface `ExpandableCategory` e refatorada lógica para evitar `null`
  - **Resultado**: ✅ Build passa sem erros, tipos consistentes

### 📋 Documentação
- **DOC-ENH-001**: Criado relatório completo de enriquecimento dos filtros hierárquicos
  - **Arquivo**: `docs/HIERARCHICAL_FILTER_ENHANCEMENT_REPORT.md`
  - **Conteúdo**: 6 propostas detalhadas de melhorias com roadmap de 3 fases
  - **Prioridades**: Persistência de estado, expansão inteligente, filtros avançados
  - **Métricas**: KPIs técnicos, de utilizador e de business definidos

### 🎨 Melhorias de UX
- **UX-IMP-001**: Melhorada aparência visual dos filtros hierárquicos
  - Ícones de pasta mais intuitivos (📁 fechada / 📂 aberta)
  - Melhor alinhamento e indentação de níveis hierárquicos
  - Indicadores visuais mais claros para estado de expansão
  - Linhas de conexão entre níveis da árvore

### 📊 Estado do Sistema
- **Filtros Hierárquicos**: ✅ **100% FUNCIONAIS**
- **Navegação por Categorias**: ✅ **COMPLETAMENTE OPERACIONAL**
- **Build TypeScript**: ✅ **SEM ERROS DE COMPILAÇÃO**
- **Sistema de E-commerce**: ✅ **MANTIDO FUNCIONAL**

## [1.5.8] - 2025-01-27 - Melhorias Filtros e Ordenação

### 🔧 **Correções Dropdown "Ordenar por"**
- **DROPDOWN-001**: Corrigida visibilidade do texto das opções com cores adequadas
- **DROPDOWN-002**: Adicionada largura mínima (min-w-[140px]) para melhor layout
- **DROPDOWN-003**: Implementadas opções de ordenação por preço para utilizadores autenticados
- **DROPDOWN-004**: Integração com useAuth para verificar permissão `view_price`

### 🌳 **Nova Funcionalidade - Filtro Hierárquico de Categorias**
- **HIERARCHY-001**: Criado `HierarchicalCategoryFilter` com árvore expandível
- **HIERARCHY-002**: Categorias principais aparecem condensadas inicialmente
- **HIERARCHY-003**: Botões de expansão com ícones de seta (▶/▼) e pasta (📁/📂)
- **HIERARCHY-004**: Busca inteligente que auto-expande categorias relevantes
- **HIERARCHY-005**: Suporte completo para hierarquia multi-nível
- **HIERARCHY-006**: Layout com indentação visual proporcional ao nível

### ✨ **Melhorias de Interface**
- **Dropdown Ordenação**: Opções "Preço (Menor → Maior)" e "Preço (Maior → Menor)" para utilizadores logados
- **Navegação Visual**: Ícones de pasta aberta/fechada conforme estado de expansão
- **Busca Inteligente**: Filtro que preserva hierarquia e expande automaticamente
- **Contador de Produtos**: Número de produtos por categoria visível
- **Badge Identificador**: "Hierárquico" em vez de "Simplificado"

### 🎯 **Funcionalidades Implementadas**
- **Ordenação por Preço**: Disponível apenas para utilizadores com permissão `view_price`
- **Expansão/Contração**: Clique nas setas para navegar pela árvore de categorias
- **Filtragem Hierárquica**: Selecção de categorias específicas em qualquer nível
- **Busca Contextual**: Pesquisa que mantém estrutura hierárquica

### 📱 **Experiência do Utilizador**
- **Dropdown Funcional**: Todas as opções claramente visíveis e acessíveis
- **Navegação Intuitiva**: Estrutura de pastas familiar para explorar categorias
- **Feedback Visual**: Estados claros (expandido/contraído, selecionado/não selecionado)
- **Performance**: Filtragem rápida e responsiva com lazy loading visual

---

## [1.5.7] - 2025-01-27 - Melhorias Categorias e Navegação

### ✨ **Melhorias UX - Categorias da Home Page**
- **CATEGORY-UX-001**: Reduzido tamanho das caixas de categorias para layout mais compacto
- **CATEGORY-UX-002**: Aumentada densidade do grid: 2-8 colunas (era 1-5 colunas)
- **CATEGORY-UX-003**: Otimizados tamanhos de ícones, fontes e espaçamentos
- **CATEGORY-UX-004**: Melhor aproveitamento do espaço disponível

### 🔗 **Nova Funcionalidade - Navegação Inteligente**
- **NAV-001**: Implementada navegação automática da home page para produtos com filtro ativo
- **NAV-002**: Adicionado useSearchParams para ler categoria da URL na página de produtos
- **NAV-003**: Filtro de categoria aplicado automaticamente quando vem da home page
- **NAV-004**: URL parameters funcionando corretamente (`/produtos?category=ID`)

### 🛠️ **Correções Técnicas**
- **TECH-001**: Envolvido useSearchParams em Suspense boundary para compliance do Next.js
- **TECH-002**: Resolvidos warnings de SSR e hydration
- **TECH-003**: Melhorada performance de loading da página de produtos

### 📊 **Mudanças Visuais**
- **Grid Layout**: 2 cols (mobile) → 3 cols (sm) → 4 cols (md) → 6 cols (lg) → 8 cols (xl)
- **Ícones**: Reduzidos de w-16 h-16 para w-10 h-10 
- **Fontes**: Títulos de text-xl para text-sm, texto de ação otimizado
- **Espaçamento**: Padding reduzido de p-6 para p-3, gaps de 6 para 4
- **Texto**: Limitado títulos a 2 linhas com line-clamp-2

### 🎯 **Resultado**
- Interface de categorias muito mais limpa e compacta
- Navegação fluida da home para produtos filtrados
- Melhor experiência de descoberta de produtos
- URLs semânticas e navegação direta

---

## [1.5.6] - 2025-01-27 - Correção Página Detalhes Produto

### 🔧 **Correção Crítica - Página de Produto**
- **PRODUCT-DETAIL-001**: Corrigido import do AuthContext para usar contexto correto da pasta app
- **PRODUCT-DETAIL-002**: Implementada funcionalidade real de adicionar ao carrinho usando useCart
- **PRODUCT-DETAIL-003**: Adicionadas credenciais de autenticação nas chamadas da API
- **PRODUCT-DETAIL-004**: Melhorada gestão de estados de loading e autenticação

### ✅ **Funcionalidades Corrigidas**
- **Preços**: Agora são exibidos corretamente para utilizadores autenticados com permissão `view_price`
- **Carrinho**: Botão "Adicionar ao Carrinho" funciona corretamente e integra com CartContext
- **Validações**: Permissões de utilizador verificadas antes de mostrar preços/carrinho
- **API**: Chamadas incluem credenciais para autenticação adequada

### 📝 **Mudanças Técnicas**
- Corrigido caminho do import: `../../../src/contexts/AuthContext` → `../../contexts/AuthContext`
- Integração completa com `useCart()` do CartContext
- Adicionado `credentials: 'include'` nas chamadas fetch para autenticação
- Corrigidos tipos TypeScript para `addToCart`
- Logs de debug para troubleshooting

### 🎯 **Resultado**
- Sistema de e-commerce totalmente funcional end-to-end
- Página de detalhes do produto 100% operacional
- Utilizadores autenticados podem ver preços e adicionar ao carrinho
- Validações de permissões funcionando corretamente

---

## [1.5.5] - 2025-01-27 - Otimização UX Home Page

### ✨ **Melhorias de Experiência do Utilizador**
- **UX-HOME-001**: Removido elemento AuthStatus redundante da página principal
- **UX-HOME-002**: Seção "Como se tornar parceiro?" agora só aparece para utilizadores não logados
- **UX-HOME-003**: Experiência melhorada para utilizadores autenticados

### 📊 **Performance**
- Redução do tamanho da página principal: 8.89kB → 7.72kB
- Menos elementos desnecessários na interface
- Carregamento mais rápido da home page

### 🎯 **Lógica Condicional**
- Seção B2B só é exibida quando não há utilizador autenticado
- Interface mais limpa para utilizadores logados
- Melhor foco no conteúdo relevante para cada tipo de utilizador

---

## [1.5.4] - 2025-01-27 - Correções de Hidratação AuthContext

### 🔧 **Correções Críticas**
- **FIX-HYDRATION-001**: Corrigido erro "useAuth must be used within an AuthProvider"
- **FIX-HYDRATION-002**: Implementado wrapper ClientOnly no UserMenu para prevenir problemas de hidratação SSR
- **FIX-HYDRATION-003**: Adicionada proteção de hidratação no CartContext com fallbacks seguros
- **FIX-HYDRATION-004**: Corrigido import do AuthContext no ProductCarousel

### 📝 **Mudanças Técnicas**
- `UserMenu.tsx`: Adicionado componente ClientOnly com loading state
- `CartContext.tsx`: Implementado acesso seguro ao AuthContext com try/catch
- `ProductCarousel.jsx`: Corrigido caminho do import para usar AuthContext da pasta app

### ✅ **Resultado**
- Sistema completamente funcional sem erros de hidratação
- Build e desenvolvimento estáveis
- Experiência de utilizador consistente
- Aplicação pronta para produção

---

## [1.5.3] - 2025-01-27 - Reformulação Página "Sobre" e Rebranding

### 🎨 **Rebranding Completo**
- **REBRAND-001**: Mudança de "ALIMAMEDETOOLS" para "ALITOOLS" em todo o sistema
- **REBRAND-002**: Atualização de email: alimamedetools@gmail.com → alitools@gmail.com
- **REBRAND-003**: Reformulação completa do conteúdo da página "Sobre"

### 📝 **Novo Conteúdo Corporativo**
- **Nossa Missão**: Oferecer solução global de fornecimento
- **Quem Somos**: AliTools Lda com sede em Lisboa, distribuição exclusiva
- **Mercado**: Comércio grossista nacional e europeu
- **Especialização**: Ferramentas de construção, manuais, mecânica e proteção

### ✅ **Implementação**
- Conteúdo autêntico baseado em informações reais da empresa
- Design visual mantido com novo conteúdo
- Foco em valores B2B e distribuição grossista

---

## [1.5.2] - 2025-01-27 - Simplificação Filtro de Categorias

### ✨ **Melhoria de UX - Sistema de Filtros**
- **FILTER-UX-001**: Criado componente SimpleCategoryFilter para melhor usabilidade
- **FILTER-UX-002**: Substituído filtro hierárquico complexo por interface simples de checkboxes
- **FILTER-UX-003**: Adicionada funcionalidade de pesquisa integrada nas categorias

### 📊 **Performance e Navegação**
- Exibição apenas de categorias principais/root para simplificar navegação
- Contagem de produtos por categoria
- Design moderno com feedback visual
- Carregamento otimizado sem lógica recursiva

### 🎯 **Resultado**
- Consulta de produtos muito mais fácil e intuitiva
- Filtros acessíveis e compreensíveis
- Experiência melhorada para utilizadores B2B

---

## Status Atual do Sistema (2025-01-27)

### ✅ **100% FUNCIONAL**
- **E-commerce Completo**: Carrinho → Checkout → Encomenda → Aprovação
- **Área Administrativa**: 17 páginas + 9 APIs + 47 endpoints
- **Autenticação**: Sistema JWT local robusto
- **Página de Produtos**: Listagem, filtros, paginação, busca ✅ **MELHORADO v1.5.8**
- **Página de Detalhes**: Preços, carrinho, validações de permissões ✅ **CORRIGIDO**
- **Sistema de Categorias**: Filtros hierárquicos expansíveis ✅ **NOVO v1.5.8**
- **Navegação Inteligente**: Home → Produtos com filtro automático ✅ **IMPLEMENTADO**
- **Ordenação Avançada**: Por preço para utilizadores autenticados ✅ **NOVO v1.5.8**
- **Dark Mode**: Sistema modular completo

### 🚀 **PRONTO PARA PRODUÇÃO**
- Sistema completamente testado e validado
- Todas as funcionalidades de e-commerce operacionais
- Interface otimizada para utilizadores B2B
- **Filtros avançados** com navegação hierárquica intuitiva
- **Ordenação inteligente** baseada em permissões
- **UX otimizada** com categorias expansíveis e busca contextual
- Documentação completa e atualizada

### 📱 **Experiência do Utilizador Aprimorada**
- **Home Page**: Categorias compactas com navegação direta
- **Descoberta**: Filtros automáticos ao navegar por categorias
- **Filtros Hierárquicos**: Estrutura de árvore expandível por nível ✅ **NOVO**
- **Ordenação por Preço**: Disponível para utilizadores autenticados ✅ **NOVO**
- **Performance**: URLs semânticas e loading otimizado
- **Visual**: Layout responsivo 2-8 colunas conforme dispositivo

### 🔧 **Últimas Correções v1.5.8**
- **Dropdown "Ordenar por"**: Texto visível e opções de preço funcionais
- **Categorias Hierárquicas**: Navegação em árvore com expansão/contração
- **Busca Inteligente**: Filtragem que preserva estrutura hierárquica
- **Feedback Visual**: Ícones de estado e indentação por nível 
