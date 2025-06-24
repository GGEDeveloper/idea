# Changelog - AliTools Project

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