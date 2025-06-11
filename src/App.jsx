import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import MyAccountPage from './pages/MyAccountPage';
import About from './pages/About';
import ContactPage from './pages/ContactPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Componente para proteger rotas que requerem autenticação
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Acesso Restrito</h2>
          <p className="mb-6">Por favor, faça login para acessar esta página.</p>
          <Link 
            to={"/login?redirect=" + encodeURIComponent(window.location.pathname)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors inline-block"
          >
            Fazer Login
          </Link>
        </div>
      </SignedOut>
    </>
  );
};

// Componente para redirecionar usuários autenticados para a página inicial
const RedirectIfAuthenticated = ({ children }) => {
  return (
    <>
      <SignedIn>
        <div className="text-center py-12">
          <p className="mb-4">Você já está autenticado.</p>
          <Link to="/" className="text-indigo-600 hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </SignedIn>
      <SignedOut>
        {children}
      </SignedOut>
    </>
  );
};

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Efeito para adicionar/remover classe no body quando o menu móvel estiver aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
      // Desabilitar rolagem do body
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('mobile-menu-open');
      // Restaurar rolagem do body
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobileMenuOpen]);
  
  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-text-base">
      <Header onMobileMenuToggle={setIsMobileMenuOpen} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/produto/:ean" element={<ProductDetailPage />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<ContactPage />} />
          
          {/* Rota de Login (apenas para usuários não autenticados) */}
          <Route 
            path="/login" 
            element={
              <RedirectIfAuthenticated>
                <LoginPage />
              </RedirectIfAuthenticated>
            } 
          />
          
          {/* Rotas Protegidas */}
          <Route
            path="/minha-conta"
            element={
              <ProtectedRoute>
                <MyAccountPage />
              </ProtectedRoute>
            }
          />
          
          {/* Carrinho - Pode ser acessado por qualquer um, mas mostra mensagem se não estiver logado */}
          <Route 
            path="/carrinho" 
            element={
              <>
                <SignedIn>
                  <CartPage />
                </SignedIn>
                <SignedOut>
                  <CartPage />
                </SignedOut>
              </>
            } 
          />
          
          {/* Rota de Não Autorizado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Rota 404 - Página não encontrada */}
          <Route path="*" element={
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
              <Link 
                to="/" 
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Voltar para a página inicial
              </Link>
            </div>
          } />
        </Routes>
      </main>
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      <Footer />
    </div>
  );
}

export default App;
