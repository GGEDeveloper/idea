import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext'; // USAR NOSSO AUTHCONTEXT
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
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import ProductCreatePage from './pages/admin/ProductCreatePage';
import ProductViewPage from './pages/admin/ProductViewPage';
import OrdersAdminPage from './pages/admin/OrdersAdminPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import OrderCreatePage from './pages/admin/OrderCreatePage';
import UsersAdminPage from './pages/admin/UsersAdminPage';
import UserCreatePage from './pages/admin/UserCreatePage';
import UserEditPage from './pages/admin/UserEditPage';
import ReportsPage from './pages/admin/ReportsPage';
import RolesPage from './pages/admin/RolesPage';
import SettingsPage from './pages/admin/SettingsPage';

// Componente para proteger rotas que requerem autenticação
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading, localUser } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Pode mostrar um spinner/loading aqui se desejar
    return <div className="text-center py-12">A verificar autenticação...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly && (!localUser || localUser.role_name !== 'admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Componente para redirecionar utilizadores autenticados para a página inicial (ex: de /login)
const RedirectIfAuthenticated = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center py-12">A verificar...</div>; 
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
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
          <Route path="/produtos/:ean" element={<ProductDetailPage />} />
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
            element={<CartPage />} // Lógica de autenticação para carrinho pode ser interna ao CartPage ou gerida aqui
          />
          
          {/* Rota de Não Autorizado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Rotas de Administração */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute adminOnly={true}>
                <ProductsAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/create"
            element={
              <ProtectedRoute adminOnly={true}>
                <ProductCreatePage />
              </ProtectedRoute>
            }
          />
          {/* A rota de edição também deve ser protegida e usar EAN */}
          <Route
            path="/admin/products/edit/:ean"
            element={
              <ProtectedRoute adminOnly={true}>
                <ProductEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/view/:ean"
            element={
              <ProtectedRoute adminOnly={true}>
                <ProductViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute adminOnly={true}>
                <OrdersAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:orderId"
            element={
              <ProtectedRoute adminOnly={true}>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/create"
            element={
              <ProtectedRoute adminOnly={true}>
                <OrderCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <UsersAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/create"
            element={
              <ProtectedRoute adminOnly={true}>
                <UserCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/edit/:userId"
            element={
              <ProtectedRoute adminOnly={true}>
                <UserEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute adminOnly={true}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute adminOnly={true}>
                <RolesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute adminOnly={true}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          
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
