import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const EditProfileForm = ({ currentUser, onProfileUpdate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Validação básica
    if (!name.trim() || !email.trim()) {
      toast.error('Nome e email são obrigatórios.');
      setIsLoading(false);
      return;
    }
    // Simula a chamada de atualização
    try {
      await onProfileUpdate({ name, email });
      // O toast de sucesso será idealmente chamado na MyAccountPage ou no AuthContext após a confirmação da atualização
    } catch (error) {
      // O toast de erro também pode ser centralizado
      console.error("Erro ao atualizar perfil:", error);
    }
    setIsLoading(false);
  };

  if (!currentUser) {
    return <p>A carregar dados do utilizador...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome Completo
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Endereço de Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
      </div>
      {/* Adicionar mais campos como telefone, etc., se desejado no futuro */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
        >
          {isLoading ? 'A guardar...' : 'Guardar Alterações'}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;
