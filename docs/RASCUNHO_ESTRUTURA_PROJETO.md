# Rascunho — Estrutura e Roadmap do Projeto Geko Clone

> **Este documento é um rascunho e está sujeito a alterações.**

## 1. Visão Geral
Clonagem integral do site https://b2b.geko.pl/en/p, com sistema de filtragem, UX, layout, assets e dados de produtos, usando dados próprios em cache/local e posterior aplicação de branding de parceiro.

---

## 2. Etapas do Projeto

### 2.1. Mapeamento e Download de Assets
- Baixar localmente todos os ícones, logos de categorias, imagens e outros assets visuais necessários do site original.
- Organizar assets em pastas (`/assets/icons`, `/assets/logos`, `/assets/categories`, etc.).

### 2.2. Parser e Importação de Dados
- Desenvolver parser robusto para importar e normalizar todos os campos do XML da Geko.
- Armazenar dados em banco de dados local (ex: PostgreSQL, MongoDB, SQLite) ou cache estruturado.
- Garantir que todos os campos necessários para filtragem estejam presentes.

### 2.3. Estruturação do Banco de Dados
- Modelar entidades: Produto, Categoria, Imagem, Variação, Atributo Técnico, etc.
- Prever campos opcionais e listas (múltiplas imagens, múltiplas variações).

### 2.4. API Interna
- Criar endpoints para:
  - Listagem de produtos (com filtros, paginação, ordenação)
  - Detalhe do produto
  - Listagem de categorias/atributos/filtros
  - Imagens/assets
- Implementar lógica de busca e filtragem avançada.

### 2.5. Clonagem do Frontend
- Recriar layout, UX e sistema de filtragem do site original (Next.js recomendado).
- Implementar componentes para:
  - Lista de produtos (cards)
  - Página de detalhes do produto (galeria, tabelas técnicas, HTML de descrição)
  - Filtros (checkbox, range, dropdown, etc.)
  - Breadcrumbs, navegação, banners, etc.
- Garantir responsividade e fidelidade visual.

### 2.6. Testes
- Validar visualmente e funcionalmente todas as páginas e filtros.
- Garantir fidelidade ao original.
- Testes de performance e responsividade.

### 2.7. Introdução Gradual do Branding
- Substituir assets e estilos pelo branding próprio, mantendo a estrutura.

---

## 3. Observações e Boas Práticas
- Sempre tratar HTML das descrições de forma segura (sanitize).
- Prever fallback para todos os campos opcionais.
- Garantir performance e segurança.
- Estruturar banco e API para fácil expansão.
- Documentar todas as decisões técnicas.

---

## 4. Roadmap Sugerido
1. Mapeamento e download de assets
2. Parser e importação de dados
3. Estruturação do banco de dados
4. API interna
5. Clonagem do frontend
6. Testes e validação
7. Branding e personalização

---

**Este documento será atualizado conforme o projeto evoluir.**
