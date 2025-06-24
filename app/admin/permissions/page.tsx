'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Permission {
  permission_id: number;
  permission_name: string;
  description: string;
  role_count: number;
  roles: Role[];
  created_at: string;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface PermissionStats {
  totalPermissions: number;
  systemPermissions: number;
  customPermissions: number;
  totalRoles: number;
}

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [stats, setStats] = useState<PermissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const systemPermissions = [
    'view_products', 'view_price', 'view_stock', 'create_order',
    'manage_orders', 'manage_products', 'manage_users', 'manage_settings'
  ];

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/permissions');
      const data = await response.json();

      if (response.ok) {
        setPermissions(data.permissions || []);
        setStats(data.stats);
        setError(null);
      } else {
        setError(data.error || 'Erro ao carregar permissões');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleSavePermission = async (formData: any) => {
    try {
      setSaveLoading(true);
      const method = editingPermission ? 'PUT' : 'POST';
      const payload = {
        ...formData,
        ...(editingPermission && { permission_id: editingPermission.permission_id })
      };

      const response = await fetch('/api/admin/permissions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchPermissions();
        setShowForm(false);
        setEditingPermission(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao salvar permissão');
      }
    } catch (error) {
      console.error('Error saving permission:', error);
      alert('Erro de conexão');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId: number, permissionName: string) => {
    if (systemPermissions.includes(permissionName)) {
      alert('Não é possível excluir permissões do sistema');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta permissão? Ela será removida de todos os roles que a possuem.')) return;

    try {
      const response = await fetch(`/api/admin/permissions/${permissionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchPermissions();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir permissão');
      }
    } catch (error) {
      console.error('Error deleting permission:', error);
      alert('Erro de conexão');
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

  const isSystemPermission = (permissionName: string) => {
    return systemPermissions.includes(permissionName);
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Gestão de Permissões
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure permissões e controle de acesso do sistema
            </p>
          </div>

          <button
            onClick={() => {
              setEditingPermission(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nova Permissão</span>
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Permissões</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPermissions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <i className="fas fa-cog text-2xl text-green-600 dark:text-green-400"></i>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sistema</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.systemPermissions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <i className="fas fa-plus text-2xl text-yellow-600 dark:text-yellow-400"></i>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Personalizadas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.customPermissions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Roles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRoles}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning Box */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Atenção ao Gerir Permissões
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Mudanças nas permissões afetam imediatamente o acesso dos utilizadores. Permissões do sistema 
                (marcadas como "Sistema") não podem ser excluídas mas podem ser editadas.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Permissions List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Permissões do Sistema
            </h2>
          </div>

          {permissions.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma permissão encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Crie sua primeira permissão para começar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Permissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Roles com Acesso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Criado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {permissions.map((permission) => (
                    <tr key={permission.permission_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              isSystemPermission(permission.permission_name)
                                ? 'bg-blue-100 dark:bg-blue-900/20'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <ShieldCheckIcon className={`h-5 w-5 ${
                                isSystemPermission(permission.permission_name)
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                {permission.permission_name}
                                {isSystemPermission(permission.permission_name) && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    Sistema
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {permission.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {permission.roles.slice(0, 3).map((role) => (
                            <span
                              key={role.role_id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            >
                              {role.role_name}
                            </span>
                          ))}
                          {permission.roles.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                              +{permission.roles.length - 3} mais
                            </span>
                          )}
                          {permission.roles.length === 0 && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                              Nenhum role
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(permission.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingPermission(permission);
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          {!isSystemPermission(permission.permission_name) && (
                            <button
                              onClick={() => handleDeletePermission(permission.permission_id, permission.permission_name)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Excluir"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  permission_name: formData.get('permission_name'),
                  description: formData.get('description')
                };
                handleSavePermission(data);
              }}>
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {editingPermission ? 'Editar' : 'Nova'} Permissão
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingPermission(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome da Permissão
                      </label>
                      <input
                        type="text"
                        name="permission_name"
                        required
                        disabled={editingPermission ? isSystemPermission(editingPermission.permission_name) : false}
                        defaultValue={editingPermission?.permission_name || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        placeholder="Ex: edit_products, view_reports"
                      />
                      {editingPermission && isSystemPermission(editingPermission.permission_name) && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Permissões do sistema não podem ter o nome alterado
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descrição
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        required
                        defaultValue={editingPermission?.description || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Descreva o que esta permissão permite fazer"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingPermission(null);
                      }}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {saveLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <CheckIcon className="h-4 w-4" />
                      )}
                      <span>{saveLoading ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 