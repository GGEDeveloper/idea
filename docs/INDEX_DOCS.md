# Índice Geral da Documentação do Projeto

Este índice serve para rápida navegação e consulta por humanos e IA. Atualize sempre que novos documentos forem criados ou movidos.

## Documentação Principal

- [README.md](../README.md): ✅ **PRINCIPAL** Visão geral completa do projeto, quick start e funcionalidades

## Documentação Técnica

### Environment

- [env-doc.txt](./env-doc.txt): conteudo do .env do projeto

### Deployment e Configuração de Servidor

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md): ✅ **NOVO (25/01/2025)** Guia completo de deployment com múltiplas opções (comando único, PM2, Docker)
- [deployment/CHECKLIST_RAPIDO_ALITOOLS.md](./deployment/CHECKLIST_RAPIDO_ALITOOLS.md): ✅ **NOVO (20/06/2025)** Checklist rápido baseado em recuperação bem-sucedida
- [deployment/DEPLOYMENT_ALITOOLS_PROCEDIMENTO.md](./deployment/DEPLOYMENT_ALITOOLS_PROCEDIMENTO.md): ✅ **NOVO (20/06/2025)** Procedimento detalhado de deployment seguro
- [deployment/LICOES_APRENDIDAS_DEPLOYMENT.md](./deployment/LICOES_APRENDIDAS_DEPLOYMENT.md): ✅ **NOVO (20/06/2025)** Lições críticas de experiências anteriores de deployment

### Análise de Projeto e Status

- [PROJECT_STATUS_SUMMARY.md](./PROJECT_STATUS_SUMMARY.md): ✅ **ATUALIZADO (27/01/2025)** Resumo executivo completo do estado do projeto v1.5.9
- [DATABASE_REFORMULATION_PLAN.md](./DATABASE_REFORMULATION_PLAN.md): ✅ **NOVO (14/06/2025)** Plano estratégico de reformulação da base de dados
- [FEATURES_COMPLETE_REFERENCE.md](./FEATURES_COMPLETE_REFERENCE.md): ✅ **NOVO (27/01/2025)** Referência completa de todas as funcionalidades implementadas

### Sistema de Filtragem e UX

- [HIERARCHICAL_FILTER_ENHANCEMENT_REPORT.md](./HIERARCHICAL_FILTER_ENHANCEMENT_REPORT.md): ✅ **NOVO (27/01/2025)** Relatório completo de melhorias para sistema de filtros hierárquicos
- [FILTERING_SYSTEM_STATUS.md](./FILTERING_SYSTEM_STATUS.md): ✅ **NOVO (14/01/2025)** Status detalhado do sistema de filtros
- [SIMPLIFIED_CATEGORY_FILTER_IMPLEMENTATION.md](./SIMPLIFIED_CATEGORY_FILTER_IMPLEMENTATION.md): ✅ **NOVO (27/01/2025)** Implementação do filtro simplificado de categorias para melhor UX

### Sistema de Preços e Configuração

- [PRICING_CONFIGURATION_SUMMARY.md](./PRICING_CONFIGURATION_SUMMARY.md): ✅ **NOVO (17/01/2025)** Sistema de configuração de margem base
- [PRICING_SAVE_BUTTON_IMPLEMENTATION.md](./PRICING_SAVE_BUTTON_IMPLEMENTATION.md): ✅ **NOVO (17/01/2025)** Implementação do botão guardar para configurações de preços

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

- [geko_xml_structure_analysis.md](./geko_xml_structure_analysis.md): ✅ **NOVO (14/06/2025)** Análise detalhada da estrutura XML Geko para integração

### Outros Documentos Técnicos
- [ESTRUTURA_TECNOLOGICA_PROJETO.md](./ESTRUTURA_TECNOLOGICA_PROJETO.md): Stack tecnológico, versões, dependências.
- [ANALISE_TECNICA_XML_GEKO.md](./ANALISE_TECNICA_XML_GEKO.md): Análise técnica completa do XML Geko.
- [MEMORIA_DESCRITIVA_SITE.md](./MEMORIA_DESCRITIVA_SITE.md): Memória descritiva de todas as páginas, áreas e funcionalidades do site.
- [RASCUNHO_ESTRUTURA_PROJETO.md](./RASCUNHO_ESTRUTURA_PROJETO.md): Roadmap e estrutura macro do projeto.
- [RASCUNHO_RULES_PROJETO.md](./RASCUNHO_RULES_PROJETO.md): Regras e políticas do projeto.
- [database_schema.sql](./database_schema.sql): Especificação detalhada das tabelas, colunas e relacionamentos do banco de dados. **(Atualizado: árvore de categorias baseada em path, ver comentários no início do arquivo)**
- [data_import_sync_plan.md](./data_import_sync_plan.md): Estratégia e plano para importação e sincronização de dados do feed XML Geko.
- [FLUXO_DADOS_ARQUITETURA.md](./FLUXO_DADOS_ARQUITETURA.md): Fluxo de dados e arquitetura do sistema.
- [FRONTEND_CATEGORIES_IMPLEMENTATION.md](./FRONTEND_CATEGORIES_IMPLEMENTATION.md): Detalhes de implementação das categorias no frontend. **(Atualizado: árvore de categorias baseada em path, estrutura esperada e exemplos)**
- [ADMIN_AREA_IMPLEMENTATION_STATUS.md](./ADMIN_AREA_IMPLEMENTATION_STATUS.md): ✅ **NOVO (17/01/2025)** Status completo da área de administração - 100% funcional
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md): ✅ **NOVO (18/01/2025)** Log detalhado de desenvolvimento e correções
- [CHANGELOG.md](./CHANGELOG.md): ✅ **ATUALIZADO (27/01/2025)** Histórico de versões e alterações - v1.5.9
- [PRODUCT_DETAIL_PAGE_STATUS.md](./PRODUCT_DETAIL_PAGE_STATUS.md): ✅ **NOVO (14/01/2025)** Status detalhado da página de produto

