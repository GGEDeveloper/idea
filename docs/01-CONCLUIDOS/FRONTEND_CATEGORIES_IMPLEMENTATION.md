# Implementação de Categorias Dinâmicas no Frontend

Este documento detalha a implementação da exibição dinâmicas de categorias na página inicial do site.

## Visão Geral

A página inicial agora exibe categorias de produtos dinâmicas, buscadas diretamente do banco de dados através da API. As categorias são exibidas em cards responsivos com ícones e contagem de produtos.

## Componentes Principais

### 1. HomePage.jsx

Localização: `src/pages/HomePage.jsx`

Responsável por:
- Gerenciar o estado de carregamento das categorias
- Exibir mensagens de erro quando necessário
- Renderizar a lista de categorias em um layout responsivo
- Fornecer navegação para a página de produtos filtrada por categoria

### 2. categoryService.js

Localização: `src/services/categoryService.js`

Responsável por:
- Fazer a requisição para a API de categorias
- Fornecer fallback com categorias padrão em caso de erro
- Mapear nomes de categorias para ícones e cores

## Fluxo de Dados

1. A página inicial é carregada
2. O componente `HomePage` chama `getCategories()` do `categoryService`
3. O serviço faz uma requisição para `/api/products/categories`
4. O backend retorna a lista de categorias com contagem de produtos
5. O frontend exibe as categorias em cards estilizados

## Tratamento de Erros

- Exibição de mensagem de carregamento durante a requisição
- Exibição de mensagem de erro personalizada em caso de falha
- Botão para tentar novamente em caso de erro
- Fallback para categorias padrão quando a API não está disponível

## Estilização

- Cards com fundo colorido baseado no nome da categoria
- Ícones do FontAwesome mapeados dinamicamente
- Efeitos de hover e transições suaves
- Layout responsivo que se adapta a diferentes tamanhos de tela

## Melhorias Futuras

- Adicionar cache para melhorar o desempenho
- Implementar carregamento lazy para imagens
- Adicionar animações mais elaboradas
- Suporte a múltiplos idiomas para os nomes das categorias

# Implementação de Árvore de Categorias Dinâmicas (2025)

## Mudança principal
A partir de junho de 2025, a árvore de categorias exibida no frontend (sidebar de filtros e navegação) passou a ser construída a partir do campo `path` da tabela `categories` no banco de dados, e não mais do campo `parent_id`.

- O backend agora utiliza a função `buildCategoryTreeFromPaths` para montar a hierarquia de categorias a partir do campo `path`.
- O endpoint `/api/products/filters` retorna a árvore de categorias já aninhada, com cada nó contendo um array `children`.
- O frontend consome essa estrutura e exibe a árvore navegável normalmente.

## Exemplo de estrutura retornada

```
[
  {
    "id": "1",
    "name": "Eletrônicos",
    "path": "eletronicos",
    "productCount": 120,
    "children": [
      {
        "id": "2",
        "name": "Celulares",
        "path": "eletronicos/celulares",
        "productCount": 40,
        "children": []
      },
      ...
    ]
  },
  ...
]
```

## Observações
- O campo `parent_id` pode ser ignorado para exibição e navegação.
- O campo `path` deve ser único e refletir a hierarquia completa (ex: `mae/filho/neta`).
- O frontend espera o array `categories` já aninhado.

## Referências
- Veja `src/api/products.cjs` para a função `buildCategoryTreeFromPaths`.
- Veja `CategoryTree.jsx` para renderização recursiva da árvore.

---
