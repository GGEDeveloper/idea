import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import {
  ShoppingCartIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart, updateQuantity, removeFromCart } = useContext(CartContext);
  const { isAuthenticated, localUser } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    // Redirect se não autenticado
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    // Redirect se carrinho vazio
    if (!cart || cart.length === 0) {
      navigate('/carrinho');
      return;
    }
  }, [isAuthenticated, cart, navigate]);

  const validateCheckout = () => {
    if (!cart || cart.length === 0) {
      setError('O carrinho está vazio');
      return false;
    }

    for (const item of cart) {
      if (!item.ean || !item.quantity || item.quantity <= 0) {
        setError('Existe um item inválido no carrinho');
        return false;
      }
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateCheckout()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar dados da encomenda
      const orderData = {
        items: cart.map(item => ({
          ean: item.ean,
          quantity: item.quantity
        })),
        notes: orderNotes.trim() || undefined
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar encomenda');
      }

      const newOrder = await response.json();
      
      // Sucesso - limpar carrinho e mostrar confirmação
      setOrderDetails(newOrder);
      setSuccess(true);
      clearCart();

    } catch (err) {
      console.error('Erro ao submeter encomenda:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.23; // IVA 23%
  };

  const calculateTotal = () => {
    const subtotal = getCartTotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  // Página de sucesso
  if (success && orderDetails) {
    return (
      <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Encomenda Criada com Sucesso!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              A sua encomenda foi submetida e está pendente de aprovação.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Número da Encomenda:</span>
                  <p className="font-medium">#{orderDetails.order_id.slice(-8)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-medium text-yellow-600">Pendente Aprovação</p>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <p className="font-medium">{formatCurrency(orderDetails.total_amount)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Data:</span>
                  <p className="font-medium">
                    {new Date(orderDetails.order_date).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/minha-conta?section=orderHistory')}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium"
              >
                Ver Histórico de Encomendas
              </button>
              <button
                onClick={() => navigate('/produtos')}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors font-medium"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isAuthenticated || !cart) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/carrinho')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar ao Carrinho
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CreditCardIcon className="h-8 w-8 mr-3" />
            Finalizar Encomenda
          </h1>
          <p className="mt-2 text-gray-600">
            Reveja os seus itens e confirme a sua encomenda
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Itens da Encomenda */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ShoppingCartIcon className="h-6 w-6 mr-2" />
                  Itens da Encomenda ({cart.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item.ean} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          EAN: {item.ean}
                        </p>
                        <p className="text-lg font-semibold text-indigo-600 mt-2">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => updateQuantity(item.ean, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-l border-r border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.ean, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800"
                          >
                            +
                          </button>
                        </div>
                        
                        <p className="text-lg font-semibold text-gray-900 w-24 text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        
                        <button
                          onClick={() => removeFromCart(item.ean)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas da Encomenda */}
            <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notas da Encomenda (Opcional)
              </h3>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Adicione qualquer informação adicional sobre a sua encomenda..."
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Resumo da Encomenda */}
          <div>
            <div className="bg-white shadow-lg rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-4 mb-4">
                Resumo da Encomenda
              </h2>
              
              {/* Informações do Cliente */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Cliente:</h3>
                <p className="text-sm text-gray-700">
                  {localUser?.first_name} {localUser?.last_name}
                </p>
                <p className="text-sm text-gray-700">{localUser?.email}</p>
                {localUser?.company_name && (
                  <p className="text-sm text-gray-700">{localUser?.company_name}</p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-base text-gray-900">
                  <p>Subtotal</p>
                  <p>{formatCurrency(getCartTotal())}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <p>IVA (23%)</p>
                  <p>{formatCurrency(calculateTax(getCartTotal()))}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <p>Total</p>
                    <p>{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-6 p-4 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-800 mb-2">Importante:</p>
                <p>A sua encomenda será submetida para aprovação. Receberá uma confirmação assim que for processada pela nossa equipa.</p>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={loading || cart.length === 0}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    A processar...
                  </span>
                ) : (
                  'Confirmar Encomenda'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 