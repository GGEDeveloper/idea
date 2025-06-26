# Índice Geral da Documentação do Projeto

Este índice serve para rápida navegação e consulta por humanos e IA. Atualize sempre que novos documentos forem criados ou movidos.

## Documentação Principal

- [README.md](../README.md): ✅ **PRINCIPAL** Visão geral completa do projeto, quick start e funcionalidades

## Documentação Técnica

### Deployment e Configuração de Servidor

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md): ✅ **ATUALIZADO (25/01/2025)** Guia completo de deployment com múltiplas opções (comando único, PM2, Docker)
- [deployment/CHECKLIST_RAPIDO_ALITOOLS.md](./deployment/CHECKLIST_RAPIDO_ALITOOLS.md): ✅ **ATUALIZADO (27/01/2025)** Checklist rápido baseado em recuperação bem-sucedida
- [deployment/DEPLOYMENT_ALITOOLS_PROCEDIMENTO.md](./deployment/DEPLOYMENT_ALITOOLS_PROCEDIMENTO.md): ✅ **ATUALIZADO (27/01/2025)** Procedimento detalhado de deployment seguro
- [deployment/LICOES_APRENDIDAS_DEPLOYMENT.md](./deployment/LICOES_APRENDIDAS_DEPLOYMENT.md): ✅ **ATUALIZADO (27/01/2025)** Lições críticas de experiências anteriores de deployment

### Análise de Projeto e Status

- [PROJECT_STATUS_SUMMARY.md](./PROJECT_STATUS_SUMMARY.md): ✅ **ATUALIZADO (27/01/2025)** Resumo executivo completo do estado do projeto v1.6.2
- [ROLES_AUTHORIZATION_COMPLETE_REPORT.md](./ROLES_AUTHORIZATION_COMPLETE_REPORT.md): ✅ **ATUALIZADO (27/01/2025)** Relatório completo do sistema de roles e autorizações - 7 APIs admin quebradas identificadas e RESOLVIDAS (100% funcionais)
- [ADMIN_APIS_URGENT_FIXES_LOG.md](./ADMIN_APIS_URGENT_FIXES_LOG.md): ✅ **ATUALIZADO (27/01/2025)** Log de correções urgentes - 7 APIs admin corrigidas e 100% funcionais
- [DOCUMENTATION_UPDATE_LOG.md](./DOCUMENTATION_UPDATE_LOG.md): ✅ **ATUALIZADO (27/01/2025)** Log de atualizações de documentação - remoção de info desatualizada/redundante
- [DATABASE_REFORMULATION_PLAN.md](./DATABASE_REFORMULATION_PLAN.md): ✅ **ATUALIZADO (27/01/2025)** Plano estratégico de reformulação da base de dados
- [FEATURES_COMPLETE_REFERENCE.md](./FEATURES_COMPLETE_REFERENCE.md): ✅ **ATUALIZADO (27/01/2025)** Referência completa de todas as funcionalidades implementadas

### Sistema de Filtragem e UX

- [HIERARCHICAL_FILTER_ENHANCEMENT_REPORT.md](./HIERARCHICAL_FILTER_ENHANCEMENT_REPORT.md): ✅ **ATUALIZADO (27/01/2025)** Relatório completo de melhorias para sistema de filtros hierárquicos
- [FILTERING_SYSTEM_STATUS.md](./FILTERING_SYSTEM_STATUS.md): ✅ **ATUALIZADO (14/01/2025)** Status detalhado do sistema de filtros
- [SIMPLIFIED_CATEGORY_FILTER_IMPLEMENTATION.md](./SIMPLIFIED_CATEGORY_FILTER_IMPLEMENTATION.md): ✅ **ATUALIZADO (27/01/2025)** Implementação do filtro simplificado de categorias para melhor UX

### Sistema de Preços e Configuração

- [PRICING_CONFIGURATION_SUMMARY.md](./PRICING_CONFIGURATION_SUMMARY.md): ✅ **ATUALIZADO (17/01/2025)** Sistema de configuração de margem base
- [PRICING_SAVE_BUTTON_IMPLEMENTATION.md](./PRICING_SAVE_BUTTON_IMPLEMENTATION.md): ✅ **ATUALIZADO (17/01/2025)** Implementação do botão guardar para configurações de preços

