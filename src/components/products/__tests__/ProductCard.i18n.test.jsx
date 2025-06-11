import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

describe('ProductCard i18n', () => {
  const product = { id: 1, name: 'Produto Teste', price_gross: 100, image_url: '/placeholder-product.jpg' };

  it('exibe textos em inglês quando lng=en', () => {
    i18n.changeLanguage('en');
    render(
      <I18nextProvider i18n={i18n}>
        <ProductCard product={product} isAuthenticated={false} />
      </I18nextProvider>
    );
    expect(screen.getByText(/login to see price/i)).toBeInTheDocument();
  });

  it('exibe textos em português quando lng=pt', () => {
    i18n.changeLanguage('pt');
    render(
      <I18nextProvider i18n={i18n}>
        <ProductCard product={product} isAuthenticated={false} />
      </I18nextProvider>
    );
    expect(screen.getByText(/faça login para ver preço/i)).toBeInTheDocument();
  });
});
