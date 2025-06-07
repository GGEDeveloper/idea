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
- Adaptar responsividade e acessibilidade conforme as melhores práticas.
- Garantir que todos os assets estejam armazenados localmente ou em CDN autorizada.

## 6. Integração e Atualização
- Sincronizar dados de produtos, categorias e filtros com a API Geko em tempo real ou via cache controlado.
- Detectar e reportar mudanças na estrutura do site original.
- Atualizações automáticas devem ser precedidas de testes e validação.

## 7. Testes e Validação
- Gerar e executar testes automatizados para garantir fidelidade visual, funcional e de performance.
- Validar integração com a API antes de cada deploy.
- Reportar falhas ou inconsistências imediatamente para intervenção humana.

## 8. Relatórios e Logs
- Manter logs detalhados de todas as ações, erros e decisões automáticas.
- Gerar relatórios periódicos de status e progresso.

## 9. Procedimentos para Erros e Exceções
- Em caso de erro crítico, interromper execução e notificar responsável.
- Registrar detalhes do erro e sugerir soluções.
- Nunca tentar corrigir dados de produção sem validação humana.

---

**Este documento será atualizado conforme as regras evoluírem.**
