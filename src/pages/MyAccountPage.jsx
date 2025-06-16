import React, { useState, useEffect } from 'react';
// import { useUser, useClerk } from '@clerk/clerk-react'; // REMOVER CLERK
import { useAuth } from '../contexts/AuthContext'; // USAR NOSSO AUTHCONTEXT
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EditProfileForm from '../components/EditProfileForm';

// Icons
import { 
  UserCircleIcon, 
  ClipboardDocumentListIcon, 
  PencilIcon, 
  ArrowLeftOnRectangleIcon,
  EnvelopeIcon,
  // PhoneIcon, // localUser pode não ter telefone
  ClockIcon,
  // CheckCircleIcon, // Não temos isEmailVerified no sistema local
  ExclamationCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const MyAccountPage = () => {
  const { localUser, isLoading: authIsLoading, logout, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('details');
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      // A navegação é tratada dentro da função logout do AuthContext
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Ocorreu um erro ao terminar a sessão');
    }
  };

  const menuItems = [
    { id: 'details', name: 'Visão Geral', icon: UserCircleIcon, action: () => setActiveSection('details') },
    { id: 'orderHistory', name: 'Meus Pedidos', icon: ClipboardDocumentListIcon, action: () => setActiveSection('orderHistory') },
    { id: 'editProfile', name: 'Editar Perfil', icon: PencilIcon, action: () => setActiveSection('editProfile') },
    { id: 'settings', name: 'Configurações', icon: Cog6ToothIcon, action: () => setActiveSection('settings') }
  ];

  if (authIsLoading) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !localUser) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso não autorizado</h2>
        <p className="text-gray-600 mb-6">Você precisa estar autenticado para acessar esta página.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Ir para o Login
        </button>
      </div>
    );
  }

  const fullName = `${localUser.first_name || ''} ${localUser.last_name || ''}`.trim() || localUser.email;

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Minha Conta</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <p className="text-lg text-gray-600">
              Olá, <span className="font-medium text-indigo-600">{fullName}</span>!
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Navegação */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                    <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserCircleIcon className="h-12 w-12 text-indigo-500" />
                    </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
                <p className="text-sm text-gray-500 mt-1">{localUser.email}</p>
              </div>
              
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon 
                        className={`h-5 w-5 ${
                          activeSection === item.id ? 'text-indigo-600' : 'text-gray-400'
                        }`} 
                      />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 mt-4"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  <span>Sair</span>
                </button>
              </nav>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Status da Conta
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">Membro desde</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(localUser.created_at)} 
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {activeSection === 'details' && (
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Visão Geral da Conta</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Visualize e gerencie suas informações pessoais
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('editProfile')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PencilIcon className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
                      Editar Perfil
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Informações Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500">Nome Completo</dt>
                        <dd className="text-base text-gray-900">{fullName || 'Não informado'}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500">Endereço de Email</dt>
                        <dd className="text-base text-gray-900 flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {localUser.email || 'Não informado'}
                        </dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500">Empresa</dt>
                        <dd className="text-base text-gray-900">{localUser.company_name || 'Não informado'}</dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'editProfile' && (
                <EditProfileForm 
                  user={{
                    id: localUser.user_id,
                    name: fullName, // (localUser.first_name || '') + ' ' + (localUser.last_name || '') poderia ser mais explícito aqui
                    email: localUser.email,
                    // phone: localUser.phone, // Adicionar se tiver este campo no localUser
                    // imageUrl: localUser.imageUrl // Adicionar se tiver este campo no localUser
                  }}
                  onUpdate={(updatedData) => {
                    toast.success('Funcionalidade de atualização de perfil a ser implementada.');
                    // Aqui chamaria uma função do AuthContext para atualizar dados no backend e depois o localUser
                    setActiveSection('details');
                  }}
                  onCancel={() => setActiveSection('details')}
                />
              )}

              {activeSection === 'orderHistory' && (
                <div className="p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Histórico de Pedidos</h2>
                    <p className="mt-1 text-sm text-gray-500">Acompanhe e gerencie seus pedidos recentes</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-3 text-lg font-medium text-gray-900">Nenhum pedido encontrado</h3>
                    <p className="mt-1 text-gray-500 max-w-md mx-auto">
                      Você ainda não realizou nenhuma compra. Explore nossa loja e descubra nossos produtos.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => navigate('/produtos')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Ver Produtos
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'settings' && (
                <div className="p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
                    <p className="mt-1 text-sm text-gray-500">Gerencie as configurações da sua conta</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preferências</h3>
                    <p className="text-sm text-gray-500">
                      Em breve você poderá gerenciar suas preferências de conta aqui.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
