# Regras Locais do Projeto para o Cascade

> **Este documento define as regras e práticas locais para o agente Cascade neste projeto.**

---

## 1. Princípios Gerais
- Seguir sempre as regras do projeto (ver RASCUNHO_RULES_PROJETO.md).
- Garantir rastreabilidade, transparência e documentação de todas as ações relevantes.

---

## 2. Estrutura de Registo e Indexação Obrigatória

### 2.1. Erros e Resolução de Erros
- Todo erro detectado ou resolvido deve ser registrado com:
  - **Timestamp** (data/hora UTC)
  - **Tipo** (erro, warning, resolved)
  - **Descrição detalhada**
  - **Stack trace** (quando aplicável)
  - **Ação tomada**
  - **Indexação**: ID único sequencial
- Os registros devem ser mantidos em `LOG_ERROS.md` ou sistema equivalente.

### 2.2. Prompts
- Todos os prompts relevantes (decisões, dúvidas, interações importantes com o usuário) devem ser registrados com:
  - **Timestamp**
  - **Tipo** (prompt, decisão, dúvida, resposta)
  - **Conteúdo do prompt**
  - **Resultado/decisão**
  - **Indexação**: ID único sequencial
- Os registros podem ser mantidos em `LOG_PROMPTS.md`.

### 2.3. Implementações, Atualizações e Detalhes Técnicos
- Toda implementação de código, atualização relevante, decisão técnica ou alteração de arquitetura deve ser registrada com:
  - **Timestamp**
  - **Tipo** (implementação, atualização, refactor, decisão técnica)
  - **Descrição detalhada**
  - **Arquivos/áreas afetadas**
  - **Indexação**: ID único sequencial
- Os registros podem ser mantidos em `LOG_CODE.md` ou documentação técnica específica (`docs/` ou similar).

---

## 3. Organização dos Registos
- Os logs devem ser facilmente pesquisáveis (por data, ID, tipo).
- Recomenda-se manter um índice inicial em cada ficheiro de log.
- Sempre registrar em tempo real ou imediatamente após cada ação relevante.

---

## 4. Boas Práticas para o Cascade
- Validar sempre a existência de logs antes de criar entradas duplicadas.
- Garantir que todos os timestamps estejam em UTC.
- Garantir que logs de erros não exponham dados sensíveis.
- Atualizar este documento sempre que novas regras ou necessidades surgirem.

---

**Última atualização: 2025-06-04**
