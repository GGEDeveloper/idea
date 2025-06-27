# Estrutura Tecnológica Recomendada — Projeto Geko B2B (2025)

> Stack e versões recomendadas, baseadas em pesquisa atualizada e compatibilidade comprovada para e-commerce Next.js/React.

---

## 1. Frontend
- **Next.js**: 15.x (SSR/SSG, API routes, i18n, otimizado para SEO)
- **React**: 19.x (componentização avançada, performance)
- **TypeScript**: 5.x (segurança de tipos)
- **Tailwind CSS**: 3.4.x (UI responsiva e design system)
- **next-intl**: 3.x (internacionalização dinâmica)
- **Radix UI** ou **Material UI**: 2.x / 6.x (componentes acessíveis e modernos)
- **Zustand**: 5.x (gerenciamento de estado global)

## 2. Backend/API
- **Node.js**: 20.x LTS (backend, SSR, API interna)
- **Prisma ORM**: 5.x (mapeamento objeto-relacional)
- **PostgreSQL (Neo4j/Vercel compatible)**: 16.x (banco de dados relacional principal, recomendado para deploy cloud-native e integração direta com Vercel, Railway, Supabase, etc.)
- **Auth.js** (antigo NextAuth) 4.x ou **Clerk** 5.x (autenticação segura, MFA, OAuth2, SSO)
- **Sanity CMS**: 4.x (opcional, gestão headless de catálogo/assets)
- **Stripe SDK**: 12.x (pagamentos, se aplicável)

## 3. Outras Dependências Essenciais
- **Vercel CLI**: última versão (deploy otimizado para Next.js)
- **ESLint/Prettier**: últimas versões (padrões de código)
- **Jest/Testing Library**: últimas versões (testes unitários e e2e)
- **dotenv**: 16.x (gestão de variáveis de ambiente)

## 4. Estrutura de Pastas do Projeto

```
src/
├── api/                    # Rotas da API
│   └── products.cjs        # Endpoints de produtos e categorias
├── assets/                 # Recursos estáticos
│   └── images/             # Imagens do site
├── components/             # Componentes reutilizáveis
│   ├── common/             # Componentes comuns (Header, Footer, etc.)
│   └── ui/                 # Componentes de interface do usuário
├── config/                 # Configurações do aplicativo
├── hooks/                  # Custom React Hooks
├── pages/                  # Páginas do aplicativo
│   ├── HomePage.jsx        # Página inicial
│   └── ...
├── services/              # Serviços (chamadas de API)
│   ├── api.js             # Configuração base da API
│   └── categoryService.js  # Serviço de categorias
└── styles/                 # Estilos globais
    └── index.css           # Estilos globais do Tailwind
```

## 5. Diretrizes de Desenvolvimento

### 5.1. Convenções de Código
- Componentes em PascalCase (ex: `HomePage.jsx`)
- Hooks personalizados prefixados com `use` (ex: `useProducts.js`)
- Serviços em camelCase (ex: `categoryService.js`)
- Pastas em minúsculas com hífens (ex: `product-details/`)

### 5.2. Padrões de Commit
- `feat`: Nova funcionalidade
- `fix`: Correção de bugs
- `docs`: Atualização de documentação
- `style`: Formatação de código
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Atualização de dependências

### 5.3. Processo de Desenvolvimento
1. Criar uma branch a partir de `main`
2. Desenvolver a funcionalidade
3. Escrever testes unitários
4. Abrir um Pull Request
5. Revisão de código
6. Deploy em ambiente de teste
7. Aprovação e merge para `main`

## 6. Próximos Passos
- [ ] Implementar testes automatizados
- [ ] Configurar CI/CD
- [ ] Adicionar monitoramento de erros (Sentry)
- [ ] Implementar cache em nível de aplicação
- [ ] Otimizar imagens e assets

## 7. Observações
- Todas as versões são estáveis e em uso em produção.
- Manter as dependências atualizadas regularmente.
- Documentar todas as alterações significativas.
- Garantir sempre uso de TypeScript e integração contínua (CI/CD) para máxima segurança e performance.
- Preferir deploy em Vercel para SSR/SSG e CDN global.
- Internacionalização e assets são nativos ou facilmente integráveis.

---

**Referências:**
- Udemy, YouTube, Next.js Templates, CartCoders (2025)
- Pesquisa Perplexity AI (junho 2025)
