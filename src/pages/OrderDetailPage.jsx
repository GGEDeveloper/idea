import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import {
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const OrderDetailPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, localUser } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/meus-pedidos');
      return;
    }

    fetchOrderDetails();
  }, [isAuthenticated, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Encomenda não encontrada');
        }
        throw new Error('Erro ao carregar detalhes da encomenda');
      }

      const data = await response.json();
      setOrder(data);

    } catch (err) {
      console.error('Erro ao buscar detalhes da encomenda:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      pending_approval: {
        label: 'Pendente Aprovação',
        icon: ClockIcon,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        description: 'A sua encomenda está a aguardar aprovação da nossa equipa.'
      },
      approved: {
        label: 'Aprovada',
        icon: CheckCircleIcon,
        className: 'bg-green-100 text-green-800 border-green-200',
        description: 'A sua encomenda foi aprovada e está a ser preparada.'
      },
      shipped: {
        label: 'Enviada',
        icon: TruckIcon,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'A sua encomenda foi enviada e está a caminho.'
      },
      delivered: {
        label: 'Entregue',
        icon: CheckCircleIcon,
        className: 'bg-green-100 text-green-800 border-green-200',
        description: 'A sua encomenda foi entregue com sucesso.'
      },
      cancelled: {
        label: 'Cancelada',
        icon: XCircleIcon,
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        description: 'Esta encomenda foi cancelada.'
      },
      rejected: {
        label: 'Rejeitada',
        icon: ExclamationTriangleIcon,
        className: 'bg-red-100 text-red-800 border-red-200',
        description: 'A sua encomenda foi rejeitada. Entre em contacto connosco para mais informações.'
      }
    };

    return statusConfig[status] || statusConfig.pending_approval;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateSubtotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.23; // IVA 23%
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar detalhes da encomenda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar encomenda</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchOrderDetails}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Tentar Novamente
            </button>
            <Link
              to="/meus-pedidos"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Voltar às Encomendas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Encomenda não encontrada</h2>
          <p className="text-gray-600 mb-6">A encomenda solicitada não existe ou não tem permissão para visualizá-la.</p>
          <Link
            to="/meus-pedidos"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Voltar às Encomendas
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.order_status);
  const StatusIcon = statusInfo.icon;
  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/meus-pedidos"
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar às Encomendas
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ClipboardDocumentListIcon className="h-8 w-8 mr-3" />
                Encomenda #{order.order_id.slice(-8)}
              </h1>
              <p className="mt-2 text-gray-600">
                Criada em {formatDate(order.order_date)}
              </p>
            </div>
            
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Status da Encomenda */}
        <div className={`bg-white border-l-4 p-6 rounded-lg shadow-sm mb-8 ${statusInfo.className}`}>
          <div className="flex items-center">
            <StatusIcon className="h-8 w-8 mr-4" />
            <div>
              <h2 className="text-xl font-semibold">{statusInfo.label}</h2>
              <p className="mt-1 text-sm opacity-90">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Itens da Encomenda */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ShoppingBagIcon className="h-6 w-6 mr-2" />
                  Itens da Encomenda ({order.items?.length || 0})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {order.items?.map((item, index) => (
                  <div key={item.order_item_id || index} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          EAN: {item.product_ean}
                        </p>
                        {item.current_product_name && item.current_product_name !== item.product_name && (
                          <p className="text-xs text-blue-600 mt-1">
                            Nome atual: {item.current_product_name}
                          </p>
                        )}
                        {item.product_active === false && (
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ Produto já não está ativo
                          </p>
                        )}
                        <div className="flex items-center mt-3 space-x-6">
                          <div>
                            <span className="text-sm text-gray-500">Preço unitário:</span>
                            <p className="text-lg font-semibold text-indigo-600">
                              {formatCurrency(item.price_at_purchase)}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Quantidade:</span>
                            <p className="text-lg font-medium text-gray-900">
                              {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Total:</span>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(item.price_at_purchase * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

              {/* Detalhes da Encomenda */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Data da Encomenda</p>
                    <p className="font-medium">{formatDate(order.order_date)}</p>
                  </div>
                </div>
                
                {order.updated_at !== order.order_date && (
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Última Atualização</p>
                      <p className="font-medium">{formatDate(order.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cálculos Financeiros */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-base text-gray-900">
                  <p>Subtotal</p>
                  <p>{formatCurrency(subtotal)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <p>IVA (23%)</p>
                  <p>{formatCurrency(tax)}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <p>Total</p>
                    <p>{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-3">
                <button
                  onClick={handlePrint}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors font-medium flex items-center justify-center"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Imprimir Encomenda
                </button>
                
                <Link
                  to="/produtos"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium text-center block"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 