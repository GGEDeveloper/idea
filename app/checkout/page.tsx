'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingBagIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface DeliveryInfo {
  fullName: string;
  company: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart, getCartTotal, getTotalItems, isInitialized, isLoading } = useCart();
  const { user, isAuthenticated, hasPermission } = useAuth();
  
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    fullName: '',
    company: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is authenticated and can create orders
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasPermission('create_order'))) {
      router.push('/login');
    }
  }, [isAuthenticated, hasPermission, isLoading, router]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setDeliveryInfo(prev => ({
        ...prev,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        company: user.company_name || ''
      }));
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (isInitialized && !isLoading && cartItems.length === 0 && !orderCreated) {
      router.push('/carrinho');
    }
  }, [cartItems, isInitialized, isLoading, orderCreated, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!deliveryInfo.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!deliveryInfo.address.trim()) {
      newErrors.address = 'Morada é obrigatória';
    }

    if (!deliveryInfo.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!deliveryInfo.postalCode.trim()) {
      newErrors.postalCode = 'Código postal é obrigatório';
    } else if (!/^\d{4}-\d{3}$/.test(deliveryInfo.postalCode)) {
      newErrors.postalCode = 'Formato inválido (ex: 1234-567)';
    }

    if (!deliveryInfo.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: cartItems,
          deliveryInfo
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Order created successfully
        setOrderDetails(data.order);
        setOrderCreated(true);
        
        // Clear cart
        clearCart();
        
        console.log('Encomenda criada com sucesso:', data.order.order_id);
      } else {
        throw new Error(data.error || 'Erro ao criar encomenda');
      }
    } catch (error: any) {
      console.error('Erro ao criar encomenda:', error);
      alert(`Erro ao criar encomenda: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = getTotalItems();
  const totalAmount = getCartTotal();

  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  // Order success state
  if (orderCreated && orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Encomenda Criada com Sucesso!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              A sua encomenda foi registada e está aguardando aprovação.
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Detalhes da Encomenda
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Número da Encomenda:</span>
                  <span className="font-medium">#{orderDetails.order_id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-yellow-600 font-medium">Aguardando Aprovação</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total de Itens:</span>
                  <span className="font-medium">{orderDetails.itemCount}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-bold text-lg">€{orderDetails.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Próximos Passos:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>A sua encomenda será revista pelo nosso administrador</li>
                    <li>Receberá uma confirmação quando for aprovada</li>
                    <li>Pode acompanhar o status na área "Minhas Encomendas"</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/minhas-encomendas"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ver Minhas Encomendas
              </Link>
              <br />
              <Link
                href="/produtos"
                className="inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Continuar a Comprar
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Finalizar Compra
          </h1>
          <Link
            href="/carrinho"
            className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Voltar ao Carrinho
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Information Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Informações de Entrega
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-white`}
                    placeholder="Nome completo"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Nome da empresa (opcional)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Morada *
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-white`}
                    placeholder="Rua, número, andar"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-white`}
                    placeholder="Cidade"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.postalCode 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-white`}
                    placeholder="1234-567"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.postalCode}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-white`}
                    placeholder="Número de telefone"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={deliveryInfo.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Instruções especiais de entrega, código de portão, etc. (opcional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Resumo da Encomenda
              </h3>

              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <i className="fas fa-cube"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.quantity}x €{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      €{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Envio</span>
                  <span className="text-green-600 dark:text-green-400">Gratuito</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span>Total</span>
                  <span>€{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CreditCardIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Forma de Pagamento</p>
                    <p>O pagamento será processado após aprovação da encomenda. Entraremos em contacto para acertar os detalhes.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando Encomenda...
                  </div>
                ) : (
                  <>
                    <ShoppingBagIcon className="h-5 w-5 inline mr-2" />
                    Confirmar Encomenda
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Ao confirmar a encomenda, concorda com os nossos termos e condições
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 