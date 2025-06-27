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

### 2.4. API Interna (Em Andamento)
- [x] Endpoint para listagem de categorias (`/api/products/categories`)
  - [x] Filtro de categorias principais
  - [x] Contagem de produtos por categoria
  - [x] Paginação e limitação de resultados
- [ ] Endpoint para listagem de produtos
- [ ] Endpoint para detalhe do produto
- [ ] Endpoint para busca e filtragem avançada
- [ ] Documentação da API

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

## 4. Progresso e Próximos Passos

### ✅ Concluído
1. **Infraestrutura Inicial**
   - Configuração do ambiente de desenvolvimento
   - Estrutura de pastas do projeto
   - Configuração do banco de dados PostgreSQL

2. **Backend**
   - [x] Configuração do servidor Express
   - [x] Middleware CORS
   - [x] Endpoint de categorias (`/api/products/categories`)
   - [x] Tratamento de erros e logs

3. **Frontend**
   - [x] Configuração do React com Vite
   - [x] Página inicial com categorias dinâmicas
   - [x] Componente de carregamento e tratamento de erros
   - [x] Estilização responsiva com Tailwind CSS

### 🚧 Em Andamento

1. **Backend**
   - [ ] Endpoint de listagem de produtos
     - [ ] Filtros e ordenação
     - [ ] Paginação
   - [ ] Endpoint de detalhes do produto
   - [ ] Autenticação e autorização

2. **Frontend**
   - [ ] Página de listagem de produtos
   - [ ] Componente de filtros
   - [ ] Página de detalhes do produto
   - [ ] Carrinho de compras

### 📅 Próximos Passos

1. **Curto Prazo**
   - [ ] Implementar busca de produtos
   - [ ] Desenvolver página de detalhes do produto
   - [ ] Criar componente de carrinho

2. **Médio Prazo**
   - [ ] Implementar autenticação
   - [ ] Desenvolver painel administrativo
   - [ ] Sistema de pedidos

3. **Longo Prazo**
   - [ ] Otimização de performance
   - [ ] Testes automatizados
   - [ ] Internacionalização
   - [ ] Integração com meios de pagamento

---

**Este documento será atualizado conforme o projeto evoluir.**
