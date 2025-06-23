'use client';

import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

// We can't use metadata in client components, so we'll set it differently
// export const metadata: Metadata = {
//   title: 'AliTools - A Marca das Marcas',
//   description: 'Ferramentas profissionais para revendedores',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    // Set page metadata programmatically in client component
    document.title = 'AliTools - A Marca das Marcas';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Ferramentas profissionais para revendedores');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Ferramentas profissionais para revendedores';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <html lang="pt">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
} 