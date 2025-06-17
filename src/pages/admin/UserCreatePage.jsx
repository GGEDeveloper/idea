import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  PlusIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const UserCreatePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company_name: '',
    password: '',
    role_id: 2, // Default para 'customer'
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Buscar roles disponíveis
  useEffect(() => {
    const fetchRoles = async () => {
      // TODO: Criar endpoint para buscar roles se necessário, por agora usamos valores fixos
      setRoles([
        { role_id: 2, role_name: 'customer' },
        { role_id: 1, role_name: 'admin' }
      ]);
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar o utilizador');
      }

      const newUser = await response.json();
      // TODO: Show success toast
      navigate('/admin/users');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <nav className="text-sm text-gray-600 mb-2">
          <Link to="/admin" className="hover:text-blue-600">Admin</Link>
          <span className="mx-2">›</span>
          <Link to="/admin/users" className="hover:text-blue-600">Utilizadores</Link>
          <span className="mx-2">›</span>
          <span>Criar Novo</span>
        </nav>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Criar Novo Utilizador</h1>
          <button 
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primeiro Nome</label>
              <input type="text" name="first_name" value={userData.first_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apelido</label>
              <input type="text" name="last_name" value={userData.last_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Empresa</label>
              <input type="text" name="company_name" value={userData.company_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email*</label>
              <input type="email" name="email" value={userData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password*</label>
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password" 
                value={userData.password} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role*</label>
              <select name="role_id" value={userData.role_id} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
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
            {loading ? 'A criar...' : 'Criar Utilizador'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserCreatePage; 