### Mapeamento de Dados (XML para Base de Dados)
- [map_products.md](./data_mapping/map_products.md): Mapeamento para a tabela `Products`.
- [map_categories.md](./data_mapping/map_categories.md): Mapeamento para a tabela `Categories` (atualizado para incluir contagem de produtos).
- [map_product_categories.md](./data_mapping/map_product_categories.md): Mapeamento para a tabela de junção `ProductCategories`.
- [map_units.md](./data_mapping/map_units.md): Mapeamento para a tabela `Units`.
- [map_variants_stock.md](./data_mapping/map_variants_stock.md): Mapeamento para as tabelas `ProductVariants` e `StockEntries`.
- [map_prices.md](./data_mapping/map_prices.md): Mapeamento para a tabela `Prices`.
- [map_images.md](./data_mapping/map_images.md): Mapeamento para a tabela `ProductImages`.
- [master_mapping.md](./data_mapping/master_mapping.md): ✅ **MASTER** Documento fonte de verdade para mapeamento XML Geko

### Análise XML e Integração

- [geko_xml_structure_analysis.md](./geko_xml_structure_analysis.md): ✅ **ATUALIZADO (14/01/2025)** Análise detalhada da estrutura XML Geko para integração

### Outros Documentos Técnicos
- [ESTRUTURA_TECNOLOGICA_PROJETO.md](./ESTRUTURA_TECNOLOGICA_PROJETO.md): Stack tecnológico, versões, dependências.
- [ANALISE_TECNICA_XML_GEKO.md](./ANALISE_TECNICA_XML_GEKO.md): Análise técnica completa do XML Geko.
- [MEMORIA_DESCRITIVA_SITE.md](./MEMORIA_DESCRITIVA_SITE.md): Memória descritiva de todas as páginas, áreas e funcionalidades do site.
- [RASCUNHO_ESTRUTURA_PROJETO.md](./RASCUNHO_ESTRUTURA_PROJETO.md): Roadmap e estrutura macro do projeto.
- [RASCUNHO_RULES_PROJETO.md](./RASCUNHO_RULES_PROJETO.md): Regras e políticas do projeto.
- [database_schema.sql](./database_schema.sql): ✅ **ATUALIZADO (25/01/2025)** Schema real da base de dados baseado em inspeção (23 tabelas, 87.839 registos)
- [DATABASE_ANALYSIS_REPORT.md](./DATABASE_ANALYSIS_REPORT.md): ✅ **ATUALIZADO (25/01/2025)** Relatório completo - Sistema 100% funcional, problemas são otimizações opcionais
- [EAN_PRIMARY_KEY_ANALYSIS.md](./EAN_PRIMARY_KEY_ANALYSIS.md): ✅ **ATUALIZADO (25/01/2025)** Análise EAN vs PKs artificiais - Sistema funcional, migração opcional
- [EAN_CONSISTENCY_REPORT.md](./EAN_CONSISTENCY_REPORT.md): ✅ **ATUALIZADO (25/01/2025)** Consistência EAN confirmada - Stock funciona via product_variants
- [SCHEMA_DISCREPANCY_REPORT.md](./SCHEMA_DISCREPANCY_REPORT.md): ✅ **ATUALIZADO (25/01/2025)** Comparação documentado vs real - Schema real é superior
- [data_import_sync_plan.md](./data_import_sync_plan.md): Estratégia e plano para importação e sincronização de dados do feed XML Geko.
- [FLUXO_DADOS_ARQUITETURA.md](./FLUXO_DADOS_ARQUITETURA.md): Fluxo de dados e arquitetura do sistema.
- [FRONTEND_CATEGORIES_IMPLEMENTATION.md](./FRONTEND_CATEGORIES_IMPLEMENTATION.md): Detalhes de implementação das categorias no frontend. **(Atualizado: árvore de categorias baseada em path, estrutura esperada e exemplos)**
- [ADMIN_AREA_IMPLEMENTATION_STATUS.md](./ADMIN_AREA_IMPLEMENTATION_STATUS.md): ✅ **ATUALIZADO (17/01/2025)** Status completo da área de administração - 100% funcional
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md): ✅ **ATUALIZADO (18/01/2025)** Log detalhado de desenvolvimento e correções
- [CHANGELOG.md](./CHANGELOG.md): ✅ **ATUALIZADO (27/01/2025)** Histórico de versões e alterações - v1.6.2
- [PRODUCT_DETAIL_PAGE_STATUS.md](./PRODUCT_DETAIL_PAGE_STATUS.md): ✅ **ATUALIZADO (14/01/2025)** Status detalhado da página de produto

### Implementação e Dark Mode

