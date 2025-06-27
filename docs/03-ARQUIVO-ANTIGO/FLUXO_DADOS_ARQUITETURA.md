# Fluxo de Dados — Arquitetura Geko B2B

> Este diagrama e descrição detalham o caminho dos dados desde a API Geko até a interface do cliente, cobrindo parsing, cache, autenticação, permissões e fallback.

## Fluxo de Dados das Categorias Dinâmicas

### 1. Backend (Node.js/Express)
- **Endpoint**: `GET /api/products/categories`
- **Fonte de Dados**: Tabela `categories` no PostgreSQL
- **Processamento**:
  - Busca categorias principais (sem pai)
  - Conta produtos por categoria via JOIN com `product_categories`
  - Limita a 6 categorias para exibição
  - Retorna dados formatados com ícones e cores mapeados

### 2. Frontend (React)
- **Serviço**: `categoryService.js`
  - Gerencia chamadas à API
  - Fornece fallback para categorias padrão
  - Mapeia nomes de categorias para ícones e cores

- **Componente**: `HomePage.jsx`
  - Gerencia estados de carregamento e erro
  - Renderiza cards de categorias responsivos
  - Navega para página de produtos filtrada por categoria

### 3. Cache e Performance
- **Backend**: Cache em memória para reduzir consultas ao banco
- **Frontend**: SWR para revalidação estocástica
- **CDN**: Cache de imagens e assets estáticos

```mermaid
flowchart LR
    subgraph GekoAPI [API Geko (XML)]
        A1[Download XML Produtos/Categorias]
    end
    subgraph Backend [Node.js + Express]
        B1[Parsing XML]
        B2[Normalização e Cache (PostgreSQL)]
        B3[API REST]
        B4[Autenticação JWT]
        B5[Endpoints de Categorias]
    end
    subgraph Frontend [React]
        C1[HomePage Component]
        C2[Category Cards]
        C3[Category Service]
        C4[Loading/Error States]
        C5[React Router]
    end
    subgraph Styles [Estilização]
        D1[Tailwind CSS]
        D2[FontAwesome Icons]
        D3[Animações Hover]
    end

    A1 --> B1 --> B2 --> B3
    B3 --> B5
    B5 --> C3
    C3 --> C1
    C1 --> C2
    C1 --> C4
    C2 --> C5
    D1 & D2 & D3 --> C2
    C2 --> C5
```

## Descrição dos Fluxos

- **API Geko (XML):**
  - Fornece todos os dados de produtos, categorias, stock, preços (de fornecedor), imagens, descrições, etc.
- **Parsing XML:**
  - Backend faz parsing, validação e tratamento dos dados recebidos.
  - Aplica fallback para campos ausentes (imagens, traduções, etc).
- **Normalização e Cache (DB):**
  - Dados são normalizados (ajuste de preços, estruturação de categorias, etc) e armazenados em cache local (**PostgreSQL Neo, compatível com Vercel/Cloud**).
  - Reduz dependência da API externa e melhora performance.
- **API Interna REST/GraphQL:**
  - Expõe endpoints para o frontend consumir produtos, categorias, encomendas, etc.
  - Implementa regras de autenticação e permissões (ex: preços e stock só para clientes autenticados).
- **Sanity CMS (opcional):**
  - Permite gestão headless de banners, conteúdos institucionais, etc.
- **Autenticação/Auth.js:**
  - Gerencia login/logout, sessão, permissões (admin, cliente, visitante).
- **Frontend (Next.js/React):**
  - Consome dados via SSR/SSG ou chamadas API.
  - Exibe componentes UI com lógica de permissão (preços, stock, encomendas).
  - Estado global (Zustand), internacionalização (next-intl), autenticação cliente.

## Fallbacks e Segurança
- Se a API Geko estiver offline, o sistema opera em modo cache/local.
- Nunca expor preços de fornecedor diretamente ao cliente.
- Logging detalhado de parsing, erros e acessos.

---

> Consulte este documento para alinhar integrações, debugging e validação de fluxos de dados.
