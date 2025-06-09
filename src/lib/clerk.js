import { Clerk } from '@clerk/clerk-js';

// Verifica se a chave pública está definida
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Chave pública do Clerk não encontrada. Verifique suas variáveis de ambiente.');
}

// Inicializa o Clerk com a chave pública
export const clerk = new Clerk(publishableKey);

export const clerkConfig = {
  // Desativa o registro direto de acordo com as regras do projeto
  signUp: {
    disable: true,
  },
  // Configurações adicionais podem ser adicionadas aqui
};

// Função auxiliar para verificar permissões
export const hasRole = (user, role) => {
  return user?.publicMetadata?.roles?.includes(role) || false;
};

// Função para redirecionar para a página de contato para solicitação de acesso
export const redirectToContactForAccess = (navigate) => {
  navigate('/contato', {
    state: { message: 'Para solicitar acesso à plataforma, preencha o formulário de contato.' }
  });
};
