'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon as CheckCircle2, 
  XCircleIcon as XCircle, 
  ClockIcon as Clock, 
  ArrowTrendingUpIcon as TrendingUp, 
  ArrowTrendingDownIcon as TrendingDown, 
  CubeIcon as Package, 
  ExclamationTriangleIcon as AlertTriangle,
  ArrowPathIcon as RefreshCw,
  FunnelIcon as Filter,
  EyeIcon as Eye,
  TrashIcon as Trash2,
  PlayIcon as Play,
  ChartBarIcon as BarChart3
} from '@heroicons/react/24/outline';

interface PendingUpdate {
  update_id: number;
  ean: string;
  current_supplier_price: number;
  new_supplier_price: number;
  current_stock_quantity: number;
  new_stock_quantity: number;
  price_change_percentage: number;
  detected_at: string;
  expires_at: string;
  status: string;
  product_name: string;
  brand: string;
  price_trend: 'increase' | 'decrease' | 'no_change';
  stock_trend: 'increase' | 'decrease' | 'no_change';
  days_until_expiry: number;
  geko_sync_batch_id: string;
  raw_geko_data: any;
}

interface ApprovalStats {
  pending?: { count: number; avgPriceChange: number; priceIncreases: number; priceDecreases: number };
  approved?: { count: number; avgPriceChange: number; priceIncreases: number; priceDecreases: number };
  rejected?: { count: number; avgPriceChange: number; priceIncreases: number; priceDecreases: number };
}