### Implementação e Dark Mode

- [DARK_MODE_IMPLEMENTATION_GUIDE.md](./DARK_MODE_IMPLEMENTATION_GUIDE.md): ✅ **NOVO (20/01/2025)** Guia completo de implementação do Dark Mode Modular
- [CHECKOUT_SYSTEM_IMPLEMENTATION.md](./CHECKOUT_SYSTEM_IMPLEMENTATION.md): ✅ **NOVO (27/01/2025)** Documentação completa do sistema de checkout e e-commerce implementado
- [LOGOUT_CART_FIX_IMPLEMENTATION.md](./LOGOUT_CART_FIX_IMPLEMENTATION.md): ✅ **NOVO (27/01/2025)** Correção crítica do sistema de logout e gestão de carrinho
- [ABOUT_PAGE_REBRANDING_IMPLEMENTATION.md](./ABOUT_PAGE_REBRANDING_IMPLEMENTATION.md): ✅ **NOVO (27/01/2025)** Reformulação completa da página "Sobre" com rebranding AliTools

## Logs e Registros
- [LOG_ERROS_CONSOLIDADO.md](../LOG_ERROS_CONSOLIDADO.md): Log consolidado de erros e resoluções. **(Atualizado: 18/01/2025 - Incluída correção de filtros)**
- [LOG_PROMPTS_CONSOLIDADO.md](../LOG_PROMPTS_CONSOLIDADO.md): Log consolidado de prompts, decisões e interações.
- [LOG_CODE_CONSOLIDADO.md](../LOG_CODE_CONSOLIDADO.md): Log consolidado de implementações, atualizações e decisões técnicas. **(Atualizado: 18/01/2025 - Incluída correção de filtros)**
- `.taskmaster/logs/`: Logs detalhados das tarefas (pasta não listada no diretório atual).

### Logs de Implementação Detalhados

- [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md): ✅ **NOVO (20/01/2025)** Log de implementação do Dark Mode Modular
- [IMPLEMENTATION_LOG_2025_01_17.md](./IMPLEMENTATION_LOG_2025_01_17.md): ✅ **NOVO (17/01/2025)** Log da correção e finalização da área de administração
- [IMPLEMENTATION_LOG_v3.0.md](./IMPLEMENTATION_LOG_v3.0.md): ✅ **NOVO (18/01/2025)** Log da implementação completa da área admin v3.0

## Status Atual do Sistema (2025-01-27 - v1.6.1)

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

### 🆕 Funcionalidades Recentes (v1.6.1 - 27/01/2025)
- **QUANTITY-SELECTOR-001**: Seletor de quantidade na página de detalhes de produtos
- **PRICE-VALIDATION-FIX**: Correção crítica da validação de preços (incluindo preços zero)
- **LEGAL-PAGES-001**: Páginas completas de Termos e Condições + Política de Privacidade GDPR
- **ERROR-ELIMINATION-001**: Eliminação de todos os erros 404 do Footer (termos/privacidade)
- **ENHANCED-CART-001**: Melhorias na função de adicionar ao carrinho com validações robustas

### 🆕 Funcionalidades Anteriores (v1.6.0)
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

---

> **IMPORTANTE**: Consulte SEMPRE este índice e os documentos referenciados antes de tomar decisões técnicas, implementar código ou responder a prompts relevantes. O sistema está agora **COMPLETAMENTE FUNCIONAL** para todas as funcionalidades de e-commerce B2B, incluindo **filtros hierárquicos totalmente operacionais**, e **PRONTO PARA DEPLOYMENT SEGURO**. A versão v1.5.9 inclui melhorias significativas de UX e um roadmap detalhado para futuras implementações. Implementação inclui carrinho, checkout, gestão de encomendas, aprovação administrativa e navegação hierárquica avançada - um workflow completo de e-commerce B2B moderno.
