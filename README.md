# 🏪 IDEA E-commerce - Sistema B2B Completo

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![Version](https://img.shields.io/badge/Version-1.5.0-blue)]()
[![Node](https://img.shields.io/badge/Node.js-18%2B-green)]()
[![React](https://img.shields.io/badge/React-19.1.0-blue)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue)]()

> **Plataforma completa de e-commerce B2B inspirada no Geko.pl com checkout, gestão de carrinhos e sistema de aprovação administrativo.**

## 🎯 **Visão Geral**

O IDEA E-commerce é uma solução completa de e-commerce B2B que inclui:

- 🛍️ **Catálogo de Produtos** com filtros avançados e pesquisa
- 🛒 **Sistema de Carrinho** com persistência LocalStorage + API
- ✅ **Checkout Completo** com validações e formulário de entrega
- 📦 **Gestão de Encomendas** com workflow de aprovação
- 👨‍💼 **Área Administrativa** completa com 17 páginas de gestão
- 🔐 **Autenticação JWT** com sistema RBAC
- 📊 **Relatórios e Analytics** em tempo real

## ✨ **Funcionalidades Principais**

### 🛍️ **Para Clientes**
- **Navegação de Produtos** - Catálogo com filtros por categoria, marca, preço
- **Carrinho Inteligente** - Gestão completa com hidratação automática
- **Checkout Seguro** - Formulário validado com dados de entrega
- **Acompanhamento** - Tracking de encomendas em tempo real
- **Conta Pessoal** - Gestão de perfil e histórico de compras

### 👨‍💼 **Para Administradores**
- **Dashboard Completo** - Estatísticas e métricas em tempo real
- **Gestão de Produtos** - CRUD completo com imagens e variantes
- **Gestão de Encomendas** - Aprovação, tracking e relatórios
- **Gestão de Utilizadores** - RBAC com permissões granulares
- **Monitor de Carrinhos** - Visualização e conversão em tempo real
- **Relatórios Avançados** - Analytics de vendas e performance

## 🚀 **Quick Start**

### **Pré-requisitos**
- Node.js 18+
- PostgreSQL 15+
- npm 8+

### **Instalação Local**
```bash
# Clonar repositório
git clone <repo-url>
cd idea

# Instalar dependências
npm install

# Configurar ambiente
cp docs/env-doc.txt .env
# Editar .env com suas configurações

# Executar migrações (se necessário)
npm run migrate

# Iniciar em desenvolvimento
npm run dev

# OU iniciar em produção
npm run prod:full
```

### **Acesso Rápido**
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API Health**: http://localhost:3000/api/health

### **Credenciais Padrão**
- **Admin**: `g.art.shine@gmail.com` / `admin123`
- **Cliente**: `cliente@mike.com` / `2585`

## 🏗️ **Arquitetura**

### **Stack Tecnológico**
- **Frontend**: React 19, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: PostgreSQL (Neon Cloud)
- **Integration**: Geko API XML Parser
- **Deployment**: PM2, Docker, cPanel ready

### **Estrutura do Projeto**
```
idea/
├── app/                    # Frontend React (Next.js style)
│   ├── admin/             # Área administrativa
│   ├── api/               # API routes
│   ├── components/        # Componentes React
│   ├── contexts/          # Context providers
│   └── styles/            # CSS e estilos
├── src/                   # Backend Node.js
│   ├── api/               # APIs principais
│   ├── db/                # Database queries
│   └── services/          # Business logic
├── docs/                  # Documentação completa
├── scripts/               # Scripts de importação
└── public/                # Assets estáticos
```

## 🛒 **Workflow E-commerce**

### **Fluxo do Cliente**
```
🔍 Navegar Produtos → 🛒 Adicionar ao Carrinho → 📝 Checkout → 📦 Encomenda → 👀 Tracking
```

### **Fluxo do Admin**
```
👁️ Monitor Carrinhos → 🔄 Conversão → ✅ Aprovação → 🚚 Expedição → 📊 Relatórios
```

### **Estados da Encomenda**
- `pending_approval` - Aguardando aprovação (inicial)
- `approved` - Aprovada pelo admin
- `shipped` - Enviada
- `delivered` - Entregue
- `rejected` - Rejeitada
- `cancelled` - Cancelada

## 📊 **APIs Principais**

### **Cliente**
```
GET    /api/products        # Catálogo com filtros
GET    /api/cart            # Carrinho do utilizador
POST   /api/cart            # Adicionar ao carrinho
POST   /api/orders          # Criar encomenda
POST   /api/auth/login      # Autenticação
```

### **Admin**
```
GET    /api/admin/orders    # Todas as encomendas
GET    /api/admin/carts     # Carrinhos pendentes
POST   /api/admin/carts     # Converter carrinho
GET    /api/admin/reports   # Relatórios
```

## 🔐 **Sistema de Permissões**

### **Roles**
- **Admin** - Acesso total ao sistema
- **Customer** - Acesso a preços, carrinho e encomendas

### **Permissões**
- `view_products` - Ver produtos
- `view_price` - Ver preços
- `view_stock` - Ver stock
- `create_order` - Criar encomendas
- `manage_orders` - Gerir encomendas
- `manage_products` - Gerir produtos
- `manage_users` - Gerir utilizadores
- `manage_settings` - Gerir configurações

## 🚀 **Deployment**

### **Desenvolvimento**
```bash
npm run dev          # Frontend + Backend
npm run build        # Build produção
npm run prod:full    # Start produção
```

### **Produção**
```bash
# PM2 (Recomendado)
npm run prod:pm2

# Docker
docker-compose up -d

# Script automático
./deploy.sh
```

### **Ambiente**
```bash
# Variáveis essenciais
NODE_ENV=production
DATABASE_URL=postgres://...
JWT_SECRET=your-secret-key
GEKO_API_KEY=your-api-key
```

## 📚 **Documentação**

- [**Features Completas**](docs/FEATURES_COMPLETE_REFERENCE.md) - Referência completa
- [**Sistema de Checkout**](docs/CHECKOUT_SYSTEM_IMPLEMENTATION.md) - Documentação do checkout
- [**Admin Area Status**](docs/ADMIN_AREA_IMPLEMENTATION_STATUS.md) - Status da área admin
- [**Deployment Guide**](docs/DEPLOYMENT_GUIDE.md) - Guia de deployment
- [**Project Status**](docs/PROJECT_STATUS_SUMMARY.md) - Resumo do projeto
- [**Changelog**](docs/CHANGELOG.md) - Histórico de versões

## 🧪 **Testes**

```bash
# Health check
curl http://localhost:3000/api/health

# Testes manuais
npm run test

# Verificar build
npm run build && ls -la dist/
```

## 🔧 **Configuração**

### **Base de Dados**
```sql
-- Executar migrações
psql -d your_database -f db/migrations/V1__restructure_product_schema.sql
psql -d your_database -f db/migrations/V2__create_users_rbac_orders.sql
```

### **Integração Geko**
```bash
# Importação de produtos
python scripts/data_import/orchestrate_geko_import_with_reset.py
```

## 📈 **Métricas**

- **📄 Páginas**: 27+ (17 admin + 10+ cliente)
- **🔌 APIs**: 9 (2 cliente + 7 admin)
- **🎯 Endpoints**: 60+ endpoints funcionais
- **⚡ Performance**: <500ms API response
- **📦 Build**: 87KB CSS (16KB gzipped)

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 **Suporte**

- **Documentação**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Email**: suporte@exemplo.com

---

## ⭐ **Status do Projeto**

```
✅ Área Administrativa: 100% completa
✅ Área Cliente: 100% completa  
✅ Sistema E-commerce: 100% implementado
✅ Autenticação: 100% funcional
✅ APIs: 60+ endpoints funcionais
✅ Documentação: 95% completa
🚀 Status: PRODUCTION READY
```

**O sistema está completamente funcional e pronto para deployment em produção!** 🎉

---

<p align="center">
  <strong>Desenvolvido com ❤️ para o futuro do e-commerce B2B</strong>
</p> 