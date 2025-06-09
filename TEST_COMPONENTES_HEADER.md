# Testes de Componentes do Header

## 1. UserMenu Component

### 1.1 Estado Inicial (Não Autenticado)
- [ok] Exibe botão de login
- [ok] Não exibe avatar do utilizador
- [ok] Não exibe menu dropdown

### 1.2 Fluxo de Login
- [ok] Abre modal de login ao clicar em "Entrar"
- [ ] Exibe estado de carregamento durante autenticação
- [ ] Exibe avatar após login bem-sucedido
- [ ] Fecha o modal após login bem-sucedido

### 1.3 Menu Dropdown (Autenticado)
- [ ] Abre/fecha menu ao clicar no avatar
- [ ] Fecha menu ao clicar fora
- [ ] Fecha menu ao pressionar tecla Escape
- [ ] Navegação por teclado (Tab/Shift+Tab)
- [ ] Foco retorna ao botão do menu ao fechar

### 1.4 Itens do Menu
- [ ] Exibe nome do utilizador
- [ ] Exibe email do utilizador
- [ ] Links de navegação funcionais:
  - [ ] Perfil
  - [ ] Encomendas
  - [ ] Definições
  - [ ] Sair

### 1.5 Logout
- [ ] Desloga ao clicar em "Sair"
- [ ] Redireciona para página inicial após logout
- [ ] Remove dados de sessão

## 2. LanguageSwitcher Component

### 2.1 Estado Inicial
- [ ] Exibe idioma atual
- [ ] Exibe ícone de globo
- [ ] Menu dropdown está fechado
- [ ] Foco no botão do seletor

### 2.2 Troca de Idioma
- [ ] Abre dropdown ao clicar
- [ ] Exibe todas as línguas disponíveis
- [ ] Muda idioma ao selecionar opção
- [ ] Fecha dropdown após seleção
- [ ] Mantém preferência de idioma

### 2.3 Navegação por Teclado
- [ ] Abre com Enter/Space
- [ ] Navega com setas (cima/baixo)
- [ ] Seleciona com Enter
- [ ] Fecha com Escape
- [ ] Navegação circular

### 2.4 Acessibilidade
- [ ] Atributos ARIA corretos
- [ ] Anúncio de mudanças para leitores de tela
- [ ] Contraste de cores adequado
- [ ] Foco visível em todos os elementos interativos

## 3. Testes de Responsividade

### 3.1 Desktop (>1024px)
- [ ] Layout correto
- [ ] Todos os elementos visíveis
- [ ] Menu horizontal

### 3.2 Tablet (768px - 1024px)
- [ ] Layout adaptado
- [ ] Menu ainda acessível
- [ ] Botões com tamanho adequado

### 3.3 Mobile (<768px)
- [ ] Menu hamburguer funcional
- [ ] Dropdowns acessíveis
- [ ] Toque fácil nos elementos

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
