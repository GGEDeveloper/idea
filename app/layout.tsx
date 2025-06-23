import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IDEA E-commerce Platform',
  description: 'B2B marketplace with Geko API integration',
  keywords: ['ecommerce', 'b2b', 'marketplace', 'geko'],
  authors: [{ name: 'IDEA E-commerce Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
} 