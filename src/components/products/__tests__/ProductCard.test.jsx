import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

describe('ProductCard', () => {
  const baseProduct = {
    id: 1,
    name: 'Martelo de Teste',
    price_gross: 100,
    stockquantity: 5,
    ean: '1234567890123',
    image_url: '/placeholder-product.jpg',
  };

  it('exibe nome e imagem do produto', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ProductCard product={baseProduct} />
      </I18nextProvider>
    );
    expect(screen.getByText('Martelo de Teste')).toBeInTheDocument();
    expect(screen.getByAltText('Martelo de Teste')).toBeInTheDocument();
  });

  it('exibe mensagem de login para ver preço se não autenticado', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ProductCard product={baseProduct} isAuthenticated={false} />
      </I18nextProvider>
    );
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('exibe preço ajustado para autenticado com permissão', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ProductCard 
          product={baseProduct} 
          isAuthenticated={true} 
          hasPermission={perm => perm === 'view_price'}
        />
      </I18nextProvider>
    );
    expect(screen.getByText('€115,00')).toBeInTheDocument();
  });

  it('exibe stock apenas para autenticado com permissão', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ProductCard 
          product={baseProduct} 
          isAuthenticated={true} 
          hasPermission={perm => perm === 'view_stock'}
        />
      </I18nextProvider>
    );
    expect(screen.getByText(/Stock:/)).toBeInTheDocument();
  });
});
