'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  // Dados empresariais obrigatórios
  company_name: string;
  vat_number: string;
  economic_activity_code: string;
  monthly_purchase_forecast: number;
  website_url: string;
  
  // Morada de facturação
  billing_address: string;
  billing_postal_code: string;
  billing_city: string;
  
  // Contacto principal
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_position: string;
  
  // Opcionais
  delivery_address?: string;
  delivery_postal_code?: string;
  delivery_city?: string;
  
  // Fornecedores habituais (opcional)
  suppliers: Array<{
    company_name: string;
    contact_name: string;
    phone: string;
    location: string;
  }>;
  
  comments?: string;
}

export default function PedidoCooperacao() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    vat_number: '',
    economic_activity_code: '',
    monthly_purchase_forecast: 0,
    website_url: '',
    billing_address: '',
    billing_postal_code: '',
    billing_city: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_position: '',
    suppliers: [],
    comments: ''
  });

  // Validação do NIF português
  const validateNIF = (nif: string): boolean => {
    if (!/^\d{9}$/.test(nif)) return false;
    
    const digits = nif.split('').map(Number);
    const sum = digits.slice(0, 8).reduce((acc, digit, index) => {
      return acc + digit * (9 - index);
    }, 0);
    
    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? 0 : 11 - remainder;
    
    return checkDigit === digits[8];
  };

  // Validação de email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validação de código postal português
  const validatePostalCode = (code: string): boolean => {
    return /^\d{4}-\d{3}$/.test(code);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Nome da empresa é obrigatório';
    }

    if (!formData.vat_number.trim()) {
      newErrors.vat_number = 'NIF é obrigatório';
    } else if (!validateNIF(formData.vat_number)) {
      newErrors.vat_number = 'NIF inválido';
    }

    if (!formData.economic_activity_code.trim()) {
      newErrors.economic_activity_code = 'Código de atividade económica é obrigatório';
    }

    if (!formData.monthly_purchase_forecast || formData.monthly_purchase_forecast <= 0) {
      newErrors.monthly_purchase_forecast = 'Previsão de compras deve ser maior que 0';
    }

    if (!formData.billing_address.trim()) {
      newErrors.billing_address = 'Morada de facturação é obrigatória';
    }

    if (!formData.billing_postal_code.trim()) {
      newErrors.billing_postal_code = 'Código postal é obrigatório';
    } else if (!validatePostalCode(formData.billing_postal_code)) {
      newErrors.billing_postal_code = 'Código postal deve ter formato 0000-000';
    }

    if (!formData.billing_city.trim()) {
      newErrors.billing_city = 'Cidade é obrigatória';
    }

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'Nome do contacto é obrigatório';
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Email é obrigatório';
    } else if (!validateEmail(formData.contact_email)) {
      newErrors.contact_email = 'Email inválido';
    }

    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = 'Telefone é obrigatório';
    }

    // Validações opcionais
    if (formData.delivery_postal_code && !validatePostalCode(formData.delivery_postal_code)) {
      newErrors.delivery_postal_code = 'Código postal deve ter formato 0000-000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSupplier = () => {
    setFormData(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, { company_name: '', contact_name: '', phone: '', location: '' }]
    }));
  };

  const removeSupplier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter((_, i) => i !== index)
    }));
  };

  const updateSupplier = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map((supplier, i) => 
        i === index ? { ...supplier, [field]: value } : supplier
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pedido-cooperacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/pedido-enviado');
      } else {
        const error = await response.json();
        setErrors({ submit: error instanceof Error ? error.message : 'Erro ao submeter pedido' });
      }
    } catch (error) {
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-base">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Pedido de Cooperação B2B</h1>
          <p className="text-base-secondary">
            Preencha o formulário abaixo para solicitar uma parceria comercial connosco.
            Todos os campos marcados com * são obrigatórios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Empresariais */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">📊 Informações Empresariais</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da Empresa *</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: Empresa Lda"
                />
                {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">NIF *</label>
                <input
                  type="text"
                  value={formData.vat_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, vat_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="000000000"
                  maxLength={9}
                />
                {errors.vat_number && <p className="text-red-500 text-sm mt-1">{errors.vat_number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Código Atividade Económica *</label>
                <input
                  type="text"
                  value={formData.economic_activity_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, economic_activity_code: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: 47730"
                />
                {errors.economic_activity_code && <p className="text-red-500 text-sm mt-1">{errors.economic_activity_code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Previsão Compras Mensais (€) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthly_purchase_forecast}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_purchase_forecast: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: 5000"
                />
                {errors.monthly_purchase_forecast && <p className="text-red-500 text-sm mt-1">{errors.monthly_purchase_forecast}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Website (opcional)</label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://www.empresa.com"
                />
              </div>
            </div>
          </div>

          {/* Morada de Facturação */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">📍 Morada de Facturação</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Morada Completa *</label>
                <input
                  type="text"
                  value={formData.billing_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: Rua das Flores, 123 - 2º Esq."
                />
                {errors.billing_address && <p className="text-red-500 text-sm mt-1">{errors.billing_address}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Código Postal *</label>
                  <input
                    type="text"
                    value={formData.billing_postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_postal_code: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0000-000"
                    maxLength={8}
                  />
                  {errors.billing_postal_code && <p className="text-red-500 text-sm mt-1">{errors.billing_postal_code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cidade *</label>
                  <input
                    type="text"
                    value={formData.billing_city}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_city: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Lisboa"
                  />
                  {errors.billing_city && <p className="text-red-500 text-sm mt-1">{errors.billing_city}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Morada de Entrega (Opcional) */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">🚚 Morada de Entrega (Opcional)</h2>
            <p className="text-sm text-base-secondary mb-4">Se for diferente da morada de facturação</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Morada Completa</label>
                <input
                  type="text"
                  value={formData.delivery_address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: Rua do Comércio, 456"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Código Postal</label>
                  <input
                    type="text"
                    value={formData.delivery_postal_code || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_postal_code: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0000-000"
                    maxLength={8}
                  />
                  {errors.delivery_postal_code && <p className="text-red-500 text-sm mt-1">{errors.delivery_postal_code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.delivery_city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_city: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Porto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contacto Principal */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">👤 Contacto Principal</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: João Silva"
                />
                {errors.contact_name && <p className="text-red-500 text-sm mt-1">{errors.contact_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="joao@empresa.com"
                />
                {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefone *</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+351 912 345 678"
                />
                {errors.contact_phone && <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Posição na Empresa</label>
                <input
                  type="text"
                  value={formData.contact_position}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_position: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: Diretor Comercial"
                />
              </div>
            </div>
          </div>

          {/* Fornecedores Habituais */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">🏭 Fornecedores Habituais (Opcional)</h2>
              <button
                type="button"
                onClick={addSupplier}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
              >
                + Adicionar Fornecedor
              </button>
            </div>

            {formData.suppliers.length === 0 ? (
              <p className="text-base-secondary text-sm">
                Clique em "Adicionar Fornecedor" para incluir informações sobre os vossos fornecedores habituais.
              </p>
            ) : (
              <div className="space-y-4">
                {formData.suppliers.map((supplier, index) => (
                  <div key={index} className="border border-border rounded-md p-4 relative">
                    <button
                      type="button"
                      onClick={() => removeSupplier(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nome da Empresa</label>
                        <input
                          type="text"
                          value={supplier.company_name}
                          onChange={(e) => updateSupplier(index, 'company_name', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Ex: Fornecedor ABC Lda"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Contacto</label>
                        <input
                          type="text"
                          value={supplier.contact_name}
                          onChange={(e) => updateSupplier(index, 'contact_name', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Ex: Maria Santos"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Telefone</label>
                        <input
                          type="tel"
                          value={supplier.phone}
                          onChange={(e) => updateSupplier(index, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="+351 200 000 000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Localização</label>
                        <input
                          type="text"
                          value={supplier.location}
                          onChange={(e) => updateSupplier(index, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Ex: Lisboa"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comentários */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">💬 Informações Adicionais</h2>
            <textarea
              value={formData.comments || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-base focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Qualquer informação adicional que considere relevante para a análise do pedido..."
            />
          </div>

          {/* Submit */}
          <div className="text-center">
            {errors.submit && (
              <p className="text-red-500 mb-4">{errors.submit}</p>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
            >
              {isSubmitting ? 'Enviando...' : 'Submeter Pedido de Cooperação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 