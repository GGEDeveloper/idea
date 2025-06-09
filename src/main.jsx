import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n'; // Initialize i18next
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ClerkProvider } from './providers/ClerkProvider';

// Carrega as variáveis de ambiente necessárias
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const frontendApi = import.meta.env.VITE_CLERK_FRONTEND_API;

// Verifica se as variáveis de ambiente necessárias estão definidas
if (!publishableKey || !frontendApi) {
  console.error('Erro: Variáveis de ambiente do Clerk não configuradas corretamente.');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);
