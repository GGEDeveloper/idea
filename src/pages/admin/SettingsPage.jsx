import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CogIcon,
  CloudIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CheckIcon,
  InformationCircleIcon,
  CurrencyEuroIcon,
  CalculatorIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [settings, setSettings] = useState({
    theme: {
      defaultTheme: 'light',
      allowUserSelection: true,
      systemPreferenceOverride: false
    },
    site: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      supportEmail: ''
    },
    commerce: {
      allowGuestCheckout: false,
      requireOrderApproval: true,
      defaultCurrency: 'EUR',
      taxRate: 0.23
    },
    security: {
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireTwoFactor: false
    }
  });
  const [pricingConfig, setPricingConfig] = useState({});
  const [pricingStats, setPricingStats] = useState({});
  const [pricingFormData, setPricingFormData] = useState({});
  const [pricingHasChanges, setPricingHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({});
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    loadSettings();
    loadPricingConfig();
  }, []);

  // Avisar utilizador antes de sair com alterações pendentes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (pricingHasChanges) {
        e.preventDefault();
        e.returnValue = 'Tem alterações por guardar. Deseja realmente sair?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pricingHasChanges]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/all', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        toast.error('Erro ao carregar configurações');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const loadPricingConfig = async () => {
    try {
      setPricingLoading(true);
      const [configResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/pricing/config', { credentials: 'include' }),
        fetch('/api/admin/pricing/stats', { credentials: 'include' })
      ]);
      
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setPricingConfig(configData);
        // Inicializar dados do formulário com os valores atuais
        setPricingFormData({
          base_margin_percentage: configData.base_margin_percentage?.value || 25,
          currency_symbol: configData.currency_symbol?.value || '€',
          auto_update_prices_on_sync: configData.auto_update_prices_on_sync?.value || false
        });
        setPricingHasChanges(false);
      }
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setPricingStats(statsData);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de preços:', error);
      toast.error('Erro ao carregar configurações de preços');
    } finally {
      setPricingLoading(false);
    }
  };

  const updatePricingFormData = (key, value) => {
    setPricingFormData(prev => ({
      ...prev,
      [key]: value
    }));
    setPricingHasChanges(true);
  };

  const savePricingConfig = async () => {
    try {
      setSaving(true);
      
      // Preparar lista de configurações para atualizar
      const configs = [
        { config_key: 'base_margin_percentage', config_value: pricingFormData.base_margin_percentage },
        { config_key: 'currency_symbol', config_value: pricingFormData.currency_symbol },
        { config_key: 'auto_update_prices_on_sync', config_value: pricingFormData.auto_update_prices_on_sync }
      ];

      const response = await fetch('/api/admin/pricing/config/batch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ configs }),
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Configurações de preços guardadas com sucesso!');
        loadPricingConfig(); // Recarregar configurações e estatísticas
        setPricingHasChanges(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao guardar configurações de preços');
      }
    } catch (error) {
      console.error('Erro ao guardar configurações de preços:', error);
      toast.error('Erro ao guardar configurações de preços');
    } finally {
      setSaving(false);
    }
  };

  const resetPricingChanges = () => {
    setPricingFormData({
      base_margin_percentage: pricingConfig.base_margin_percentage?.value || 25,
      currency_symbol: pricingConfig.currency_symbol?.value || '€',
      auto_update_prices_on_sync: pricingConfig.auto_update_prices_on_sync?.value || false
    });
    setPricingHasChanges(false);
  };

  const recalculatePrices = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/pricing/recalculate', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`${result.message}. Processadas ${result.processed_variants} variantes em ${result.duration_ms}ms`);
        loadPricingConfig(); // Recarregar estatísticas
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao recalcular preços');
      }
    } catch (error) {
      console.error('Erro ao recalcular preços:', error);
      toast.error('Erro ao recalcular preços');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings/all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateThemeSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value
      }
    }));
  };

  const updateSiteSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      site: {
        ...prev.site,
        [key]: value
      }
    }));
  };

  const updateCommerceSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      commerce: {
        ...prev.commerce,
        [key]: value
      }
    }));
  };

  const updateSecuritySettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
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



  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base text-text-base p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-bg-tertiary rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-bg-secondary rounded-lg p-6">
                  <div className="h-6 bg-bg-tertiary rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-bg-tertiary rounded w-3/4"></div>
                    <div className="h-4 bg-bg-tertiary rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-base transition-colors duration-200">
      <div className="bg-bg-secondary border-b border-border-base">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CogIcon className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-text-base">Configurações do Sistema</h1>
                <p className="text-text-muted">Gerir definições gerais da plataforma</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {(pricingHasChanges || saving) && (
                <div className="flex items-center space-x-2 text-warning">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                  <span className="text-xs">Alterações pendentes</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-6 py-2 rounded-lg font-medium transition-all duration-200 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-base mb-4 flex items-center">
              <SunIcon className="h-6 w-6 text-warning mr-2" />
              Aparência e Tema
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-base mb-2">
                  Tema Padrão do Sistema
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateThemeSettings('defaultTheme', 'light')}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 text-left
                      ${settings.theme.defaultTheme === 'light'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-base bg-bg-base text-text-muted hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <SunIcon className="h-5 w-5" />
                      <span className="font-medium">Claro</span>
                    </div>
                    <p className="text-xs mt-1 opacity-75">Tema profissional padrão</p>
                  </button>
                  
                  <button
                    onClick={() => updateThemeSettings('defaultTheme', 'dark')}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 text-left
                      ${settings.theme.defaultTheme === 'dark'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-base bg-bg-base text-text-muted hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <MoonIcon className="h-5 w-5" />
                      <span className="font-medium">Escuro</span>
                    </div>
                    <p className="text-xs mt-1 opacity-75">Inspirado na Alitools</p>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-text-base">Permitir Escolha do Utilizador</label>
                  <p className="text-xs text-text-muted">Utilizadores podem alterar o tema</p>
                </div>
                <button
                  onClick={() => updateThemeSettings('allowUserSelection', !settings.theme.allowUserSelection)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                    ${settings.theme.allowUserSelection ? 'bg-primary' : 'bg-border-accent'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                      ${settings.theme.allowUserSelection ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-text-base">Sobrepor Preferências do Sistema</label>
                  <p className="text-xs text-text-muted">Ignorar configurações do browser</p>
                </div>
                <button
                  onClick={() => updateThemeSettings('systemPreferenceOverride', !settings.theme.systemPreferenceOverride)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                    ${settings.theme.systemPreferenceOverride ? 'bg-primary' : 'bg-border-accent'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                      ${settings.theme.systemPreferenceOverride ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-info font-medium">Tema Atual: {theme === 'dark' ? 'Escuro' : 'Claro'}</p>
                    <p className="text-text-muted text-xs mt-1">
                      As alterações aplicam-se a novos utilizadores e quando não têm preferência definida.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-base mb-4">Informações do Site</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-base mb-1">
                  Nome do Site
                </label>
                <input
                  type="text"
                  value={settings.site.siteName}
                  onChange={(e) => updateSiteSettings('siteName', e.target.value)}
                  className="input-field w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                  placeholder="IDEA - Ferramentas Profissionais"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-base mb-1">
                  Descrição do Site
                </label>
                <textarea
                  value={settings.site.siteDescription}
                  onChange={(e) => updateSiteSettings('siteDescription', e.target.value)}
                  rows={3}
                  className="input-field w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                  placeholder="Loja especializada em ferramentas profissionais"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-base mb-1">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={settings.site.contactEmail}
                  onChange={(e) => updateSiteSettings('contactEmail', e.target.value)}
                  className="input-field w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                  placeholder="info@idea-tools.pt"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-base mb-1">
                  Email de Suporte
                </label>
                <input
                  type="email"
                  value={settings.site.supportEmail}
                  onChange={(e) => updateSiteSettings('supportEmail', e.target.value)}
                  className="input-field w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                  placeholder="suporte@idea-tools.pt"
                />
              </div>
            </div>
          </div>

          <div className="card-glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-base mb-4">Configurações de Comércio</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-text-base">Permitir Checkout sem Registo</label>
                  <p className="text-xs text-text-muted">Utilizadores podem comprar sem criar conta</p>
                </div>
                <button
                  onClick={() => updateCommerceSettings('allowGuestCheckout', !settings.commerce.allowGuestCheckout)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                    ${settings.commerce.allowGuestCheckout ? 'bg-primary' : 'bg-border-accent'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                      ${settings.commerce.allowGuestCheckout ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-text-base">Aprovar Pedidos Manualmente</label>
                  <p className="text-xs text-text-muted">Pedidos requerem aprovação do admin</p>
                </div>
                <button
                  onClick={() => updateCommerceSettings('requireOrderApproval', !settings.commerce.requireOrderApproval)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                    ${settings.commerce.requireOrderApproval ? 'bg-primary' : 'bg-border-accent'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                      ${settings.commerce.requireOrderApproval ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-base mb-1">
                  Moeda Padrão
                </label>
                <select
                  value={settings.commerce.defaultCurrency}
                  onChange={(e) => updateCommerceSettings('defaultCurrency', e.target.value)}
                  className="input-field w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="GBP">Libra Esterlina (£)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-base mb-1">
                  Taxa de IVA (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={(settings.commerce.taxRate * 100).toFixed(2)}
                  onChange={(e) => updateCommerceSettings('taxRate', parseFloat(e.target.value) / 100)}
                  className="input-field w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                  placeholder="23.00"
                />
              </div>
            </div>
          </div>

          {/* Configurações de Preços */}
          <div className="card-glass rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-base flex items-center">
                <CurrencyEuroIcon className="h-6 w-6 text-primary mr-2" />
                Configurações de Preços
              </h2>
              {pricingHasChanges && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-warning">Alterações pendentes</span>
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            
            {pricingLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-bg-tertiary rounded w-3/4"></div>
                <div className="h-4 bg-bg-tertiary rounded w-1/2"></div>
                <div className="h-4 bg-bg-tertiary rounded w-2/3"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-base mb-1">
                    Margem Base (%)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="0.1"
                      value={pricingFormData.base_margin_percentage || 25}
                      onChange={(e) => updatePricingFormData('base_margin_percentage', parseFloat(e.target.value))}
                      className={`input-field flex-1 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 ${
                        pricingHasChanges ? 'border-warning/50 bg-warning/5' : ''
                      }`}
                      placeholder="25.0"
                    />
                    <span className="text-sm text-text-muted">%</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Margem aplicada sobre o preço de fornecedor para calcular o preço de venda
                  </p>
                  {pricingHasChanges && (
                    <p className="text-xs text-warning mt-1">
                      ⚠️ Pressione "Guardar" para aplicar as alterações
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-base mb-1">
                    Símbolo da Moeda
                  </label>
                  <input
                    type="text"
                    maxLength="3"
                    value={pricingFormData.currency_symbol || '€'}
                    onChange={(e) => updatePricingFormData('currency_symbol', e.target.value)}
                    className={`input-field w-20 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20 ${
                      pricingHasChanges ? 'border-warning/50 bg-warning/5' : ''
                    }`}
                    placeholder="€"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-text-base">Atualização Automática</label>
                    <p className="text-xs text-text-muted">Recalcular preços automaticamente na sincronização</p>
                  </div>
                  <button
                    onClick={() => updatePricingFormData('auto_update_prices_on_sync', 
                      !pricingFormData.auto_update_prices_on_sync)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                      ${pricingFormData.auto_update_prices_on_sync ? 'bg-primary' : 'bg-border-accent'}
                      ${pricingHasChanges ? 'ring-2 ring-warning/30' : ''}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                        ${pricingFormData.auto_update_prices_on_sync ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Botões de Ação */}
                <div className="flex space-x-3 pt-4 border-t border-border-base">
                  <button
                    onClick={savePricingConfig}
                    disabled={saving || !pricingHasChanges}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all duration-200
                      ${pricingHasChanges 
                        ? 'bg-primary text-white hover:bg-primary/80 hover-lift' 
                        : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {saving ? 'A guardar...' : 'Guardar Configurações'}
                  </button>
                  
                  {pricingHasChanges && (
                    <button
                      onClick={resetPricingChanges}
                      disabled={saving}
                      className="px-4 py-2 border border-border-accent text-text-muted rounded-lg hover:bg-bg-secondary transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                <div className="bg-info/10 border border-info/20 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <CalculatorIcon className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-info font-medium">Recálculo Manual de Preços</p>
                      <p className="text-text-muted text-xs mt-1">
                        Use esta opção para forçar o recálculo de todos os preços com a margem atual
                      </p>
                      <button
                        onClick={recalculatePrices}
                        disabled={saving || pricingHasChanges}
                        className={`
                          mt-2 px-3 py-1 rounded text-xs font-medium transition-colors
                          ${pricingHasChanges 
                            ? 'bg-bg-tertiary text-text-muted cursor-not-allowed' 
                            : 'bg-info text-white hover:bg-info/80'
                          }
                          disabled:opacity-50
                        `}
                      >
                        {saving ? 'Recalculando...' : 'Recalcular Todos os Preços'}
                      </button>
                      {pricingHasChanges && (
                        <p className="text-xs text-warning mt-1">
                          Guarde as configurações antes de recalcular
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Estatísticas de Preços */}
          <div className="card-glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-base mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 text-success mr-2" />
              Estatísticas de Preços
            </h2>
            
            {pricingLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-bg-tertiary rounded w-full"></div>
                <div className="h-4 bg-bg-tertiary rounded w-3/4"></div>
                <div className="h-4 bg-bg-tertiary rounded w-1/2"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Total de Variantes:</span>
                  <span className="text-sm font-medium text-text-base">
                    {pricingStats.total_variants || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Com Preço de Fornecedor:</span>
                  <span className="text-sm font-medium text-text-base">
                    {pricingStats.variants_with_supplier_price || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Com Preço de Venda:</span>
                  <span className="text-sm font-medium text-text-base">
                    {pricingStats.variants_with_base_selling_price || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Cobertura de Preços:</span>
                  <span className="text-sm font-medium text-text-base">
                    {pricingStats.price_coverage_percentage || 0}%
                  </span>
                </div>
                
                {pricingStats.avg_base_selling_price && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Preço Médio:</span>
                    <span className="text-sm font-medium text-text-base">
                      {pricingConfig.currency_symbol?.value || '€'}{Number(pricingStats.avg_base_selling_price).toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Margem Atual:</span>
                  <span className="text-sm font-medium text-primary">
                    {pricingStats.current_margin_percentage || 25}%
                  </span>
                </div>
                
                {pricingHasChanges && (
                  <div className="flex justify-between items-center bg-warning/10 -mx-3 px-3 py-2 rounded">
                    <span className="text-sm text-warning font-medium">Nova Margem (pendente):</span>
                    <span className="text-sm font-bold text-warning">
                      {pricingFormData.base_margin_percentage || 25}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card-glass rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-base mb-4">Configurações de Segurança</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-base mb-1">
                  Timeout de Sessão (minutos)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSecuritySettings('sessionTimeout', parseInt(e.target.value))}
                  className="input-field w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                  placeholder="30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-base mb-1">
                  Comprimento Mínimo da Palavra-passe
                </label>
                <input
                  type="number"
                  min="6"
                  max="32"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSecuritySettings('passwordMinLength', parseInt(e.target.value))}
                  className="input-field w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary/20"
                  placeholder="8"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-text-base">Autenticação de Dois Fatores</label>
                  <p className="text-xs text-text-muted">Requer 2FA para todas as contas</p>
                </div>
                <button
                  onClick={() => updateSecuritySettings('requireTwoFactor', !settings.security.requireTwoFactor)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                    ${settings.security.requireTwoFactor ? 'bg-primary' : 'bg-border-accent'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                      ${settings.security.requireTwoFactor ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-warning font-medium">Aviso de Segurança</p>
                    <p className="text-text-muted text-xs mt-1">
                      Alterações de segurança podem afetar utilizadores existentes. Use com precaução.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-bg-secondary rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-text-muted">
            <p>Última atualização das configurações por: {user?.name || 'Sistema'}</p>
            <p>Versão da plataforma: 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 