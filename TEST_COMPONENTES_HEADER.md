# Testes de Componentes do Header

## 1. UserMenu Component

### 1.1 Estado Inicial (Não Autenticado)
- [ok] Exibe botão de login
- [ok] Não exibe avatar do utilizador
- [ok] Não exibe menu dropdown

### 1.2 Fluxo de Login
- [ok] Abre modal de login ao clicar em "Entrar"
- [ok] Exibe estado de carregamento durante autenticação
- [ok] Exibe avatar após login bem-sucedido
- [ok] Fecha o modal após login bem-sucedido

### 1.3 Menu Dropdown (Autenticado)
- [ok] Abre/fecha menu ao clicar no avatar
- [ok] Fecha menu ao clicar fora
- [nao] Fecha menu ao pressionar tecla Escape
- [ok] Navegação por teclado (Tab/Shift+Tab)
- [ok] Foco retorna ao botão do menu ao fechar

### 1.4 Itens do Menu
- [ok] Exibe nome do utilizador
- [ok] Exibe email do utilizador
- [ok] Links de navegação funcionais:
  - [ok] Perfil
  - [ok] Encomendas - temos atualmente um que diz "Meus Pedidos"
  - [ok] Sair

### 1.5 Logout
- [ok] Desloga ao clicar em "Sair"
- [ok] Redireciona para página inicial após logout
- [ok] Remove dados de sessão

## 2. LanguageSwitcher Component

### 2.1 Estado Inicial
- [ok] Exibe idioma atual
- [ok] Exibe ícone de globo
- [ok] Menu dropdown está fechado
- [ok] Foco no botão do seletor

### 2.2 Troca de Idioma
- [ok] Abre dropdown ao clicar
- [ok] Exibe todas as línguas disponíveis
- [ok] Muda idioma ao selecionar opção
- [ok] Fecha dropdown após seleção
- [ok] Mantém preferência de idioma

### 2.3 Navegação por Teclado
- [ok] Abre com Enter/Space
- [ok] Navega com setas (cima/baixo)
- [ok] Seleciona com Enter
- [ok] Fecha com Escape
- [ok] Navegação circular

### 2.4 Acessibilidade
- [x] Atributos ARIA corretos
- [x] Anúncio de mudanças para leitores de tela
- [x] Contraste de cores adequado
- [x] Foco visível em todos os elementos interativos
- [x] Navegação por teclado completa
- [x] Feedback visual para seleção atual

## 3. Testes de Responsividade

### 3.1 Desktop (>1024px)
- [x] Layout correto
- [x] Todos os elementos visíveis
- [x] Menu horizontal

### 3.2 Tablet (768px - 1024px)
- [x] Layout adaptado
- [x] Menu ainda acessível
- [x] Botões com tamanho adequado

### 3.3 Mobile (<768px)
- [x] Menu hamburguer funcional
- [x] Dropdowns acessíveis
- [x] Toque fácil nos elementos

## 4. Problemas Encontrados

| Descrição | Gravidade | Status | Notas |
|-----------|-----------|--------|-------|
| | | | |
| | | | |
| | | | |

## 5. Observações Finais

Data do Teste: [DATA]
Testado por: [NOME]
Versão: [VERSÃO]

---

**Legenda:**
- ✅ Teste aprovado
- ⚠️ Problema conhecido
- ❌ Falha no teste
- 🔄 Em andamento

**Notas de Atualização:**
- [DATA] - Criação do documento
- [DATA] - Primeira rodada de testes
