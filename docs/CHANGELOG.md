# Changelog - AliTools Project

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
- **Página de Produtos**: Listagem, filtros, paginação, busca
- **Página de Detalhes**: Preços, carrinho, validações de permissões ✅ **CORRIGIDO**
- **Sistema de Categorias**: Filtros simplificados e navegação otimizada ✅ **MELHORADO**
- **Navegação Inteligente**: Home → Produtos com filtro automático ✅ **NOVO**
- **Dark Mode**: Sistema modular completo

### 🚀 **PRONTO PARA PRODUÇÃO**
- Sistema completamente testado e validado
- Todas as funcionalidades de e-commerce operacionais
- Interface otimizada para utilizadores B2B
- **Navegação intuitiva** e descoberta de produtos melhorada
- **UX otimizada** com categorias compactas e visuais
- Documentação completa e atualizada

### 📱 **Experiência do Utilizador Aprimorada**
- **Home Page**: Categorias compactas com navegação direta
- **Descoberta**: Filtros automáticos ao navegar por categorias
- **Performance**: URLs semânticas e loading otimizado
- **Visual**: Layout responsivo 2-8 colunas conforme dispositivo 