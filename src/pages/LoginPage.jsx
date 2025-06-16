// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Usar o nosso AuthContext
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // isLoading e authError agora vêm do nosso AuthContext
  const { login, isLoading, authError, isAuthenticated, localUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // console.log('[LoginPage] Renderizado:', { isAuthenticated, isLoading, authError });

  // Redireciona se o utilizador já estiver autenticado
  useEffect(() => {
    // console.log('[LoginPage] Efeito de redirecionamento:', { isAuthenticated, localUser });
    if (isAuthenticated && localUser) {
      const from = location.state?.from?.pathname || location.state?.from || '/';
      // console.log('[LoginPage] Utilizador já autenticado, redirecionando para:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, localUser, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('[LoginPage] Tentando login com credenciais locais:', { email });

    if (!email || !password) {
      toast.error('Por favor, preencha o email e a password.');
      return;
    }

    // A função login do AuthContext já trata de setIsLoading e authError
    const result = await login(email.trim(), password.trim());

    if (result && result.success) {
      // A notificação de sucesso e o redirecionamento são tratados dentro da função login do AuthContext
      // (após fetchUserProfile ser bem-sucedido)
      // toast.success('Login realizado com sucesso!'); // Pode ser redundante se AuthContext já o fizer
    } else {
      // O authError no AuthContext será atualizado pela função login e exibido no JSX abaixo.
      // Se desejar um toast de erro aqui também:
      // toast.error(result.error || 'Falha no login. Verifique as suas credenciais.');
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

          {authError && (
            <div className="mt-2 text-center text-sm text-red-600">
              {authError}
            </div>
          )}

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