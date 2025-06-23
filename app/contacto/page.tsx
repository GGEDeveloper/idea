'use client';

import React, { useState } from 'react';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    
    setIsSubmitting(false);
    alert('Mensagem enviada com sucesso! Entraremos em contacto brevemente.');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="container mx-auto py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
               style={{ backgroundColor: 'var(--color-primary)' }}>
            <i className="fas fa-envelope text-3xl" style={{ color: 'var(--color-text-inverse)' }}></i>
          </div>
          <h1 className="text-5xl font-bold mb-6" style={{ color: 'var(--color-text-base)' }}>
            Contacto
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Estamos aqui para ajudar! Entre em contacto connosco e descubra como podemos 
            impulsionar o seu negócio com as melhores ferramentas profissionais.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card-glass">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                   style={{ backgroundColor: 'var(--color-secondary)' }}>
                <i className="fas fa-paper-plane text-xl" style={{ color: 'var(--color-text-inverse)' }}></i>
              </div>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-base)' }}>
                Envie-nos uma Mensagem
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-base)' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="O seu nome completo"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-base)' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="o.seu.email@exemplo.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-base)' }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="+351 XXX XXX XXX"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-base)' }}>
                    Assunto *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="parceria">Tornar-se Parceiro</option>
                    <option value="produto">Informações sobre Produtos</option>
                    <option value="orcamento">Pedido de Orçamento</option>
                    <option value="suporte">Suporte Técnico</option>
                    <option value="reclamacao">Reclamação</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-base)' }}>
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  required
                  className="input-field resize-none"
                  placeholder="Descreva a sua necessidade ou questão em detalhe..."
                ></textarea>
              </div>
              
              <div className="bg-opacity-50 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <i className="fas fa-info-circle mr-2"></i>
                  Os campos marcados com * são obrigatórios. Responderemos no prazo de 24 horas.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn-primary w-full py-4 text-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    A enviar...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Enviar Mensagem
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="card">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                     style={{ backgroundColor: 'var(--color-info)' }}>
                  <i className="fas fa-building text-xl" style={{ color: 'var(--color-text-inverse)' }}></i>
                </div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-base)' }}>
                  Informações de Contacto
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: 'var(--color-success)' }}>
                    <i className="fas fa-phone" style={{ color: 'var(--color-text-inverse)' }}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-base)' }}>
                      Telefone
                    </h3>
                    <p className="font-medium" style={{ color: 'var(--color-primary)' }}>
                      +351 220 123 456
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Segunda a Sexta: 8h30 - 18h00<br />
                      Sábado: 9h00 - 13h00
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: 'var(--color-warning)' }}>
                    <i className="fas fa-envelope" style={{ color: 'var(--color-text-inverse)' }}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-base)' }}>
                      Email
                    </h3>
                    <p className="font-medium" style={{ color: 'var(--color-primary)' }}>
                      info@alitools.pt
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Resposta garantida em 24h<br />
                      Suporte técnico especializado
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: 'var(--color-error)' }}>
                    <i className="fas fa-map-marker-alt" style={{ color: 'var(--color-text-inverse)' }}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-base)' }}>
                      Morada
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                      Zona Industrial da Maia<br />
                      Rua das Ferramentas, 123<br />
                      4470-000 Maia, Porto<br />
                      Portugal
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: 'var(--color-secondary)' }}>
                    <i className="fas fa-clock" style={{ color: 'var(--color-text-inverse)' }}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text-base)' }}>
                      Horário de Funcionamento
                    </h3>
                    <div className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                      <p><strong>Segunda a Sexta:</strong> 8h30 - 18h00</p>
                      <p><strong>Sábado:</strong> 9h00 - 13h00</p>
                      <p><strong>Domingo:</strong> Fechado</p>
                      <p className="mt-2" style={{ color: 'var(--color-warning)' }}>
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        Feriados: Consultar disponibilidade
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-base)' }}>
                Contacto Rápido
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href="tel:+351220123456"
                  className="btn-secondary text-center py-3 hover-lift"
                >
                  <i className="fas fa-phone mr-2"></i>
                  Ligar Agora
                </a>
                <a 
                  href="mailto:info@alitools.pt"
                  className="btn-secondary text-center py-3 hover-lift"
                >
                  <i className="fas fa-envelope mr-2"></i>
                  Enviar Email
                </a>
              </div>
            </div>

            {/* Partnership CTA */}
            <div className="card text-center" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-inverse)' }}>
              <i className="fas fa-handshake text-4xl mb-4"></i>
              <h3 className="text-xl font-bold mb-3">
                Quer tornar-se nosso parceiro?
              </h3>
              <p className="mb-4 opacity-90">
                Contacte-nos para conhecer as nossas condições especiais para revendedores 
                e distribuidores.
              </p>
              <button className="btn-secondary">
                <i className="fas fa-users mr-2"></i>
                Informações de Parceria
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center hover-lift">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: 'var(--color-success)' }}>
              <i className="fas fa-shipping-fast text-2xl" style={{ color: 'var(--color-text-inverse)' }}></i>
            </div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-base)' }}>
              Entrega Rápida
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Entregas em 24-48h para parceiros em todo o território nacional
            </p>
          </div>
          
          <div className="card text-center hover-lift">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: 'var(--color-info)' }}>
              <i className="fas fa-shield-alt text-2xl" style={{ color: 'var(--color-text-inverse)' }}></i>
            </div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-base)' }}>
              Garantia Total
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Todos os produtos com garantia oficial das marcas representadas
            </p>
          </div>
          
          <div className="card text-center hover-lift">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: 'var(--color-warning)' }}>
              <i className="fas fa-headset text-2xl" style={{ color: 'var(--color-text-inverse)' }}></i>
            </div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-base)' }}>
              Suporte Especializado
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Equipa técnica especializada para apoio e aconselhamento profissional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 