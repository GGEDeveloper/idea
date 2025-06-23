'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    alert('Funcionalidade de login será implementada em breve!');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4"
         style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
             style={{ backgroundColor: 'var(--color-primary)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10"
             style={{ backgroundColor: 'var(--color-secondary)' }}></div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img 
              src="/logo_transparente_amarelo.png" 
              alt="AliTools Logo" 
              className="h-20 w-auto mx-auto drop-shadow-lg"
            />
          </Link>
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--color-text-base)' }}>
            Área de Parceiros
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            Acesso exclusivo para revendedores autorizados
          </p>
        </div>

        {/* Main Login Card */}
        <div className="card-glass">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                 style={{ backgroundColor: 'var(--color-primary)' }}>
              <i className="fas fa-user text-2xl" style={{ color: 'var(--color-text-inverse)' }}></i>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-base)' }}>
              Fazer Login
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Entre na sua conta de parceiro
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-base)' }}>
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-sm" style={{ color: 'var(--color-text-muted)' }}></i>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  required
                  className="input-field pl-10"
                  placeholder="o.seu.email@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-base)' }}>
                Palavra-passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-sm" style={{ color: 'var(--color-text-muted)' }}></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded focus:ring-2"
                  style={{ 
                    accentColor: 'var(--color-primary)',
                    borderColor: 'var(--color-border-base)'
                  }}
                />
                <span className="ml-2 text-sm" style={{ color: 'var(--color-text-base)' }}>
                  Lembrar-me
                </span>
              </label>

              <Link href="#" className="text-sm font-medium hover:underline"
                    style={{ color: 'var(--color-primary)' }}>
                Esqueceu a palavra-passe?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary w-full py-3 text-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-2"></i>
                  A entrar...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--color-border-base)' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4" 
                      style={{ 
                        backgroundColor: 'var(--color-bg-base)', 
                        color: 'var(--color-text-muted)' 
                      }}>
                  Ainda não é parceiro?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/contacto" className="btn-secondary w-full text-center py-3">
                <i className="fas fa-handshake mr-2"></i>
                Solicitar Acesso de Parceiro
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <div className="card">
            <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-base)' }}>
              <i className="fas fa-shield-alt mr-2" style={{ color: 'var(--color-success)' }}></i>
              Área Segura e Exclusiva
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Esta área é exclusiva para parceiros autorizados da AliTools. 
              Aqui pode aceder a preços especiais, stock em tempo real e suporte técnico.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <i className="fas fa-euro-sign text-lg mb-2" style={{ color: 'var(--color-success)' }}></i>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Preços Especiais
                </p>
              </div>
              <div>
                <i className="fas fa-clock text-lg mb-2" style={{ color: 'var(--color-info)' }}></i>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Stock em Tempo Real
                </p>
              </div>
              <div>
                <i className="fas fa-headset text-lg mb-2" style={{ color: 'var(--color-warning)' }}></i>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Suporte Técnico
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Para se tornar um parceiro AliTools, entre em{' '}
            <Link href="/contacto" className="font-medium hover:underline"
                  style={{ color: 'var(--color-primary)' }}>
              contacto connosco
            </Link>
            {' '}através do nosso formulário.
          </p>
        </div>
      </div>
    </div>
  );
} 