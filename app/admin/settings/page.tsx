'use client';

import React, { useState, useEffect } from 'react';
import { 
  CogIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  CurrencyEuroIcon,
  BellIcon,
  EnvelopeIcon,
  ServerIcon,
  DocumentTextIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SystemSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  support_phone: string;
  company_address: string;
  currency: string;
  tax_rate: number;
  shipping_cost: number;
  free_shipping_threshold: number;
  email_notifications: boolean;
  order_approval_required: boolean;
  auto_stock_update: boolean;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_cart_items: number;
  session_timeout_minutes: number;
}

interface BackupInfo {
  last_backup: string;
  backup_size: string;
  backup_status: 'success' | 'error' | 'pending';
}

interface SystemStats {
  uptime: string;
  database_size: string;
  total_users: number;
  total_orders: number;
  cache_status: 'active' | 'inactive';
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'business' | 'security' | 'system'>('general');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
        setBackupInfo(data.backup);
        setSystemStats(data.stats);
        setError(null);
      } else {
        setError(data.error || 'Erro ao carregar configurações');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (formData: any) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Configurações salvas com sucesso!');
        await fetchSettings();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/admin/settings/backup', {
        method: 'POST'
      });

      if (response.ok) {
        setSuccess('Backup iniciado com sucesso!');
        await fetchSettings();
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao iniciar backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      setError('Erro de conexão');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
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
            Configurações do Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure parâmetros globais e administre o sistema
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* System Stats */}
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <ServerIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{systemStats.uptime}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <i className="fas fa-database text-2xl text-green-600 dark:text-green-400"></i>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">BD Size</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{systemStats.database_size}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <i className="fas fa-users text-2xl text-yellow-600 dark:text-yellow-400"></i>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Users</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{systemStats.total_users}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <i className="fas fa-shopping-cart text-2xl text-purple-600 dark:text-purple-400"></i>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Orders</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{systemStats.total_orders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <i className="fas fa-bolt text-2xl text-orange-600 dark:text-orange-400"></i>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cache</p>
                  <p className={`text-lg font-bold ${systemStats.cache_status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {systemStats.cache_status === 'active' ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'general', label: 'Geral', icon: CogIcon },
                { key: 'business', label: 'Negócio', icon: CurrencyEuroIcon },
                { key: 'security', label: 'Segurança', icon: ShieldCheckIcon },
                { key: 'system', label: 'Sistema', icon: ServerIcon }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {settings && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data: any = {};
            
            // Convert form data to object
            for (const [key, value] of formData.entries()) {
              if (key.includes('_enabled') || key.includes('_required') || key.includes('_mode')) {
                data[key] = value === 'on';
              } else if (key.includes('_rate') || key.includes('_cost') || key.includes('_threshold') || key.includes('_items') || key.includes('_minutes')) {
                data[key] = parseFloat(value as string) || 0;
              } else {
                data[key] = value;
              }
            }
            
            handleSaveSettings(data);
          }}>

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Configurações Gerais
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configurações básicas do site e informações da empresa
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome do Site
                    </label>
                    <input
                      type="text"
                      name="site_name"
                      defaultValue={settings.site_name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      defaultValue={settings.contact_email}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição do Site
                    </label>
                    <textarea
                      name="site_description"
                      rows={3}
                      defaultValue={settings.site_description}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefone de Suporte
                    </label>
                    <input
                      type="tel"
                      name="support_phone"
                      defaultValue={settings.support_phone}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Moeda
                    </label>
                    <select
                      name="currency"
                      defaultValue={settings.currency}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dólar ($)</option>
                      <option value="GBP">Libra (£)</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Endereço da Empresa
                    </label>
                    <textarea
                      name="company_address"
                      rows={2}
                      defaultValue={settings.company_address}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Business Tab */}
            {activeTab === 'business' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Configurações de Negócio
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Impostos, portes de envio e políticas de encomenda
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Taxa de IVA (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      name="tax_rate"
                      defaultValue={settings.tax_rate}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Custo de Envio (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="shipping_cost"
                      defaultValue={settings.shipping_cost}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor para Portes Grátis (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="free_shipping_threshold"
                      defaultValue={settings.free_shipping_threshold}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Máx. Itens no Carrinho
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      name="max_cart_items"
                      defaultValue={settings.max_cart_items}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="order_approval_required"
                        defaultChecked={settings.order_approval_required}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Exigir aprovação para todas as encomendas
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="email_notifications"
                        defaultChecked={settings.email_notifications}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Enviar notificações por email
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="auto_stock_update"
                        defaultChecked={settings.auto_stock_update}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Atualização automática de stock
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Configurações de Segurança
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Controle de acesso e configurações de segurança
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timeout de Sessão (minutos)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="1440"
                      name="session_timeout_minutes"
                      defaultValue={settings.session_timeout_minutes}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="registration_enabled"
                        defaultChecked={settings.registration_enabled}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Permitir registo público de utilizadores
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="maintenance_mode"
                        defaultChecked={settings.maintenance_mode}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Modo de manutenção (bloqueia acesso de clientes)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                {/* Backup Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Backup e Manutenção
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Gerir backups e operações de sistema
                    </p>
                  </div>

                  {backupInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Último Backup</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            backupInfo.backup_status === 'success' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : backupInfo.backup_status === 'error'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {backupInfo.backup_status === 'success' ? 'Sucesso' : 
                             backupInfo.backup_status === 'error' ? 'Erro' : 'Pendente'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                          {formatDate(backupInfo.last_backup)}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tamanho</span>
                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                          {backupInfo.backup_size}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <button
                          type="button"
                          onClick={handleBackup}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Criar Backup
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* System Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Informações do Sistema
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Next.js Version:</span>
                      <span className="text-gray-900 dark:text-white">15.3.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Node.js Version:</span>
                      <span className="text-gray-900 dark:text-white">v18.x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Database:</span>
                      <span className="text-gray-900 dark:text-white">PostgreSQL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Deployment:</span>
                      <span className="text-gray-900 dark:text-white">Production</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            {activeTab !== 'system' && (
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                >
                  {saving ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <CheckIcon className="h-5 w-5" />
                  )}
                  <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
} 