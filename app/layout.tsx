import React from 'react';
import './globals.css';
import HeaderAdvanced from './components/HeaderAdvanced';
import Footer from '../src/components/Footer';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';

export const metadata = {
  title: 'AliTools - Ferramentas Profissionais B2B',
  description: 'Plataforma B2B exclusiva para revendedores de ferramentas profissionais. Preços especiais e condições preferenciais.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <HeaderAdvanced />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
              <main className="flex-1" id="main-content">
                {children}
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 