import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, ClipboardDocumentListIcon, PencilIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import EditProfileForm from '../components/EditProfileForm'; // Importar o formulário

const MyAccountPage = () => {
  const { currentUser, logout, updateUserProfile } = useAuth(); // Adicionar updateUserProfile
  const [activeSection, setActiveSection] = useState('details'); // 'details', 'editProfile', 'orderHistory'
  const navigate = useNavigate();

  if (!currentUser) {
    // Este caso não deveria acontecer se a rota estiver protegida,
    // mas é uma boa salvaguarda.
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">A carregar dados do utilizador ou não está logado...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('Sessão terminada com sucesso!');
    navigate('/');
  };

  const menuItems = [
    { id: 'details', name: 'Detalhes da Conta', icon: UserCircleIcon, action: () => setActiveSection('details') },
    { id: 'editProfile', name: 'Editar Perfil', icon: PencilIcon, action: () => setActiveSection('editProfile') },
    { id: 'orderHistory', name: 'Histórico de Pedidos', icon: ClipboardDocumentListIcon, action: () => { setActiveSection('orderHistory'); toast.info('Histórico de Pedidos - Funcionalidade futura!'); } },
  ];

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Minha Conta</h1>
          <p className="mt-2 text-lg text-gray-600">Bem-vindo de volta, {currentUser.name}!</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar de Navegação da Conta */} 
          <aside className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left transition-colors group
                    ${activeSection === item.id 
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                >
                  <item.icon className={`h-6 w-6 ${activeSection === item.id ? 'text-white' : 'text-gray-500 group-hover:text-indigo-600'}`} />
                  <span>{item.name}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors group mt-auto border-t pt-4"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6 text-red-500 group-hover:text-red-600" />
                <span>Terminar Sessão</span>
              </button>
            </nav>
          </aside>

          {/* Conteúdo Principal da Conta */} 
          <main className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
            {activeSection === 'details' && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Detalhes da Conta</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{currentUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço de Email</label>
                    <p className="mt-1 text-lg text-gray-900 p-3 bg-gray-50 rounded-md">{currentUser.email}</p>
                  </div>
                  {/* Adicionar mais detalhes conforme necessário */}
                </div>
              </section>
            )}

            {activeSection === 'editProfile' && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Editar Perfil</h2>
                <EditProfileForm 
                  currentUser={currentUser} 
                  onProfileUpdate={async (data) => {
                    try {
                      await updateUserProfile(data);
                      // Opcional: voltar para a secção de detalhes após a atualização bem-sucedida
                      // setActiveSection('details'); 
                      // O toast de sucesso já é mostrado pelo AuthContext
                    } catch (error) {
                      // O toast de erro já é mostrado pelo AuthContext em caso de falha lá
                      // mas podemos adicionar um log aqui se necessário
                      console.error("Falha ao atualizar perfil na MyAccountPage:", error);
                    }
                  }}
                />
              </section>
            )}
            
            {activeSection === 'orderHistory' && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Histórico de Pedidos</h2>
                <p className="text-gray-600">O seu histórico de pedidos aparecerá aqui...</p>
              </section>
            )}

            {/* Secção "Outras Opções" removida pois as opções estão na sidebar agora */}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
