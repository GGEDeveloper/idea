import React from 'react';
import { Routes, Route } from 'react-router-dom'; // BrowserRouter está em main.jsx
import { Toaster } from 'react-hot-toast'; // Importar Toaster
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage'; // Nova página de produtos
import ProductDetailPage from './pages/ProductDetailPage'; // Página de detalhe do produto
import CartPage from './pages/CartPage'; // Página do Carrinho
import LoginPage from './pages/LoginPage'; // Importar LoginPage
import MyAccountPage from './pages/MyAccountPage'; // Importar MyAccountPage
import ProtectedRoute from './components/ProtectedRoute'; // Importar ProtectedRoute

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/produtos" element={<ProductsPage />} />
            <Route path="/produtos/:ean" element={<ProductDetailPage />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/minha-conta" element={<ProtectedRoute><MyAccountPage /></ProtectedRoute>} />
            {/* Exemplo de outras rotas que podemos adicionar:
            <Route path="/products/:id" element={<ProductPage />} />
            */}
          </Routes>
        </main>
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        <Footer />
      </div>
  );
}

export default App;
