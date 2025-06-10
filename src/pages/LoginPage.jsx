import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClerk, useSignIn, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { clerk } from '../lib/clerk';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('[LoginPage] Renderizado', { isSignedIn, isSignInLoaded });

  // Redireciona se o usuário já estiver autenticado
  useEffect(() => {
    console.log('[LoginPage] Efeito de redirecionamento', { isSignedIn, location });
    
    if (isSignedIn) {
      const from = location.state?.from?.pathname || location.state?.from || '/';
      console.log('[LoginPage] Usuário já autenticado, redirecionando para:', from);
      navigate(from, { replace: true });
    }
  }, [isSignedIn, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('[LoginPage] Tentando fazer login', { email });
    
    if (!isSignInLoaded) {
      const errorMsg = 'Sistema de autenticação não carregado';
      console.error(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validação básica
    if (!email || !password) {
      const errorMsg = 'Por favor, preencha todos os campos';
      console.error(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('[LoginPage] Iniciando processo de login');
      
      // Tenta fazer login com o Clerk
      const result = await signIn.create({
        identifier: email.trim(),
        password: password.trim(),
      });

      console.log('[LoginPage] Resposta do signIn.create:', result);

      if (result.status === 'complete') {
        console.log('[LoginPage] Login bem-sucedido, definindo sessão ativa');
        
        // Define a sessão ativa
        await setActive({ 
          session: result.createdSessionId,
          beforeEmit: () => {
            console.log('[LoginPage] Antes de redirecionar');
            toast.success('Login realizado com sucesso!');
          }
        });
        
        // Redireciona para a página de origem ou para a home
        const from = location.state?.from?.pathname || location.state?.from || '/';
        console.log('[LoginPage] Redirecionando para:', from);
        navigate(from, { replace: true });
        
      } else {
        const errorMsg = 'Não foi possível completar o login. Status: ' + result.status;
        console.error('[LoginPage] Falha no login:', result);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('[LoginPage] Erro no login:', err);
      
      // Tratamento detalhado de erros do Clerk
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0];
        console.error('[LoginPage] Código do erro:', error.code, 'Mensagem:', error.message);
        
        switch (error.code) {
          case 'form_identifier_not_found':
            toast.error('E-mail não encontrado. Verifique o endereço ou crie uma conta.');
            break;
          case 'form_password_incorrect':
            toast.error('Senha incorreta. Tente novamente ou redefina sua senha.');
            break;
          case 'form_param_format_invalid':
            toast.error('Formato de e-mail inválido.');
            break;
          case 'form_param_nil':
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            break;
          case 'form_code_incorrect':
            toast.error('Código de verificação incorreto.');
            break;
          case 'form_identifier_exists':
            toast.error('Este e-mail já está em uso. Tente fazer login ou recuperar sua senha.');
            break;
          case 'rate_limit_exceeded':
            toast.error('Muitas tentativas de login. Por favor, aguarde alguns minutos antes de tentar novamente.');
            break;
          default:
            toast.error(`Erro: ${error.message || 'Ocorreu um erro durante o login'}`);
        }
      } else {
        console.error('[LoginPage] Erro desconhecido:', err);
        toast.error('Não foi possível conectar ao servidor de autenticação. Tente novamente mais tarde.');
      }
    } finally {
      console.log('[LoginPage] Finalizando tentativa de login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Aceda à sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link 
              to="/contato" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              solicite acesso
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Endereço de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Futuramente: Opções como 'Esqueceu-se da password?' e 'Lembrar-me' */}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors"
            >
              {isLoading ? 'A entrar...' : 'Entrar'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Precisa de uma conta? Entre em contato conosco.
          </p>
          <Link 
            to="/contato" 
            className="mt-2 font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Solicitar Acesso
          </Link>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => openSignIn({})}
              className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline"
              type="button"
            >
              Problemas para fazer login? Tente outra opção
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
