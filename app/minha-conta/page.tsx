'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserIcon, 
  EnvelopeIcon,
  BuildingOfficeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  created_at: string;
}

const MyAccountPage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // TODO: Get actual user profile from API
      setProfile({
        user_id: '1',
        email: 'cliente@example.com',
        first_name: 'João',
        last_name: 'Silva',
        company_name: 'Silva & Associados Lda.',
        created_at: '2024-01-15T10:00:00Z'
      });
      setFormData({
        first_name: 'João',
        last_name: 'Silva',
        company_name: 'Silva & Associados Lda.'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Update profile via API
      console.log('Updating profile:', formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minha Conta</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gerencie os seus dados pessoais e encomendas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <Link
                href="/minha-conta"
                className="bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900 dark:text-orange-200 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
              >
                <UserIcon className="text-orange-500 mr-3 h-6 w-6" />
                Dados Pessoais
              </Link>
              <Link
                href="/minhas-encomendas"
                className="border-transparent text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
              >
                <EnvelopeIcon className="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6" />
                Minhas Encomendas
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Informações Pessoais
                  </h3>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <PencilIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    {editing ? 'Cancelar' : 'Editar'}
                  </button>
                </div>

                {editing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Apelido
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Empresa
                      </label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setEditing(false)}
                        className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="bg-orange-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome completo</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {profile?.first_name} {profile?.last_name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profile?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Empresa</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {profile?.company_name || 'Não especificada'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente desde</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-PT') : '-'}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage; 