'use client';

import React from 'react';
import './globals.css';
import Header from './components/Header';
import Footer from '../src/components/Footer';

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
        <Header />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
} 