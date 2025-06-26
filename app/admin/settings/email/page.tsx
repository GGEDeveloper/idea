'use client';

import React, { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface EmailConfig {
  config_id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  reply_to: string;
  is_enabled: boolean;
  has_password?: boolean;
}

export default function EmailSettingsPage() {
  const [config, setConfig] = useState<EmailConfig>({
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: false,
    smtp_user: '',
    smtp_password: '',
    from_email: 'noreply@alitools.pt',
    from_name: 'ALITOOLS',
    reply_to: 'support@alitools.pt',
    is_enabled: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [configExists, setConfigExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [keepPassword, setKeepPassword] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/email-config');
      const data = await response.json();

      if (data.config) {
        setConfig(data.config);
        setConfigExists(data.exists);
        if (data.config.has_password) {
          setKeepPassword(true);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const method = configExists ? 'PUT' : 'POST';
      const payload = {
        ...config,
        keep_password: keepPassword && configExists
      };

      const response = await fetch('/api/admin/email-config', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        if (!configExists) {
          setConfigExists(true);
          setConfig(prev => ({ ...prev, config_id: data.config_id }));
        }
        await fetchConfig(); // Recarregar para atualizar dados
      } else {
        setError(data.error || 'Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setError('Erro interno do servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setError('Digite um email para teste');
      return;
    }

    setTesting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/email-config/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_email: testEmail,
          use_current_config: configExists && config.is_enabled,
          ...(!configExists || !config.is_enabled ? config : {})
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Email de teste enviado com sucesso para ${testEmail}!`);
      } else {
        setError(data.error || 'Erro ao enviar email de teste');
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      setError('Erro interno do servidor');
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field: keyof EmailConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'smtp_password') {
      setKeepPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <EnvelopeIcon className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configurações de Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure o servidor SMTP para envio de emails automáticos
            </p>
          </div>
        </div>
      </div>

      {/* Status Current Config */}
      {configExists && (
        <div className={`mb-6 p-4 rounded-lg border ${
          config.is_enabled 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center space-x-3">
            {config.is_enabled ? (
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            )}
            <div>
              <h3 className={`font-medium ${
                config.is_enabled ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {config.is_enabled ? 'Configuração Ativa' : 'Configuração Inativa'}
              </h3>
              <p className={`text-sm ${
                config.is_enabled ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {config.is_enabled 
                  ? `Emails sendo enviados via ${config.smtp_host}:${config.smtp_port}`
                  : 'Esta configuração existe mas não está ativa'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-green-800 dark:text-green-400">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Configuration Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Configuração SMTP
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Server Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Servidor SMTP *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.smtp_host}
                    onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Porta *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="65535"
                    value={config.smtp_port}
                    onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Security */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.smtp_secure}
                    onChange={(e) => handleInputChange('smtp_secure', e.target.checked)}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Usar SSL/TLS (porta 465)
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Desmarque para STARTTLS (porta 587) ou sem segurança
                </p>
              </div>

              {/* Authentication */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Utilizador SMTP
                  </label>
                  <input
                    type="text"
                    value={config.smtp_user}
                    onChange={(e) => handleInputChange('smtp_user', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="seu.email@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password SMTP
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={config.smtp_password}
                      onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={config.has_password ? "••••••••" : "Password da aplicação"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {configExists && config.has_password && (
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={keepPassword}
                        onChange={(e) => setKeepPassword(e.target.checked)}
                        className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Manter password existente
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Email Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email "De" *
                  </label>
                  <input
                    type="email"
                    required
                    value={config.from_email}
                    onChange={(e) => handleInputChange('from_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="noreply@alitools.pt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome "De"
                  </label>
                  <input
                    type="text"
                    value={config.from_name}
                    onChange={(e) => handleInputChange('from_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ALITOOLS"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Reply-To
                </label>
                <input
                  type="email"
                  value={config.reply_to}
                  onChange={(e) => handleInputChange('reply_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="support@alitools.pt"
                />
              </div>

              {/* Enable/Disable */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.is_enabled}
                    onChange={(e) => handleInputChange('is_enabled', e.target.checked)}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ativar esta configuração
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Apenas uma configuração pode estar ativa por vez
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : (configExists ? 'Atualizar' : 'Criar')} Configuração
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Test & Info Sidebar */}
        <div className="space-y-6">
          {/* Test Email */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Testar Configuração
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email de teste
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testing || !testEmail}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? 'Enviando...' : 'Enviar Teste'}
                </button>
              </div>
            </div>
          </div>

          {/* Help & Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Configurações Comuns
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p className="mb-2"><strong>Gmail:</strong></p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• smtp.gmail.com:587 (STARTTLS)</li>
                    <li>• smtp.gmail.com:465 (SSL)</li>
                    <li>• Use password de aplicação</li>
                  </ul>
                  
                  <p className="mb-2 mt-3"><strong>Outlook:</strong></p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li>• smtp-mail.outlook.com:587</li>
                    <li>• STARTTLS habilitado</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 