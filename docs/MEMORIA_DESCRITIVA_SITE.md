# Memória Descritiva — Site Geko B2B Clone

> Documento detalhado de tudo que o site vai conter, incluindo páginas, funcionalidades, áreas, assets e estrutura geral.

---

## 1. Estrutura de Páginas e Áreas

### 1.1. Páginas Públicas
- **Home Page**: Destaques, banners, busca, categorias, novidades, promoções.
- **Página de Produtos (Catálogo/Listagem)**: Filtros dinâmicos (categoria, preço, stock, atributos técnicos, fabricante), ordenação, paginação.
- **Página de Detalhe do Produto**: Galeria de imagens, descrição rica (HTML), tabelas técnicas, variações, preço, stock, EAN, referências, breadcrumbs, botões de ação (adicionar ao carrinho, wishlist, comparar).
- **Sobre a Empresa**: Missão, valores, história, contatos.
- **Contactos/Suporte**: Formulário de contacto, chat, localização, FAQ.
- **Política de Privacidade, Termos de Uso, Cookies**: Páginas legais obrigatórias.

### 1.2. Áreas Especiais
- **Área do Cliente (Autenticada)**:
  - Dashboard com resumo de pedidos e mensagens
  - Histórico de encomendas
  - Gestão de dados pessoais e moradas
  - Wishlist, favoritos, alertas de stock
  - Downloads de faturas e documentos
  - Preferências de comunicação e notificações
- **Área de Admin (Restrita)**:
  - Gestão de produtos, categorias, variações, imagens
  - Gestão de utilizadores/clientes
  - Gestão de encomendas e faturação
  - Gestão de banners, promoções e conteúdos
  - Relatórios (vendas, stock, acessos)
  - Logs de sistema e auditoria

### 1.3. Componentes Globais
- **Header**: Logo, menu principal, busca, login/área cliente, carrinho, idiomas
- **Footer**: Links institucionais, redes sociais, newsletter, contactos, selo de segurança
- **Sidebar de Filtros** (catálogo), breadcrumbs, modais de aviso, popups de promoções

### 1.4. Assets
- Logos e ícones (originais e branding próprio)
- Imagens de categorias, banners, produtos
- Ícones para filtros, ações, status
- Documentos legais e institucionais

### 1.5. Funcionalidades Gerais
- Busca instantânea (autocomplete)
- Filtragem avançada (multi-campos)
- Renderização segura de HTML das descrições
- Responsividade total (mobile first)
- Internacionalização (PT/EN, expansível)
- SEO otimizado (SSR/SSG, metadados, sitemap, robots)
- Performance otimizada (cache, lazy loading, CDN)
- Acessibilidade (WCAG)
- Logs e auditoria de ações
- Sistema de notificações (cliente e admin)
- Integração com API/cache local
- Upload seguro de imagens/assets
- Gestão de permissões (admin, cliente, visitante)
- Testes automatizados (unitários, e2e)

---

**Este documento serve como referência completa para desenvolvimento, QA e validação do projeto.**
