import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductGrid from '../ProductGrid';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

describe('ProductGrid', () => {
  const products = [
    { id: 1, name: 'Produto 1', price_gross: 10, image_url: '/placeholder-product.jpg' },
    { id: 2, name: 'Produto 2', price_gross: 20, image_url: '/placeholder-product.jpg' },
  ];

  it('renderiza todos os produtos', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ProductGrid 
          products={products} 
          isAuthenticated={false} 
          hasPermission={() => false} 
          onLog={() => {}} 
        />
      </I18nextProvider>
    );
    expect(screen.getByText('Produto 1')).toBeInTheDocument();
    expect(screen.getByText('Produto 2')).toBeInTheDocument();
  });
});
