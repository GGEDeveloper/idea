# Índice Geral da Documentação do Projeto

Este índice serve para rápida navegação e consulta por humanos e IA. Atualize sempre que novos documentos forem criados ou movidos.

## Documentação Técnica

### Mapeamento de Dados (XML para Base de Dados)
- [`docs/data_mapping/map_products.md`](./data_mapping/map_products.md): Mapeamento para a tabela `Products`.
- [`docs/data_mapping/map_categories.md`](./data_mapping/map_categories.md): Mapeamento para a tabela `Categories` (atualizado para incluir contagem de produtos).
- [`docs/data_mapping/map_product_categories.md`](./data_mapping/map_product_categories.md): Mapeamento para a tabela de junção `ProductCategories`.
- [`docs/data_mapping/map_units.md`](./data_mapping/map_units.md): Mapeamento para a tabela `Units`.
- [`docs/data_mapping/map_variants_stock.md`](./data_mapping/map_variants_stock.md): Mapeamento para as tabelas `ProductVariants` e `StockEntries`.
- [`docs/data_mapping/map_prices.md`](./data_mapping/map_prices.md): Mapeamento para a tabela `Prices`.
- [`docs/data_mapping/map_images.md`](./data_mapping/map_images.md): Mapeamento para a tabela `ProductImages`.

### Outros Documentos Técnicos
- [ESTRUTURA_TECNOLOGICA_PROJETO.md](./ESTRUTURA_TECNOLOGICA_PROJETO.md): Stack tecnológico, versões, dependências.
- [ANALISE_TECNICA_XML_GEKO.md](./ANALISE_TECNICA_XML_GEKO.md): Análise técnica completa do XML Geko.
- [MEMORIA_DESCRITIVA_SITE.md](./MEMORIA_DESCRITIVA_SITE.md): Memória descritiva de todas as páginas, áreas e funcionalidades do site.
- [RASCUNHO_ESTRUTURA_PROJETO.md](./RASCUNHO_ESTRUTURA_PROJETO.md): Roadmap e estrutura macro do projeto.
- [RASCUNHO_RULES_PROJETO.md](./RASCUNHO_RULES_PROJETO.md): Regras e políticas do projeto.
- [Database Schema](./database_schema.md): Detailed specification of the database tables, columns, relationships, and data sources for the Geko product catalog.
- [Data Import and Synchronization Plan](./data_import_sync_plan.md): Strategy and plan for importing and synchronizing product data from the Geko XML feed.

## Logs e Registros
- [LOG_ERROS.md](./LOG_ERROS.md): Log de erros e resoluções.
- [LOG_PROMPTS.md](./LOG_PROMPTS.md): Log de prompts, decisões e interações.
- [LOG_CODE.md](./LOG_CODE.md): Log de implementações, atualizações e decisões técnicas.
- [.taskmaster/logs/](./.taskmaster/logs/): Logs detalhados das tarefas (incluindo tarefa_002).

---

> Consulte SEMPRE este índice e os documentos referenciados antes de tomar decisões técnicas, implementar código ou responder a prompts relevantes.
