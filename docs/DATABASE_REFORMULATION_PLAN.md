# Plano Estratégico de Reformulação da Base de Dados

> **Data:** 2025-06-14  
> **Autor:** Cascade AI (Versão Consolidada)  
> **Status:** Proposta para Aprovação

## 1. Introdução e Objetivo

Após uma análise extensiva da documentação, código e regras de negócio do projeto, foi identificada a necessidade crítica de uma reformulação da base de dados. O schema atual contém inconsistências que limitam a funcionalidade, a performance e a segurança, e não possui estruturas para suportar as regras de negócio essenciais do projeto (ex: encomendas, permissões granulares).

**Objetivo deste plano:** Unificar todas as correções e melhorias necessárias num único plano estratégico, faseado e coeso. O objetivo final é criar uma fundação de dados robusta, performante e escalável que sirva como a espinha dorsal do projeto IDEA.

---

## 2. O Plano de Reformulação Proposto (Implementação Faseada)

A refatoração será executada em três fases lógicas para gerir a complexidade e permitir a validação incremental.

### Fase 1: Fundações e Integridade dos Dados de Produto
*O objetivo desta fase é corrigir a estrutura de dados dos produtos, garantindo a sua integridade e performance.*

| Ação | Detalhe | Justificativa |
| :--- | :--- | :--- |
| **1. Unificar Chave Primária** | `products.productid` (PK) -> `products.ean` (PK). `productid` torna-se `UNIQUE`. | `ean` é o identificador de negócio universal. Unifica os `JOINs` e resolve a principal inconsistência. |
| **2. Corrigir Tipos de Dados** | Colunas de preço, stock, dimensões, etc., passam de `TEXT` para `NUMERIC`/`INTEGER`. | Permite cálculos, ordenação e filtragem eficientes na base de dados, prevenindo dados inválidos. |
| **3. Implementar Auditoria** | Adicionar `created_at` e `updated_at` a `products` e `categories`. | Essencial para rastreabilidade, depuração e funcionalidades como "produtos mais recentes". |
| **4. Ativar Atributos** | Corrigir a chave em `product_attributes` para se ligar a `products.ean`. | Torna a tabela de atributos finalmente utilizável para filtros técnicos. |
| **5. Sistema de Preços Avançado** | Substituir a tabela `prices` simples por `price_lists` e `prices`. | Suporta a regra de negócio de margens e diferentes níveis de preço (ex: retalho, revenda). |

### Fase 2: Lógica de Negócio, Utilizadores e Permissões
*Com os dados do produto estáveis, esta fase introduz as entidades de negócio centrais.*

| Ação | Detalhe | Justificativa |
| :--- | :--- | :--- |
| **1. Criar Sistema RBAC** | Novas tabelas: `roles`, `permissions`, `role_permissions`. | Centraliza a gestão de permissões (`view_price`, `place_order`) de forma robusta e escalável. |
| **2. Criar Tabela de Utilizadores** | Nova tabela `users` ligada ao `clerk_id` e à tabela `roles`. | Armazena dados de negócio do utilizador que não pertencem ao Clerk (ex: empresa, cargo). |
| **3. Criar Tabelas de Encomendas** | Novas tabelas: `orders`, `order_items`. | Implementa a infraestrutura para o fluxo completo de encomendas, uma funcionalidade central do site. |

### Fase 3: Escalabilidade e Robustez Final
*Esta fase finaliza a arquitetura, preparando-a para o crescimento e garantindo a máxima integridade.*

| Ação | Detalhe | Justificativa |
| :--- | :--- | :--- |
| **1. Implementar `FOREIGN KEY`s**| Adicionar `FOREIGN KEY` constraints com `ON DELETE CASCADE` a todas as relações. | Garante a integridade referencial. A base de dados passa a impedir "dados órfãos" automaticamente. |
| **2. Estruturar para i18n** | Novas tabelas: `product_translations`, `category_translations`. | Suporta a internacionalização de nomes e descrições, preparando o projeto para múltiplos mercados. |

---

## 3. Plano de Ação Recomendado

