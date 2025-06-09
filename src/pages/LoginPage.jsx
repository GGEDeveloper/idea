import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClerk, useSignIn } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { isSignedIn } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  // Redireciona se o usuário já estiver autenticado
  useEffect(() => {
    if (isSignedIn) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isSignedIn, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isSignInLoaded) {
      toast.error('Sistema de autenticação não carregado');
      return;
    }

    setIsLoading(true);
    
    try {
      // Tenta fazer login com o Clerk
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        // Define a sessão ativa
        await setActive({ session: result.createdSessionId });
        
        // Redireciona para a página de origem ou para a home
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        
        toast.success('Login realizado com sucesso!');
      } else {
        console.error('Falha no login:', result);
        toast.error('Não foi possível completar o login. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      
      // Tratamento de erros específicos do Clerk
      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        toast.error('E-mail não encontrado.');
      } else if (err.errors?.[0]?.code === 'form_password_incorrect') {
        toast.error('Senha incorreta.');
      } else {
        toast.error('Ocorreu um erro durante o login. Tente novamente.');
      }
    } finally {
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
