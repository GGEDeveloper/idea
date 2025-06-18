# Rascunho — Regras e Políticas do Projeto Geko Clone

> **Este documento é um rascunho e está sujeito a alterações.**

## Princípios Gerais
- Garantir máxima fidelidade na clonagem do site Geko B2B, respeitando as regras de segurança, privacidade e compliance.
- Autonomia do agente limitada por regras de segurança, rastreabilidade e validação humana.
- Nunca expor dados sensíveis, credenciais ou preços de fornecedor diretamente ao cliente.
- Preços recebidos da API são de fornecedor e devem obrigatoriamente ser ajustados (margem, transporte, etc) antes de exibição; nunca mostrar preço original ao cliente.
- Cumprir todas as leis de proteção de dados (GDPR, LGPD, etc).
- Logging detalhado de erros, prompts e implementações.

## Autenticação e Permissões
- Login disponível apenas para clientes e admin. Não existe registo independente; solicitação de conta via formulário de contacto.
- Apenas o admin pode criar contas de cliente.
- O site é público para navegação, mas preços, stocks e dados comerciais só são visíveis para clientes autenticados.
- Sem sistema de pagamento integrado.

## Encomendas
- Clientes podem criar encomendas e acompanhá-las, mas toda encomenda deve ser aprovada ou rejeitada pelo admin.
- Apenas o admin pode atualizar o status das encomendas.
- Logging e rastreabilidade obrigatórios em todas as ações críticas de encomenda, autenticação e exibição de preços.

## 4. Uso dos Dados e API
- Utilizar apenas endpoints documentados e autorizados.
- Respeitar limites de uso e rate limits definidos pela API.
- Tratar erros de API de forma robusta, com tentativas limitadas e logs apropriados.
- Nunca modificar dados na API sem autorização explícita.

## 5. Clonagem de Interface e Assets
- Reproduzir fielmente estrutura, layout, estilos, ícones e logos das páginas originais.
- Manter consistência visual em todas as páginas e componentes.
- Documentar todas as decisões de design e implementação.

## 6. Design System e CSS Modular

### 6.1. Arquitetura CSS
- **OBRIGATÓRIO**: Usar estrutura CSS modular implementada
- **Ficheiros CSS**:
  - `variables.css` - Variáveis de temas (light/dark)
  - `base.css` - Estilos base, scrollbars, animações
  - `utilities.css` - Classes utilitárias (.bg-base, .text-base)
  - `components.css` - Componentes específicos (.product-card, .header-nav)
- **Ordem de Imports**: Custom CSS **DEVE** vir antes do Tailwind CSS

### 6.2. Sistema de Temas
- **Dark Mode**: Obrigatório em todos os componentes novos
- **Cores Primárias**:
  - Light Mode: `#1f2937` (azul escuro elegante)
  - Dark Mode: `#f59e0b` (laranja Alitools)
- **Transições**: 0.2s ease para mudanças de tema
- **Glassmorphism**: Usar efeitos de vidro quando apropriado

### 6.3. Classes de Componentes
- **Nomenclatura Obrigatória**:
  - Utilitárias: `.bg-base`, `.text-base`, `.border-base`
  - Componentes: `.product-card`, `.header-nav`, `.footer`
  - Estados: `.hover-lift`, `.animate-fadeIn`
- **Conversão**: Substituir classes Tailwind hardcoded por classes modulares
- **Consistência**: Manter padrões visuais em todos os componentes

## 7. Implementação de Funcionalidades Dinâmicas

### 7.1. Categorias Dinâmicas
- As categorias devem ser carregadas dinamicamente da API
- Exibir no máximo 6 categorias principais na página inicial
- Manter consistência nos ícones e cores para cada categoria
- Implementar fallback para categorias padrão em caso de falha na API
- Garantir carregamento otimizado e responsivo

### 7.2. Tratamento de Erros
- Exibir mensagens amigáveis para o usuário em caso de falha
- Manter logs detalhados para diagnóstico
- Implementar retentativas automáticas para falhas transitórias
- Fornecer opção para tentar novamente após falha

### 7.3. Performance e Acessibilidade
- Implementar cache para reduzir chamadas à API
- Otimizar imagens e assets
- Minimizar o tamanho do bundle JavaScript
- Utilizar carregamento preguiçoso (lazy loading) quando aplicável
- **OBRIGATÓRIO**: Focus management, skip links, ARIA labels
- **OBRIGATÓRIO**: Suporte completo a navegação por teclado
- Adaptar responsividade conforme as melhores práticas
- Garantir que todos os assets estejam armazenados localmente ou em CDN autorizada

## 8. Integração e Atualização
- Sincronizar dados de produtos, categorias e filtros com a API Geko em tempo real ou via cache controlado.
- Detectar e reportar mudanças na estrutura do site original.
- Atualizações automáticas devem ser precedidas de testes e validação.

## 9. Testes e Validação
- Gerar e executar testes automatizados para garantir fidelidade visual, funcional e de performance.
- **OBRIGATÓRIO**: Testar dark mode em todos os componentes
- **OBRIGATÓRIO**: Validar build process sem warnings CSS
- Validar integração com a API antes de cada deploy.
- Reportar falhas ou inconsistências imediatamente para intervenção humana.

## 10. Logs e Debugging

### 10.1. Estrutura de Logs
- **Desenvolvimento**: Logs detalhados de API calls, tema changes, component renders
- **Build Process**: Logs de CSS compilation, bundle size, warnings
- **User Actions**: Theme toggles, navigation, authentication state changes
- **Errors**: CSS import errors, component loading failures, API timeouts

### 10.2. Debugging Guidelines
- Usar console groups para organizar logs por feature
- Incluir timestamps e user context em logs importantes
- Separar logs por nível: info, warn, error
- Manter logs de performance para componentes críticos

## 11. Relatórios e Logs
- Manter logs detalhados de todas as ações, erros e decisões automáticas.
- Gerar relatórios periódicos de status e progresso.
- **OBRIGATÓRIO**: Documentar mudanças de CSS architecture
- **OBRIGATÓRIO**: Logs de performance de build e runtime

## 12. Procedimentos para Erros e Exceções
- Em caso de erro crítico, interromper execução e notificar responsável.
- Registrar detalhes do erro e sugerir soluções.
- Nunca tentar corrigir dados de produção sem validação humana.
- **CSS Errors**: Verificar ordem de imports, validar custom properties
- **Theme Errors**: Fallback para system theme, log error context

## 13. Expansão e Manutenção

### 13.1. Novos Componentes
- **OBRIGATÓRIO**: Seguir arquitetura CSS modular
- **OBRIGATÓRIO**: Implementar dark mode desde o início
- **OBRIGATÓRIO**: Usar classes de componente definidas
- Documentar novas classes em `components.css`

### 13.2. Updates e Refactoring
- Converter componentes existentes gradualmente
- Manter backwards compatibility durante transições
- Atualizar documentação a cada mudança significativa
- Testar em ambos os temas antes de commit

---

**Este documento foi atualizado para incluir as diretrizes de Dark Mode Modular implementado em v1.4.0 - 2025-01-20.**
