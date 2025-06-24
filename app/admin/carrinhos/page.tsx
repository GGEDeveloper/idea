'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  EyeIcon, 
  TrashIcon, 
  CheckIcon,
  ClockIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  ean?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  brand?: string;
}

interface CartHistoryEntry {
  sessionId: string;
  action: 'created' | 'item_added' | 'item_removed' | 'quantity_changed' | 'cleared' | 'converted_to_order' | 'abandoned';
  timestamp: Date;
  details: any;
  userId: string;
}

interface UserCart {
  userId: string;
  userName: string;
  userEmail: string;
  company: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  lastActivity: Date;
  sessionId: string;
  activityCount: number;
  history: CartHistoryEntry[];
}

interface CartStats {
  totalCarts: number;
  totalItems: number;
  totalValue: number;
  averageCartValue: number;
  totalActivities: number;
}

export default function AdminCarrinhosPage() {
  const [carts, setCarts] = useState<UserCart[]>([]);
  const [stats, setStats] = useState<CartStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCart, setSelectedCart] = useState<UserCart | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/carts');
      const data = await response.json();

      if (response.ok) {
        setCarts(data.carts || []);
        setStats(data.stats);
        setError(null);
      } else {
        setError(data.error || 'Erro ao carregar carrinhos');
      }
    } catch (error) {
      console.error('Error fetching carts:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCarts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConvertToOrder = async (userId: string) => {
    if (!confirm('Converter este carrinho numa encomenda? O utilizador será notificado.')) return;

    try {
      setActionLoading(userId);
      const response = await fetch('/api/admin/carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, orderNote: 'Convertido pelo administrador' })
      });

      if (response.ok) {
        await fetchCarts();
        setSelectedCart(null);
        setShowDetails(false);
        alert('Carrinho convertido em encomenda com sucesso!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao converter carrinho');
      }
    } catch (error) {
      console.error('Error converting cart:', error);
      alert('Erro de conexão');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearCart = async (userId: string) => {
    if (!confirm('Limpar este carrinho? Esta ação não pode ser desfeita.')) return;

    try {
      setActionLoading(userId);
      const response = await fetch(`/api/admin/carts?userId=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCarts();
        setSelectedCart(null);
        setShowDetails(false);
        alert('Carrinho limpo com sucesso!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao limpar carrinho');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Erro de conexão');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewHistory = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/carts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        const cart = carts.find(c => c.userId === userId);
        if (cart) {
          setSelectedCart({
            ...cart,
            history: data.history
          });
          setShowHistory(true);
        }
      } else {
        alert('Erro ao carregar histórico');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      alert('Erro de conexão');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getActionLabel = (action: string) => {
    const labels = {
      created: 'Carrinho criado',
      item_added: 'Item adicionado',
      item_removed: 'Item removido',
      quantity_changed: 'Quantidade alterada',
      cleared: 'Carrinho limpo',
      converted_to_order: 'Convertido em encomenda',
      abandoned: 'Carrinho abandonado'
    };
    return labels[action as keyof typeof labels] || action;
  };

  const getActionColor = (action: string) => {
    const colors = {
      created: 'text-blue-600 dark:text-blue-400',
      item_added: 'text-green-600 dark:text-green-400',
      item_removed: 'text-red-600 dark:text-red-400',
      quantity_changed: 'text-yellow-600 dark:text-yellow-400',
      cleared: 'text-red-600 dark:text-red-400',
      converted_to_order: 'text-purple-600 dark:text-purple-400',
      abandoned: 'text-gray-600 dark:text-gray-400'
    };
    return colors[action as keyof typeof colors] || 'text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Carrinhos Pendentes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitorize e gerencie carrinhos de compras dos clientes
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <ShoppingCartIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carrinhos Ativos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCarts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <i className="fas fa-boxes text-2xl text-green-600 dark:text-green-400"></i>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Itens</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <CurrencyEuroIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carrinho Médio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.averageCartValue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Atividades</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalActivities}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Carts List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Carrinhos Pendentes ({carts.length})
              </h2>
              <button
                onClick={fetchCarts}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                Atualizar
              </button>
            </div>
          </div>

          {carts.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum carrinho pendente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Quando os clientes adicionarem produtos aos carrinhos, aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Itens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Última Atividade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Atividades
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {carts.map((cart) => (
                    <tr key={cart.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {cart.userName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {cart.userEmail}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {cart.company}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'itens'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {cart.items.slice(0, 2).map(item => item.name).join(', ')}
                          {cart.items.length > 2 && ` +${cart.items.length - 2} mais`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(cart.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(cart.lastActivity)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {cart.activityCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCart(cart);
                              setShowDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Ver detalhes"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewHistory(cart.userId)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            title="Ver histórico"
                          >
                            <ClockIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleConvertToOrder(cart.userId)}
                            disabled={actionLoading === cart.userId}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                            title="Converter em encomenda"
                          >
                            {actionLoading === cart.userId ? (
                              <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <CheckIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleClearCart(cart.userId)}
                            disabled={actionLoading === cart.userId}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            title="Limpar carrinho"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cart Details Modal */}
        {showDetails && selectedCart && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Carrinho de {selectedCart.userName}
                  </h3>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedCart(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                    Itens no Carrinho ({selectedCart.totalItems})
                  </h4>
                  <div className="space-y-3">
                    {selectedCart.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                            {item.brand && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.brand}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.quantity}x {formatCurrency(item.price)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total: {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Total do Carrinho:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(selectedCart.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleViewHistory(selectedCart.userId)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <ClockIcon className="h-4 w-4" />
                    <span>Ver Histórico</span>
                  </button>
                  <button
                    onClick={() => handleConvertToOrder(selectedCart.userId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Converter em Encomenda</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedCart(null);
                    }}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistory && selectedCart && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Histórico de Atividades - {selectedCart.userName}
                  </h3>
                  <button
                    onClick={() => {
                      setShowHistory(false);
                      setSelectedCart(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {selectedCart.history && selectedCart.history.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCart.history.map((entry, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className={`flex-shrink-0 h-3 w-3 rounded-full mt-2 ${getActionColor(entry.action).replace('text-', 'bg-')}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${getActionColor(entry.action)}`}>
                                {getActionLabel(entry.action)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(entry.timestamp)}
                              </span>
                            </div>
                            {entry.details && (
                              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                {entry.action === 'converted_to_order' && entry.details.orderId && (
                                  <>Encomenda #{entry.details.orderId.slice(0, 8)}... - {formatCurrency(entry.details.totalAmount)}</>
                                )}
                                {entry.action === 'cleared' && entry.details.itemCount && (
                                  <>{entry.details.itemCount} itens removidos - {formatCurrency(entry.details.totalAmount)}</>
                                )}
                                {(entry.action === 'item_added' || entry.action === 'item_removed') && entry.details.itemName && (
                                  <>{entry.details.itemName}</>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Nenhuma atividade registada
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowHistory(false);
                      setSelectedCart(null);
                    }}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 