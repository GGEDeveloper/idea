import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Pagination from '../../components/common/Pagination';

const UsersAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Paginação e Filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const roleOptions = ['all', 'admin', 'customer'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (roleFilter && roleFilter !== 'all') {
        params.append('role', roleFilter);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/users?${params}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.totalUsers || 0);

    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar utilizadores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <nav className="text-sm text-gray-600 mb-2">
          <Link to="/admin" className="hover:text-blue-600">Admin</Link>
          <span className="mx-2">›</span>
          <span>Utilizadores</span>
        </nav>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestão de Utilizadores ({totalUsers})</h1>
          <Link 
            to="/admin/users/create" 
            className="inline-flex items-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Criar Novo Utilizador
          </Link>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por email, nome, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {roleOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'all' ? 'Todos os Roles' : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          Erro: {error}
        </div>
      )}

      {/* Tabela de Utilizadores */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                        <UsersIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.first_name || ''} {user.last_name || ''}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.company_name && <div className="text-sm text-gray-500">{user.company_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role_name === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                      <Link to={`/admin/users/edit/${user.user_id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <Pagination 
        pagination={{ currentPage, totalPages, totalProducts: totalUsers, limit: 20 }}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default UsersAdminPage; 