import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const UserEditPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch user data
        const userResponse = await fetch(`/api/admin/users/${userId}`);
        if (!userResponse.ok) throw new Error('Falha ao buscar dados do utilizador');
        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch roles (pode ser otimizado para não buscar sempre)
        // TODO: Criar endpoint para buscar roles
        setRoles([
            { role_id: 2, role_name: 'customer' },
            { role_id: 1, role_name: 'admin' }
        ]);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { user_id, created_at, updated_at, role_name, ...dataToUpdate } = userData;
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar o utilizador');
      }

      navigate('/admin/users');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">A carregar...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erro: {error}</div>;
  if (!userData) return <div className="p-8 text-center">Utilizador não encontrado.</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <nav className="text-sm text-gray-600 mb-2">
          <Link to="/admin" className="hover:text-blue-600">Admin</Link>
          <span className="mx-2">›</span>
          <Link to="/admin/users" className="hover:text-blue-600">Utilizadores</Link>
          <span className="mx-2">›</span>
          <span>Editar</span>
        </nav>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Editar Utilizador</h1>
          <button 
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primeiro Nome</label>
              <input type="text" name="first_name" value={userData.first_name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apelido</label>
              <input type="text" name="last_name" value={userData.last_name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Empresa</label>
              <input type="text" name="company_name" value={userData.company_name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email*</label>
              <input type="email" name="email" value={userData.email || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role*</label>
              <select name="role_id" value={userData.role_id || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Selecione um role</option>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            {loading ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEditPage; 