- [DARK_MODE_IMPLEMENTATION_GUIDE.md](./DARK_MODE_IMPLEMENTATION_GUIDE.md): ✅ **ATUALIZADO (20/01/2025)** Guia completo de implementação do Dark Mode Modular
- [CHECKOUT_SYSTEM_IMPLEMENTATION.md](./CHECKOUT_SYSTEM_IMPLEMENTATION.md): ✅ **ATUALIZADO (27/01/2025)** Documentação completa do sistema de checkout e e-commerce implementado
- [LOGOUT_CART_FIX_IMPLEMENTATION.md](./LOGOUT_CART_FIX_IMPLEMENTATION.md): ✅ **ATUALIZADO (27/01/2025)** Correção crítica do sistema de logout e gestão de carrinho
- [ABOUT_PAGE_REBRANDING_IMPLEMENTATION.md](./ABOUT_PAGE_REBRANDING_IMPLEMENTATION.md): ✅ **ATUALIZADO (27/01/2025)** Reformulação completa da página "Sobre" com rebranding AliTools

## Logs e Registros
- [LOG_ERROS_CONSOLIDADO.md](../LOG_ERROS_CONSOLIDADO.md): Log consolidado de erros e resoluções. **(Atualizado: 18/01/2025 - Incluída correção de filtros)**
- [LOG_PROMPTS_CONSOLIDADO.md](../LOG_PROMPTS_CONSOLIDADO.md): Log consolidado de prompts, decisões e interações.
- [LOG_CODE_CONSOLIDADO.md](../LOG_CODE_CONSOLIDADO.md): Log consolidado de implementações, atualizações e decisões técnicas. **(Atualizado: 18/01/2025 - Incluída correção de filtros)**
- `.taskmaster/logs/`: Logs detalhados das tarefas (pasta não listada no diretório atual).

### Logs de Implementação Detalhados

- [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md): ✅ **ATUALIZADO (20/01/2025)** Log de implementação do Dark Mode Modular
- [IMPLEMENTATION_LOG_2025_01_17.md](./IMPLEMENTATION_LOG_2025_01_17.md): ✅ **ATUALIZADO (17/01/2025)** Log da correção e finalização da área de administração
- [IMPLEMENTATION_LOG_v3.0.md](./IMPLEMENTATION_LOG_v3.0.md): ✅ **ATUALIZADO (18/01/2025)** Log da implementação completa da área admin v3.0

## Status Atual do Sistema (2025-01-28 - v1.9.1)

### ✅ Funcionalidades Completamente Operacionais
- **Área de Administração**: ✅ **100% FUNCIONAL** - Gestão completa de produtos, encomendas e carrinhos
- **Sistema de E-commerce Completo**: ✅ **100% FUNCIONAL** - Carrinho → Checkout → Encomenda → Aprovação
- **Browsing Avançado de Produtos**: ✅ **100% FUNCIONAL** - Modo grid/lista com paginação dinâmica
- **Filtros Hierárquicos**: ✅ **100% FUNCIONAIS** - Navegação expandível em árvore com busca inteligente
- **Página de Produtos (`/produtos`)**: Totalmente funcional com listagem, filtros, paginação e busca
- **Sistema de Categorias**: Árvore hierárquica com nomes visíveis, navegação funcional e expansão/colapso
- **Filtros Laterais**: **TODOS FUNCIONANDO** - Marcas, categorias (hierárquico), preço, stock e filtros rápidos
- **Gestão de Carrinho**: ✅ **100% FUNCIONAL** - LocalStorage + API, hidratação, validações
- **Sistema de Checkout**: ✅ **100% FUNCIONAL** - Formulário completo, validações, criação de encomendas
- **Autenticação**: Sistema JWT local robusto com controle de acesso baseado em roles
- **API Backend**: Todos os endpoints principais funcionando (`/api/products`, `/api/cart`, `/api/orders`, `/api/admin/*`)
- **Dashboard Administrativo**: Estatísticas em tempo real e gestão completa
- **Sistema de Encomendas**: Workflow completo de aprovação/rejeição
- **Dark Mode**: Sistema modular completo implementado

### 🆕 Funcionalidades Mais Recentes (v1.9.1 - 28/01/2025)

### 🐛 **Correção Crítica 404 - Página Detalhes Encomenda Cliente (v1.9.1)**
- **PROBLEMA RESOLVIDO**: Cliente não conseguia aceder `/encomenda/[orderId]` (404 error)
- **CLIENT-ORDER-DETAIL-001**: Página completa de detalhes de encomenda para clientes
  - **Arquivo**: `app/encomenda/[orderId]/page.tsx`
  - **Autenticação**: Verificação JWT obrigatória com redirect para login
  - **Segurança**: Cliente só vê suas próprias encomendas
  - **Interface Rica**: 11 estados com progress bars, layout profissional
  - **Mobile-First**: Experiência otimizada para todos dispositivos
  - **Dark Mode**: Compatibilidade total com tema escuro
