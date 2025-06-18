# 🚀 **PLANO MASTER DE DEPLOYMENT - DOMÍNIOS.PT**
## **GUIA EXTENSO E DETALHADO PARA PRODUÇÃO**

---

## 📋 **ÍNDICE DO PLANO COMPLETO**

### **📊 RESUMO EXECUTIVO**
- **Objetivo**: Deploy completo da aplicação IDEA E-commerce no domínios.pt
- **Timeline**: 2-4 horas (primeira vez) | 15-30 min (deploys subsequentes)
- **Risco**: BAIXO - Zero downtime, rollback disponível
- **Custo**: €0 (usa recursos existentes do domínios.pt)

### **🎯 ARQUITETURA FINAL**
```
domínios.pt/alitools.pt:
├── Frontend (React/Vite) → public_html/
├── Backend (Node.js) → /home/artnshin/alitools.pt/
├── Proxy (Apache/.htaccess) → public_html/.htaccess
├── Database (PostgreSQL) → Neon Cloud
└── SSL → Let's Encrypt (domínios.pt)
```

---

## 📁 **ESTRUTURA DOS DOCUMENTOS**

### **FASE 1: [PREPARACAO](./fase1-preparacao-deployment.md)**
- ✅ Checklist pré-deployment (30 itens)
- ✅ Backup completo do projeto
- ✅ Verificação de dependências
- ✅ Setup do ambiente local
- ✅ Testes de compatibilidade Node 18

### **FASE 2: [CONFIGURACAO_SERVIDOR](./fase2-configuracao-servidor.md)**
- ✅ cPanel Node.js App setup
- ✅ Estrutura de diretórios
- ✅ Permissões e security
- ✅ Environment variables
- ✅ SSH key setup

### **FASE 3: [DEPLOYMENT_INICIAL](./fase3-deployment-inicial.md)**
- ✅ Upload de arquivos otimizado
- ✅ Build do frontend
- ✅ Instalação de dependências
- ✅ Primeiro start da aplicação
- ✅ Verificações de saúde

### **FASE 4: [PROXY_ROUTING](./fase4-proxy-routing.md)**
- ✅ .htaccess configuration
- ✅ SPA routing setup
- ✅ API proxy configuration
- ✅ Cache headers optimization
- ✅ Security headers

### **FASE 5: [OTIMIZACAO_PERFORMANCE](./fase5-otimizacao-performance.md)**
- ✅ Frontend optimization
- ✅ Backend tuning
- ✅ Database optimization
- ✅ CDN setup (Cloudflare)
- ✅ Monitoring setup

### **FASE 6: [DEPLOY_AUTOMATIZADO](./fase6-deploy-automatizado.md)**
- ✅ Script de deploy completo
- ✅ Git hooks
- ✅ CI/CD pipeline
- ✅ Rollback procedures
- ✅ Health checks

### **FASE 7: [TROUBLESHOOTING](./fase7-troubleshooting.md)**
- ✅ Problemas comuns e soluções
- ✅ Logs e debugging
- ✅ Performance issues
- ✅ Security fixes
- ✅ Emergency procedures

---

## ⏱️ **TIMELINE DETALHADO**

| Fase | Duração | Dependências | Responsável |
|------|---------|--------------|-------------|
| **Preparação** | 30-45 min | Git access, local dev env | Developer |
| **Config Servidor** | 45-60 min | cPanel access, SSH | DevOps |
| **Deploy Inicial** | 30-45 min | Fases 1-2 completas | Developer |
| **Proxy/Routing** | 15-30 min | Deploy inicial OK | DevOps |
| **Otimização** | 60-90 min | Sistema funcional | Performance |
| **Automação** | 45-60 min | Deploy manual OK | DevOps |
| **Documentação** | 30 min | Tudo funcional | Team Lead |

**Total: 4-6 horas (primeira implementação)**

---

## 🎯 **CRITÉRIOS DE SUCESSO**

### **✅ Funcional**
- [ ] Site carrega em < 3 segundos
- [ ] API responde corretamente
- [ ] SPA routing funciona
- [ ] SSL ativo e válido
- [ ] Database conecta sem erros

### **✅ Performance**
- [ ] Lighthouse Score > 85
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] API response time < 500ms
- [ ] 99% uptime

### **✅ Security**
- [ ] Security headers ativos
- [ ] HTTPS enforced
- [ ] Environment variables seguras
- [ ] File permissions corretas
- [ ] No secrets no código

### **✅ Operational**
- [ ] Deploy automático funciona
- [ ] Rollback testado
- [ ] Logs acessíveis
- [ ] Monitoring ativo
- [ ] Backup automatizado

---

## 🚨 **PLANOS DE CONTINGÊNCIA**

### **Problema: Deploy falha**
- **Rollback**: Script automatizado (< 5 min)
- **Hotfix**: Patch direto no servidor
- **Escalation**: VPS temporário se crítico

### **Problema: Performance baixa**
- **CDN**: Cloudflare gratuito
- **Cache**: Optimize .htaccess
- **Database**: Query optimization

### **Problema: SSL/DNS**
- **Backup domain**: Usar subdomain temporário
- **CDN**: Cloudflare proxy
- **Support**: Ticket domínios.pt

---

## 📞 **CONTACTOS CRÍTICOS**

- **domínios.pt Support**: [link do ticket system]
- **Neon Database**: Dashboard + docs
- **Cloudflare**: Account dashboard
- **GitHub**: Repository + Actions

---

## 🔍 **MÉTRICAS E MONITORING**

### **KPIs Técnicos**
- Deploy success rate: > 95%
- Build time: < 5 minutos
- Deploy time: < 2 minutos
- Recovery time: < 10 minutos

### **KPIs Negócio**
- Site availability: > 99%
- Page load speed: < 3s
- API reliability: > 99.5%
- User satisfaction: > 90%

---

## 📚 **PRÓXIMOS PASSOS**

1. **[▶️ COMEÇAR FASE 1](./fase1-preparacao-deployment.md)**
2. Review completo dos documentos
3. Setup do ambiente de desenvolvimento
4. Execução faseada com checkpoints
5. Testing e validação contínua

---

**🎯 Este plano foi desenhado para ser executado por qualquer desenvolvedor com conhecimentos básicos de Linux/cPanel. Cada fase é independente e pode ser executada/testada isoladamente.**

**💡 Tip: Executa cada fase com calma, valida todos os checkpoints, e documenta qualquer desvio do plano para futuras referências.** 