export default function GekoApprovalsManager() {
  const [updates, setUpdates] = useState<PendingUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedUpdates, setSelectedUpdates] = useState<number[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({});
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/pricing/geko-approvals?status=${selectedStatus}&page=${pagination.page}&limit=${pagination.limit}`
      );
      const data = await response.json();

      if (data.success) {
        setUpdates(data.data.updates);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Erro ao buscar updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (action: 'approve' | 'reject') => {
    if (selectedUpdates.length === 0) return;

    try {
      setProcessing(true);
      const response = await fetch('/api/admin/pricing/geko-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          updateIds: selectedUpdates,
          notes: notes.trim() || undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedUpdates([]);
        setNotes('');
        await fetchUpdates();
        
        // Show success message
        alert(`${action === 'approve' ? 'Aprovados' : 'Rejeitados'} com sucesso!`);
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error(`Erro ao ${action}:`, error);
      alert(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} updates`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUpdates.length === updates.length) {
      setSelectedUpdates([]);
    } else {
      setSelectedUpdates(updates.map(u => u.update_id));
    }
  };

  const cleanupExpired = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/admin/pricing/geko-approvals', {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`${data.data.deletedCount} updates expirados removidos`);
        await fetchUpdates();
      }
    } catch (error) {
      console.error('Erro ao limpar updates expirados:', error);
    } finally {
      setProcessing(false);
    }
  };

  const simulateUpdate = async (ean?: string) => {
    try {
      setProcessing(true);
      
      // Se não fornecido EAN, buscar um produto aleatório
      if (!ean) {
        const productsResponse = await fetch('/api/admin/pricing/geko-approvals/simulate?limit=50');
        const productsData = await productsResponse.json();
        
        if (productsData.success && productsData.data.products.length > 0) {
          const availableProducts = productsData.data.products.filter((p: any) => !p.has_pending_update);
          if (availableProducts.length > 0) {
            const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
            ean = randomProduct.ean;
          }
        }
      }

      if (!ean) {
        alert('Nenhum produto disponível para simulação');
        return;
      }

      const response = await fetch('/api/admin/pricing/geko-approvals/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ean })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Update simulado criado: ${data.message}`);
        if (selectedStatus === 'pending') {
          await fetchUpdates();
        }
      } else {
        alert(`Erro na simulação: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao simular update:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 4
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT');
  };

  const getTrendIcon = (trend: string, type: 'price' | 'stock') => {
    const baseClasses = "w-4 h-4";
    
    if (trend === 'increase') {
      return <TrendingUp className={`${baseClasses} text-green-500`} />;
    } else if (trend === 'decrease') {
      return <TrendingDown className={`${baseClasses} text-red-500`} />;
    }
    return <Package className={`${baseClasses} text-gray-400`} />;
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <Clock className="w-3 h-3 mr-1" />
          Pendente
        </span>;
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Aprovado
        </span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <XCircle className="w-3 h-3 mr-1" />
          Rejeitado
        </span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [selectedStatus, pagination.page]);

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🔄 Aprovações de Preços da Geko
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={cleanupExpired}
              disabled={processing}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1 inline" />
              Limpar Expirados
            </button>
            <button
              onClick={() => simulateUpdate()}
              disabled={processing}
              className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4 mr-1 inline" />
              Simular Update
            </button>
            <button
              onClick={fetchUpdates}
              disabled={loading}
              className="px-3 py-2 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-1 inline ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats).map(([status, data]) => (
            <div key={status} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {status === 'pending' ? 'Pendentes' : status === 'approved' ? 'Aprovados' : 'Rejeitados'}
                </h4>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.count}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Média: {data.avgPriceChange?.toFixed(1)}%
                </div>
                <div className="flex items-center space-x-4 mt-1 text-xs">
                  <span className="text-green-600">
                    ↑ {data.priceIncreases} aumentos
                  </span>
                  <span className="text-red-600">
                    ↓ {data.priceDecreases} diminuições
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>
      </div>

      {/* Actions para updates pendentes */}
      {selectedStatus === 'pending' && updates.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUpdates.length === updates.length}
                  onChange={handleSelectAll}
                  className="form-checkbox rounded text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Selecionar todos ({selectedUpdates.length}/{updates.length})
                </span>
              </label>
            </div>
            
            {selectedUpdates.length > 0 && (
              <div className="flex items-center space-x-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas da aprovação/rejeição (opcional)"
                  className="w-64 h-8 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg resize-none dark:bg-gray-700 dark:text-white text-sm"
                />
                <button
                  onClick={() => handleApproveReject('approve')}
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1 inline" />
                  Aprovar ({selectedUpdates.length})
                </button>
                <button
                  onClick={() => handleApproveReject('reject')}
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 mr-1 inline" />
                  Rejeitar ({selectedUpdates.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de updates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Carregando updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum update {selectedStatus === 'pending' ? 'pendente' : selectedStatus} encontrado
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {selectedStatus === 'pending' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Selecionar
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Preço Atual → Novo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock Atual → Novo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mudança %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Detectado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {updates.map((update) => (
                  <tr key={update.update_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {selectedStatus === 'pending' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUpdates.includes(update.update_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUpdates([...selectedUpdates, update.update_id]);
                            } else {
                              setSelectedUpdates(selectedUpdates.filter(id => id !== update.update_id));
                            }
                          }}
                          className="form-checkbox rounded text-blue-600"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-48">
                          {update.product_name || 'Produto sem nome'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {update.brand && <span className="mr-2">{update.brand}</span>}
                          <span className="font-mono text-xs">{update.ean}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatPrice(update.current_supplier_price || 0)}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(update.new_supplier_price)}
                        </span>
                        {getTrendIcon(update.price_trend, 'price')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {update.current_stock_quantity || 0}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {update.new_stock_quantity}
                        </span>
                        {getTrendIcon(update.stock_trend, 'stock')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {update.price_change_percentage !== null ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          update.price_change_percentage > 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {update.price_change_percentage > 0 ? '+' : ''}{update.price_change_percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        {formatDate(update.detected_at)}
                      </div>
                      {update.days_until_expiry !== null && update.days_until_expiry < 7 && (
                        <div className="flex items-center mt-1 text-xs text-orange-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Expira em {Math.max(0, Math.floor(update.days_until_expiry))} dias
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(update.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setShowDetails(showDetails === update.update_id ? null : update.update_id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando página {pagination.page} de {pagination.totalPages} 
                ({pagination.total} total)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalhes do Update #{showDetails}
              </h4>
              <button
                onClick={() => setShowDetails(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {updates.find(u => u.update_id === showDetails) && (
              <div className="space-y-4">
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(updates.find(u => u.update_id === showDetails), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 