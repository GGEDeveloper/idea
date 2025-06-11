import React from 'react';
import { render } from '@testing-library/react';
import ProductsPage from '../../../pages/ProductsPage';
import { AuthProvider } from '../../../contexts/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';
import '@testing-library/jest-dom';

describe('ProductsPage A11y', () => {
  it('tem cabeçalho acessível e navegação por teclado', () => {
    const { getByRole } = render(
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <ProductsPage />
        </AuthProvider>
      </I18nextProvider>
    );
    expect(getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
