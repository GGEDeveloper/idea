// src/pages/CartPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { PlusIcon, MinusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const CartPage = () => {
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <img src="/assets/images/empty-cart.svg" alt="Carrinho Vazio" className="mx-auto mb-8 h-64 w-64" />
        <h1 className="text-3xl font-semibold text-gray-700 mb-4">{t('cart.emptyTitle')}</h1>
        <p className="text-gray-500 mb-8">{t('cart.emptyMessage')}</p>
        <Link
          to="/produtos"
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {t('cart.viewProducts')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 sm:mb-10 text-center sm:text-left">
          {t('cart.pageTitle')}
        </h1>

        <div className="lg:flex lg:gap-8">
          {/* Itens do Carrinho */}
          <div className="lg:w-2/3">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <ul role="list" className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-4 sm:p-6">
                    <div className="flex items-center space-x-4 sm:space-x-6">
                      <div className="flex-shrink-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover border border-gray-200" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/produto/${item.id}`} className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
                        <p className="text-md font-medium text-gray-800 mt-2">€{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-3">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors rounded-l-md focus:outline-none"
                            aria-label={t('cart.decreaseQuantity')}
                          >
                            <MinusIcon className="h-5 w-5" />
                          </button>
                          <span className="px-3 py-1.5 text-md font-medium text-gray-700 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors rounded-r-md focus:outline-none"
                            aria-label={t('cart.increaseQuantity')}
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors inline-flex items-center focus:outline-none"
                          aria-label={t('cart.removeItem')}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          {t('cart.removeItem')}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <Link
                to="/produtos"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors group"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
                {t('cart.continueShopping')}
              </Link>
              <button
                onClick={clearCart}
                className="px-5 py-2.5 border border-red-500 text-red-500 font-medium rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-colors text-sm"
              >
                {t('cart.clearCart')}
              </button>
            </div>
          </div>

          {/* Sumário do Pedido */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-4">
                {t('cart.orderSummary')}
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>{t('cart.subtotal')}</p>
                  <p>€{getCartTotal().toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <p>{t('cart.shipping')}</p>
                  <p>{t('cart.free')}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <p>{t('cart.tax')}</p>
                  <p>€{(getCartTotal() * 0.23).toFixed(2)}</p>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>{t('cart.total')}</p>
                    <p>€{(getCartTotal() * 1.23).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <button
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium"
              >
                {t('cart.proceedToCheckout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
