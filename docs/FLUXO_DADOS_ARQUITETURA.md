# Fluxo de Dados — Arquitetura Geko B2B

> Este diagrama e descrição detalham o caminho dos dados desde a API Geko até a interface do cliente, cobrindo parsing, cache, autenticação, permissões e fallback.

```mermaid
flowchart LR
    subgraph GekoAPI [API Geko (XML)]
        A1[Download XML Produtos/Categorias]
    end
    subgraph Backend [Node.js + Next.js API Routes]
        B1[Parsing XML]
        B2[Normalização e Cache (DB)]
        B3[API Interna REST/GraphQL]
        B4[Autenticação/Auth.js]
        B5[Sanity CMS (opcional)]
    end
    subgraph Frontend [Next.js/React]
        C1[SSR/SSG]
        C2[Componentes UI]
        C3[Zustand/Contexto]
        C4[Internacionalização]
        C5[Autenticação Cliente]
    end

    A1 --> B1 --> B2 --> B3
    B5 --> B3
    B4 --> B3
    B3 --> C1
    C1 --> C2
    C2 --> C3
    C2 --> C4
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
