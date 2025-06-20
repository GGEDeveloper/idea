# Índice Geral da Documentação do Projeto

Este índice serve para rápida navegação e consulta por humanos e IA. Atualize sempre que novos documentos forem criados ou movidos.

## Documentação Técnica

### Environment

- [env-doc.txt](./env-doc.txt): conteudo do .env do projeto

### Deployment e Configuração de Servidor

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md): ✅ **NOVO (25/01/2025)** Guia completo de deployment com múltiplas opções (comando único, PM2, Docker)
- [deployment/CHECKLIST_RAPIDO_ALITOOLS.md](./deployment/CHECKLIST_RAPIDO_ALITOOLS.md): ✅ **NOVO (20/06/2025)** Checklist rápido baseado em recuperação bem-sucedida
- [deployment/DEPLOYMENT_ALITOOLS_PROCEDIMENTO.md](./deployment/DEPLOYMENT_ALITOOLS_PROCEDIMENTO.md): ✅ **NOVO (20/06/2025)** Procedimento detalhado de deployment seguro
- [deployment/LICOES_APRENDIDAS_DEPLOYMENT.md](./deployment/LICOES_APRENDIDAS_DEPLOYMENT.md): ✅ **NOVO (20/06/2025)** Lições críticas de experiências anteriores de deployment

### Análise de Projeto e Status

- [PROJECT_STATUS_SUMMARY.md](./PROJECT_STATUS_SUMMARY.md): ✅ **NOVO (25/01/2025)** Resumo executivo completo do estado do projeto
- [DATABASE_REFORMULATION_PLAN.md](./DATABASE_REFORMULATION_PLAN.md): ✅ **NOVO (14/06/2025)** Plano estratégico de reformulação da base de dados

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
- [CHANGELOG.md](./CHANGELOG.md): ✅ **NOVO (18/01/2025)** Histórico de versões e alterações
- [PRODUCT_DETAIL_PAGE_STATUS.md](./PRODUCT_DETAIL_PAGE_STATUS.md): ✅ **NOVO (14/01/2025)** Status detalhado da página de produto
- [FILTERING_SYSTEM_STATUS.md](./FILTERING_SYSTEM_STATUS.md): ✅ **NOVO (14/01/2025)** Status detalhado do sistema de filtros

### Implementação e Dark Mode

- [DARK_MODE_IMPLEMENTATION_GUIDE.md](./DARK_MODE_IMPLEMENTATION_GUIDE.md): ✅ **NOVO (20/01/2025)** Guia completo de implementação do Dark Mode Modular

## Logs e Registros
- [LOG_ERROS_CONSOLIDADO.md](../LOG_ERROS_CONSOLIDADO.md): Log consolidado de erros e resoluções. **(Atualizado: 18/01/2025 - Incluída correção de filtros)**
- [LOG_PROMPTS_CONSOLIDADO.md](../LOG_PROMPTS_CONSOLIDADO.md): Log consolidado de prompts, decisões e interações.
- [LOG_CODE_CONSOLIDADO.md](../LOG_CODE_CONSOLIDADO.md): Log consolidado de implementações, atualizações e decisões técnicas. **(Atualizado: 18/01/2025 - Incluída correção de filtros)**
- `.taskmaster/logs/`: Logs detalhados das tarefas (pasta não listada no diretório atual).

### Logs de Implementação Detalhados

- [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md): ✅ **NOVO (20/01/2025)** Log de implementação do Dark Mode Modular
- [IMPLEMENTATION_LOG_2025_01_17.md](./IMPLEMENTATION_LOG_2025_01_17.md): ✅ **NOVO (17/01/2025)** Log da correção e finalização da área de administração
- [IMPLEMENTATION_LOG_v3.0.md](./IMPLEMENTATION_LOG_v3.0.md): ✅ **NOVO (18/01/2025)** Log da implementação completa da área admin v3.0

## Status Atual do Sistema (2025-01-25)

### ✅ Funcionalidades Completamente Operacionais
- **Área de Administração**: ✅ **100% FUNCIONAL** - Gestão completa de produtos e encomendas
- **Página de Produtos (`/produtos`)**: Totalmente funcional com listagem, filtros, paginação e busca
- **Sistema de Categorias**: Árvore hierárquica com nomes visíveis e navegação funcional, seleção de categorias sem erros.
- **Filtros Laterais**: **TODOS FUNCIONANDO** - Marcas, categorias (hierárquico), preço, stock e filtros rápidos.
- **Autenticação**: Sistema JWT local robusto com controle de acesso baseado em roles
- **API Backend**: Todos os endpoints principais funcionando (`/api/products`, `/api/products/filters`, `/api/admin/*`)
- **Dashboard Administrativo**: Estatísticas em tempo real e gestão completa
- **Sistema de Encomendas**: Workflow completo de aprovação/rejeição
- **Dark Mode**: Sistema modular completo implementado

### 🔧 Correções Recentes (18/01/2025)
- **FILTER-ERR-001**: Resolvido bug de filtragem hierárquica de categorias com CTE Recursiva
- **FILTER-ERR-002**: Corrigidos handlers de filtros rápidos e de marcas
- **DATA-ERR-001**: Normalizados IDs de categorias na base de dados com migração V6

### 🔧 Correções Anteriores
- **ADMIN-ERR-001**: Resolvido erro `column pv_detail.sku does not exist`
- **ADMIN-ERR-002**: Implementada paginação real substituindo placeholders
- **ADMIN-ERR-003**: Corrigida criação de produtos para nova estrutura de preços com variantes
- **ADMIN-ERR-004**: Ativadas rotas de criação de produtos anteriormente comentadas
- **FRONT-ERR-009**: Resolvido loop infinito na página de produtos
- **FRONT-ERR-010**: Resolvido problema de exibição de categorias sem nomes
- **FRONT-ERR-011**: Resolvido erro `TypeError: selectedCategories.some is not a function` no filtro de categorias.

### 🚀 Pronto para Deployment
- **Sistema de deployment**: Documentação completa e procedimentos testados
- **Configuração para dominios.pt**: Guias específicos baseados em experiências anteriores
- **Rollback procedures**: Comandos de emergência documentados

---

> **IMPORTANTE**: Consulte SEMPRE este índice e os documentos referenciados antes de tomar decisões técnicas, implementar código ou responder a prompts relevantes. O sistema está agora completamente funcional para as funcionalidades principais de e-commerce e **PRONTO PARA DEPLOYMENT SEGURO**.