- **API-ENDPOINT-001**: Endpoint seguro para clientes `/api/orders/[orderId]`
  - **Arquivo**: `app/api/orders/[orderId]/route.ts`
  - **JWT Verification**: Token via cookie `idea_session_token`
  - **User Isolation**: WHERE user_id = authenticated_user
  - **UUID Validation**: Formato orderId validado
  - **Error Handling**: 401/404/500 responses apropriados
- **INTERFACE DETALHADA**:
  - **Progress Tracking**: Barra de progresso 0-100% baseada no estado
  - **Status Visual**: Cores e ícones específicos para cada estado
  - **Ordem Items**: Lista completa com cálculos de subtotais
  - **Cliente Info**: Dados pessoais, empresa, histórico de encomenda
  - **Help Section**: Link direto para contacto/suporte
  - **Breadcrumbs**: Navegação de volta para "Minhas Encomendas"
- **11 ESTADOS SUPORTADOS**: Aguardando Aprovação → Aprovada → Em Processamento → Pronta para Envio → Enviada → Em Rota → Saiu para Entrega → Entregue + estados de cancelamento/devolução
- **BUILD STATUS**: ✅ Compilação TypeScript sem erros em 4.0s
- **RESULTADO**: ✅ 404 Error completamente resolvido, URL `/encomenda/[orderId]` totalmente funcional

### 🎨 **Sistema de Ícones SVG Profissional (v1.9.0)**
- **ICON-SYSTEM-001**: Implementado sistema completo de ícones SVG para categorias
  - **24 Ícones Profissionais**: SVGs específicos para cada categoria real da base de dados
  - **Mapeamento Inteligente**: Algoritmo com match exato + keywords + fallback
  - **Componente CategoryIcon**: React component reutilizável com error handling
  - **Localização**: `public/icons/categories/` com estrutura organizada
  - **Categorias Mapeadas**: Welding, Power Tools, Garden, Safety, Pneumatics, Construction, etc.
  - **Keywords Inteligentes**: 100+ termos mapeados (drill→power_tools, safety→health_and_safety)
  - **Fallback Robusto**: `general_mechanic_tools.svg` como padrão para categorias não mapeadas
- **VISUAL-ENHANCEMENT-001**: Substituição completa de ícones FontAwesome por SVGs específicos
  - **Home Page**: Ícones CategoryIcon com filtros CSS para contraste
  - **Página Categorias**: Layout atualizado com categorias e contadores realistas
  - **UX Melhorada**: Reconhecimento visual imediato de cada tipo de categoria
  - **Design Profissional**: Interface mais polida e empresarial
- **BUILD-OPTIMIZATION-001**: Correção de duplicações TypeScript
  - **Problema**: Chaves duplicadas 'electric' e 'heater' no keywordMap
  - **Solução**: Limpeza de conflitos mantendo lógica de prioridade
  - **Resultado**: ✅ Build limpo em 3.0s sem erros

### 🔧 **Correções Finais UX (v1.8.1)**
- **HEADER-FIX-001**: Remoção de botão dark mode duplicado no header desktop
- **MOBILE-CART-001**: Correção do dropdown carrinho cortado em mobile
  - **Largura Responsiva**: `w-80 sm:w-96` adaptável por dispositivo
  - **Margem Inteligente**: `mr-2 sm:mr-0` evita cortes nas bordas
  - **MaxWidth Dinâmica**: `calc(100vw - 1rem)` garante visibilidade total
- **Build Perfect**: ✅ Compilação TypeScript sem erros em 4.0s
- **Sistema 100% Pronto**: Interface polida para deployment em produção

### 🎨 **Melhorias UX - Login Page (v1.6.2)**
- **LOGIN-UX-IMPROVEMENTS**: Melhorias na página de login
  - **Ícones Repositionados**: Email e password com ícones do lado direito (padrão moderno)
  - **Botão Centrado**: "Solicitar Acesso de Parceiro" perfeitamente alinhado
  - **Interface Polida**: Layout mais profissional e consistente
  - **Build Validado**: ✅ Compilação TypeScript sem erros em 3.0s

