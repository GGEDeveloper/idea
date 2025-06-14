# Índice Geral da Documentação do Projeto

Este índice serve para rápida navegação e consulta por humanos e IA. Atualize sempre que novos documentos forem criados ou movidos.

## Documentação Técnica

### Environment

- [env-doc.txt](./env-doc.txt): conteudo do .env do projeto

### Mapeamento de Dados (XML para Base de Dados)
- [map_products.md](./data_mapping/map_products.md): Mapeamento para a tabela `Products`.
- [map_categories.md](./data_mapping/map_categories.md): Mapeamento para a tabela `Categories` (atualizado para incluir contagem de produtos).
- [map_product_categories.md](./data_mapping/map_product_categories.md): Mapeamento para a tabela de junção `ProductCategories`.
- [map_units.md](./data_mapping/map_units.md): Mapeamento para a tabela `Units`.
- [map_variants_stock.md](./data_mapping/map_variants_stock.md): Mapeamento para as tabelas `ProductVariants` e `StockEntries`.
- [map_prices.md](./data_mapping/map_prices.md): Mapeamento para a tabela `Prices`.
- [map_images.md](./data_mapping/map_images.md): Mapeamento para a tabela `ProductImages`.

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

## Logs e Registros
- [LOG_ERROS_CONSOLIDADO.md](../LOG_ERROS_CONSOLIDADO.md): Log consolidado de erros e resoluções. **(Atualizado: 2025-06-13T19:32:00 - Incluída correção FRONT-ERR-011)**
- [LOG_PROMPTS_CONSOLIDADO.md](../LOG_PROMPTS_CONSOLIDADO.md): Log consolidado de prompts, decisões e interações.
- [LOG_CODE_CONSOLIDADO.md](../LOG_CODE_CONSOLIDADO.md): Log consolidado de implementações, atualizações e decisões técnicas. **(Atualizado: 2025-06-13T19:35:00 - Incluída resolução FRONT-ERR-011)**
- `.taskmaster/logs/`: Logs detalhados das tarefas (pasta não listada no diretório atual).

## Status Atual do Sistema (2025-06-13)

### ✅ Funcionalidades Completamente Operacionais
- **Página de Produtos (`/produtos`)**: Totalmente funcional com listagem, filtros, paginação e busca
- **Sistema de Categorias**: Árvore hierárquica com nomes visíveis e navegação funcional, seleção de categorias sem erros.
- **Filtros Laterais**: Marcas, categorias, preço (autenticado), stock (autenticado) - tudo funcionando corretamente.
- **Autenticação**: Login/logout com Clerk, permissões funcionais
- **API Backend**: Todos os endpoints principais funcionando (`/api/products`, `/api/products/filters`)

### 🔧 Correções Recentes
- **FRONT-ERR-009**: Resolvido loop infinito na página de produtos
- **FRONT-ERR-010**: Resolvido problema de exibição de categorias sem nomes
- **FRONT-ERR-011**: Resolvido erro `TypeError: selectedCategories.some is not a function` no filtro de categorias.

---

> **IMPORTANTE**: Consulte SEMPRE este índice e os documentos referenciados antes de tomar decisões técnicas, implementar código ou responder a prompts relevantes. O sistema está agora completamente funcional para as funcionalidades principais de e-commerce.
