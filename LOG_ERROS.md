# LOG DE ERROS - PROJETO IDEA (Início com Cascade)
**Data de Início:** 2025-06-07T10:51:17Z
**ID Inicial:** IDEA-ERRO-001
---

---
**ID:** IDEA-ERR-001
**Timestamp:** 2025-06-07T13:45:51+01:00
**Tipo:** Erro
**Descrição:** O servidor de desenvolvimento (npm run dev) falhou ao iniciar com o erro 'Failed to resolve import "i18next-http-backend" from "src/i18n.js"'.
**Stack Trace:** (Conforme log do terminal em 2025-06-07T13:45:36+01:00 e 2025-06-07T13:45:51+01:00)
**Ação Tomada:** Comando 'npm install i18next-http-backend i18next-browser-languagedetector' executado para instalar os pacotes em falta.
**Estado:** RESOLVIDO (ver IDEA-ERR-002)

---
**ID:** IDEA-ERR-002
**Timestamp:** 2025-06-07T13:46:40+01:00
**Tipo:** Erro
**Descrição:** O servidor de desenvolvimento (npm run dev) falhou novamente, desta vez com os erros 'Failed to resolve import "i18next" from "src/i18n.js"' e 'Failed to resolve import "react-i18next" from "src/i18n.js"'.
**Stack Trace:** (Conforme log do terminal em 2025-06-07T13:46:30+01:00 e 2025-06-07T13:46:40+01:00)
**Causa Raiz:** Pacotes 'i18next' e 'react-i18next' foram removidos ou desvinculados, possivelmente durante a otimização de dependências do npm na instalação anterior.
**Ação Tomada:** Comando 'npm install i18next react-i18next' executado para reinstalar explicitamente os pacotes.
**Estado:** RESOLVIDO (confirmado pelo USER em 2025-06-07T13:48:08+01:00)

---