1.  **Aprovação do Plano:** Revisão e aprovação final deste documento.
2.  **Desenvolver Script de Migração (Fase 1):** Criar um script SQL que aplique todas as alterações da Fase 1.
3.  **Refatorar Scripts de Importação:** Atualizar os scripts de importação para serem compatíveis com as novas estruturas da Fase 1 (tipos de dados, sistema de preços).
4.  **Refatorar Código da API (Fase 1):** Adaptar as queries em `product-queries.cjs` e `products.cjs` para o novo schema.
5.  **Executar e Validar (Fase 1):** Executar a migração e os testes num ambiente controlado.
6.  **Desenvolver Script de Migração (Fase 2 e 3):** Criar o script para adicionar as tabelas de utilizadores, encomendas, RBAC, i18n e as `FOREIGN KEY`s.
7.  **Refatorar Código da API (Fase 2 e 3):** Criar os novos endpoints (`/api/orders`, `/api/users/me/permissions`) e refatorar a lógica de autenticação para usar o sistema RBAC.
8.  **Execução e Validação Final:** Executar a migração final e realizar testes de integração completos.

---

## 4. Análise de Impacto e Adaptação do Código

| Área Afetada | Detalhes do Impacto e Plano de Adaptação |
| :--- | :--- |
| **`src/db/product-queries.cjs`** | **(ELEVADO)** - Quase todas as funções serão reescritas para usar `ean` como chave, tipos numéricos corretos e o novo sistema de preços. |
| **`src/api/products.cjs`** | **(ELEVADO)** - As rotas serão modificadas para chamar as novas funções de query. A lógica para determinar o preço a ser exibido (baseado no utilizador) será implementada aqui. |
| **`src/contexts/AuthContext.jsx`** | **(MÉDIO)** - Será refatorado. Em vez de ler permissões dos metadados do Clerk, fará uma chamada a um novo endpoint (ex: `/api/users/me/permissions`) para obter as permissões do nosso sistema RBAC. |
| **Scripts de Importação** | **(ELEVADO)** - Terão de ser reescritos para limpar dados (ex: '1,23' -> 1.23) e para popular as novas estruturas de tabelas, especialmente `prices` e `price_lists`. |
| **Frontend (Geral)** | **(BAIXO)** - O objetivo é que o impacto seja mínimo. A API continuará a fornecer um contrato JSON estável. A principal mudança será no `AuthContext` e na lógica de ordenação da `ProductsPage.jsx`. |
| **Novos Endpoints de API** | **(NOVO)** - Serão criados novos ficheiros de rotas para gerir encomendas (`orders.cjs`), utilizadores (`users.cjs`), etc. |

---

## 5. Checklist de Verificação da Migração

| Fase | Área | Ação Específica a Verificar | Status |
| :--- | :--- | :--- | :---: |
| **Fase 1** | **Migração BD** | O script altera a PK de `products` para `ean`? | ✅ |
| | | O script converte os tipos de dados para `NUMERIC`/`INTEGER`? | ✅ |
| | | O script adiciona colunas de auditoria? | ✅ |
| | | O script cria e popula as tabelas `price_lists` e `prices`? | ✅ |
| | **Backend** | As queries em `product-queries.cjs` estão alinhadas com o novo schema? | ✅ |
| | **API** | O contrato JSON da API de produtos permanece estável para o frontend? | ✅ |
| **Fase 2** | **Migração BD** | O script cria as tabelas `users`, `orders`, `roles`, `permissions`, `role_permissions`? | ✅ |
| | **API** | Novos endpoints para encomendas e permissões foram criados? | ✅ |
| | **Auth** | O `AuthContext` busca permissões da nova API? | ✅ |
| **Fase 3** | **Migração BD** | O script cria as tabelas de tradução (`product_translations`, etc.)? | ☐ |
| | | O script aplica `FOREIGN KEY` constraints a todas as relações? | ☐ |
| | **API** | A API de produtos foi adaptada para retornar dados traduzidos com base no idioma do utilizador? | ☐ | 