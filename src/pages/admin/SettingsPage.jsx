import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CogIcon,
  CloudIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({});
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        
        // Organizar dados por categoria para o formulário
        const organized = {};
        data.forEach(setting => {
          if (!organized[setting.category]) {
            organized[setting.category] = {};
          }
          organized[setting.category][setting.setting_key] = setting.setting_value;
        });
        setFormData(organized);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (category) => {
    setSaving(true);
    try {
      const categorySettings = formData[category] || {};
      const settingsToSave = Object.entries(categorySettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        category: category
      }));

      const response = await fetch('/api/admin/settings/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        fetchSettings(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (category, key, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const testGekoConnection = async () => {
    try {
      const response = await fetch('/api/admin/settings/test-geko');
      const result = await response.json();
      setTestResults(prev => ({
        ...prev,
        geko: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        geko: { success: false, message: 'Erro ao testar conexão' }
      }));
    }
  };

  const testDatabase = async () => {
    try {
      const response = await fetch('/api/admin/settings/test-database');
      const result = await response.json();
      setTestResults(prev => ({
        ...prev,
        database: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        database: { success: false, message: 'Erro ao testar base de dados' }
      }));
    }
  };

  const tabs = [
    { id: 'general', name: 'Geral', icon: CogIcon },
    { id: 'geko', name: 'API Geko', icon: CloudIcon },
    { id: 'sync', name: 'Sincronização', icon: ClockIcon },
    { id: 'security', name: 'Segurança', icon: ShieldCheckIcon }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Configurações do Sistema
              </h1>
              <p className="text-gray-600">
                Configure as definições da aplicação e integrações
              </p>
              {lastSaved && (
                <p className="text-sm text-green-600 mt-2">
                  Última atualização: {lastSaved.toLocaleString('pt-PT')}
                </p>
              )}
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Configurações Gerais</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Aplicação
                </label>
                <input
                  type="text"
                  value={formData.general?.app_name || ''}
                  onChange={(e) => handleInputChange('general', 'app_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="IDEA - Sistema de Gestão"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.general?.contact_email || ''}
                  onChange={(e) => handleInputChange('general', 'contact_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="admin@idea.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moeda Padrão
                </label>
                <select
                  value={formData.general?.default_currency || 'EUR'}
                  onChange={(e) => handleInputChange('general', 'default_currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="GBP">Libra (£)</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('general')}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'A guardar...' : 'Guardar Configurações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Geko API Settings */}
        {activeTab === 'geko' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Configurações da API Geko</h2>
              <button
                onClick={testGekoConnection}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Testar Conexão
              </button>
            </div>
            
            {testResults.geko && (
              <div className={`mb-4 p-3 rounded-md ${
                testResults.geko.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <div className="flex items-center">
                  {testResults.geko.success ? (
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  )}
                  {testResults.geko.message}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da API Geko
                </label>
                <input
                  type="url"
                  value={formData.geko?.api_url || ''}
                  onChange={(e) => handleInputChange('geko', 'api_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://b2b.geko.pl/en/xmlapi/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave da API
                </label>
                <input
                  type="password"
                  value={formData.geko?.api_key || ''}
                  onChange={(e) => handleInputChange('geko', 'api_key', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••-••••-••••-••••-••••••••••••"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('geko')}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'A guardar...' : 'Guardar Configurações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sync Settings */}
        {activeTab === 'sync' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Configurações de Sincronização</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalo de Sincronização de Produtos (minutos)
                </label>
                <select
                  value={formData.sync?.product_sync_interval || 60}
                  onChange={(e) => handleInputChange('sync', 'product_sync_interval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={180}>3 horas</option>
                  <option value={360}>6 horas</option>
                  <option value={720}>12 horas</option>
                  <option value={1440}>24 horas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margem de Preço Padrão (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.sync?.default_price_margin || 25}
                  onChange={(e) => handleInputChange('sync', 'default_price_margin', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  max="100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Margem aplicada sobre o preço de fornecedor da Geko
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('sync')}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'A guardar...' : 'Guardar Configurações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Configurações de Segurança</h2>
              <button
                onClick={testDatabase}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Testar Base de Dados
              </button>
            </div>

            {testResults.database && (
              <div className={`mb-4 p-3 rounded-md ${
                testResults.database.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                <div className="flex items-center">
                  {testResults.database.success ? (
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  )}
                  {testResults.database.message}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiração de Sessão (horas)
                </label>
                <select
                  value={formData.security?.session_timeout || 24}
                  onChange={(e) => handleInputChange('security', 'session_timeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={1}>1 hora</option>
                  <option value={8}>8 horas</option>
                  <option value={24}>24 horas</option>
                  <option value={72}>3 dias</option>
                  <option value={168}>1 semana</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Log
                </label>
                <select
                  value={formData.security?.log_level || 'info'}
                  onChange={(e) => handleInputChange('security', 'log_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="error">Apenas Erros</option>
                  <option value="warn">Avisos e Erros</option>
                  <option value="info">Informativo</option>
                  <option value="debug">Debug Completo</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('security')}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'A guardar...' : 'Guardar Configurações'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage; 