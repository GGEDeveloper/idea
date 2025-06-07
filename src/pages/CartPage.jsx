// src/pages/CartPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { PlusIcon, MinusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <img src="/assets/images/empty-cart.svg" alt="Carrinho Vazio" className="mx-auto mb-8 h-64 w-64" />
        <h1 className="text-3xl font-semibold text-gray-700 mb-4">O seu carrinho está vazio!</h1>
        <p className="text-gray-500 mb-8">Parece que você ainda não adicionou nenhum produto. Que tal explorar nossos berbequins?</p>
        <Link
          to="/produtos"
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 sm:mb-10 text-center sm:text-left">Seu Carrinho de Compras</h1>

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
                            aria-label="Diminuir quantidade"
                          >
                            <MinusIcon className="h-5 w-5" />
                          </button>
                          <span className="px-3 py-1.5 text-md font-medium text-gray-700 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors rounded-r-md focus:outline-none"
                            aria-label="Aumentar quantidade"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors inline-flex items-center focus:outline-none"
                          aria-label="Remover item"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Remover
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
                    Continuar Comprando
                </Link>
                <button
                    onClick={clearCart}
                    className="px-5 py-2.5 border border-red-500 text-red-500 font-medium rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-colors text-sm"
                >
                    Limpar Carrinho
                </button>
            </div>
          </div>

          {/* Sumário do Pedido */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-4">Sumário do Pedido</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} itens)</span>
                  <span>€{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envio</span>
                  <span className="text-green-600 font-medium">GRÁTIS</span> {/* Placeholder */}
                </div>
                {/* Poderia adicionar cupom de desconto aqui */}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>€{getCartTotal().toFixed(2)}</span>
                </div>
              </div>
              <button
                // onClick={() => alert('Funcionalidade de Finalizar Compra em breve!')}
                className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