### ✨ **Funcionalidades v1.6.1**
- **QUANTITY-SELECTOR-001**: Seletor de quantidade na página de detalhes de produtos
- **PRICE-VALIDATION-FIX**: Correção crítica da validação de preços (incluindo preços zero)
- **LEGAL-PAGES-001**: Páginas completas de Termos e Condições + Política de Privacidade GDPR
- **ERROR-ELIMINATION-001**: Eliminação de todos os erros 404 do Footer (termos/privacidade)
- **ENHANCED-CART-001**: Melhorias na função de adicionar ao carrinho com validações robustas

### 🆕 Funcionalidades v1.6.0
- **PRODUTO-VIEW-001**: Sistema completo de modo lista + grid com toggle visual
- **PRODUTO-PAGINATION-001**: Selector dinâmico de produtos por página (10, 20, 50, 100)
- **SSR-PREFERENCES-001**: Hook SSR-safe para persistência de preferências de utilizador
- **RESPONSIVE-UX-001**: Layout adaptativo otimizado para mobile em ambos os modos
- **PERFORMANCE-001**: CSS will-change optimization + skeleton loading específico por modo

### 🔧 Correções Recentes (v1.6.1 - 27/01/2025)
- **PRICE-FIX-001**: Corrigido erro "Produto sem preço definido" com nova validação `hasValidPrice()`
- **LINKS-FIX-001**: Resolvidos erros 404 para `/termos` e `/privacidade` com páginas completas
- **VALIDATION-FIX-001**: Melhorada validação de preços para suportar produtos com preço zero
- **CART-ENHANCEMENT-001**: Função de carrinho melhorada com validações auth/permissões/stock

### 🔧 Correções Anteriores (v1.6.0)
- **HIERARCH-FIX-001**: Resolvido problema de botões de expansão nos filtros hierárquicos
- **AUTH-HYDRATION-001**: Corrigidos problemas de hidratação SSR em componentes de autenticação
- **SORT-DROPDOWN-001**: Melhorado dropdown de ordenação com opções de preço para utilizadores autenticados

### 🔧 Correções Anteriores
- **FILTER-ERR-001**: Resolvido bug de filtragem hierárquica de categorias com CTE Recursiva
- **FILTER-ERR-002**: Corrigidos handlers de filtros rápidos e de marcas
- **DATA-ERR-001**: Normalizados IDs de categorias na base de dados com migração V6
- **ADMIN-ERR-001**: Resolvido erro `column pv_detail.sku does not exist`
- **ADMIN-ERR-002**: Implementada paginação real substituindo placeholders
- **ADMIN-ERR-003**: Corrigida criação de produtos para nova estrutura de preços com variantes
- **ADMIN-ERR-004**: Ativadas rotas de criação de produtos anteriormente comentadas
- **FRONT-ERR-009**: Resolvido loop infinito na página de produtos
- **FRONT-ERR-010**: Resolvido problema de exibição de categorias sem nomes
- **FRONT-ERR-011**: Resolvido erro `TypeError: selectedCategories.some is not a function` no filtro de categorias.

### 🚀 Roadmap de Melhorias Definido
- **PHASE-1**: Persistência de estado + Expansão inteligente (1-2 semanas)
- **PHASE-2**: Filtros avançados + Performance + Acessibilidade (2-4 semanas)
- **PHASE-3**: Analytics + Sugestões IA + Otimizações avançadas (1-3 meses)

### 🚀 Pronto para Deployment
- **Sistema de deployment**: Documentação completa e procedimentos testados
- **Configuração para dominios.pt**: Guias específicos baseados em experiências anteriores
- **Rollback procedures**: Comandos de emergência documentados
- **E-commerce completo**: Todo o workflow implementado e testado
- **Build System**: TypeScript compilation 100% successful

### Scripts de Manutenção

- [cleanup-unused-tables.sql](../scripts/cleanup-unused-tables.sql): ✅ **ATUALIZADO (25/01/2025)** Script seguro para remover código morto e otimizar performance

---

> **IMPORTANTE**: Consulte SEMPRE este índice e os documentos referenciados antes de tomar decisões técnicas, implementar código ou responder a prompts relevantes. O sistema está agora **COMPLETAMENTE FUNCIONAL** para todas as funcionalidades de e-commerce B2B, incluindo **filtros hierárquicos totalmente operacionais**, e **PRONTO PARA DEPLOYMENT SEGURO**. A versão v1.6.2 inclui melhorias significativas de UX e um roadmap detalhado para futuras implementações. Implementação inclui carrinho, checkout, gestão de encomendas, aprovação administrativa e navegação hierárquica avançada - um workflow completo de e-commerce B2B moderno.
