'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: ''
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar perfil');
      }

      const userData = await response.json();
      setProfile(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        company_name: userData.company_name || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Erro ao carregar perfil do utilizador');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setUpdateLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar perfil');
      }

      const updatedUser = await response.json();
      setProfile(updatedUser);
      setEditing(false);
      setSuccess('Perfil atualizado com sucesso!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Erro ao atualizar perfil');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        company_name: profile.company_name || ''
      });
    }
    setEditing(false);
    setError(null);
    setSuccess(null);
  };

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  if (authLoading || loading) {
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
                    onClick={() => editing ? handleCancel() : setEditing(true)}
                    disabled={updateLoading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <PencilIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    {editing ? 'Cancelar' : 'Editar'}
                  </button>
                </div>

                {/* Messages */}
                {error && (
                  <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                  </div>
                )}

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
                        onClick={handleCancel}
                        disabled={updateLoading}
                        className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={updateLoading}
                        className="bg-orange-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                      >
                        {updateLoading ? (
                          <>
                            <i className="fas fa-spinner animate-spin mr-2"></i>
                            A guardar...
                          </>
                        ) : (
                          'Guardar'
                        )}
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
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        O email não pode ser alterado
                      </p>
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