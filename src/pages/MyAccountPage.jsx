import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
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
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const MyAccountPage = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [activeSection, setActiveSection] = useState('details');
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Função para formatar a data
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

  // Verificar se o email foi verificado
  const isEmailVerified = clerkUser?.emailAddresses?.some(
    email => email.id === clerkUser.primaryEmailAddressId && email.verification.status === 'verified'
  ) || false;

  // Carregar dados adicionais do usuário quando o componente montar
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoaded && clerkUser) {
        try {
          setUserData({
            id: clerkUser.id,
            name: clerkUser.fullName,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            phone: clerkUser.primaryPhoneNumber?.phoneNumber,
            imageUrl: clerkUser.imageUrl,
            createdAt: clerkUser.createdAt,
            lastSignInAt: clerkUser.lastSignInAt,
          });
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          toast.error('Não foi possível carregar os dados do usuário');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [isLoaded, clerkUser]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Sessão terminada com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Ocorreu um erro ao terminar a sessão');
    }
  };

  const menuItems = [
    { 
      id: 'details', 
      name: 'Visão Geral', 
      icon: UserCircleIcon,
      action: () => setActiveSection('details') 
    },
    { 
      id: 'orderHistory', 
      name: 'Meus Pedidos', 
      icon: ClipboardDocumentListIcon,
      action: () => setActiveSection('orderHistory') 
    },
    { 
      id: 'editProfile', 
      name: 'Editar Perfil', 
      icon: PencilIcon,
      action: () => setActiveSection('editProfile') 
    },
    { 
      id: 'settings', 
      name: 'Configurações', 
      icon: Cog6ToothIcon,
      action: () => setActiveSection('settings') 
    }
  ];

  // Mostrar um loader enquanto os dados estão sendo carregados
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Se não houver usuário logado (não deveria acontecer com rota protegida)
  if (!clerkUser) {
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

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Minha Conta</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <p className="text-lg text-gray-600">
              Olá, <span className="font-medium text-indigo-600">{clerkUser.fullName}</span>!
            </p>
            {!isEmailVerified && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <ExclamationCircleIcon className="h-4 w-4 mr-1.5" />
                Verifique seu email
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Navegação */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  {clerkUser.imageUrl ? (
                    <img 
                      src={clerkUser.imageUrl} 
                      alt={clerkUser.fullName} 
                      className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserCircleIcon className="h-12 w-12 text-indigo-500" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{clerkUser.fullName}</h3>
                <p className="text-sm text-gray-500 mt-1">{clerkUser.primaryEmailAddress?.emailAddress}</p>
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
            
            {/* Status da Conta */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Status da Conta
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  {isEmailVerified ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">
                      {isEmailVerified ? 'Email verificado' : 'Email não verificado'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isEmailVerified
                        ? 'Seu endereço de email foi confirmado.'
                        : 'Por favor, verifique seu endereço de email.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">Membro desde</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(clerkUser.createdAt)}
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
                        <dd className="text-base text-gray-900">{clerkUser.fullName || 'Não informado'}</dd>
                      </div>
                      
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500">Endereço de Email</dt>
                        <dd className="text-base text-gray-900 flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {clerkUser.primaryEmailAddress?.emailAddress || 'Não informado'}
                          {!isEmailVerified && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Não verificado
                            </span>
                          )}
                        </dd>
                      </div>
                      
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                        <dd className="text-base text-gray-900 flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                          {clerkUser.primaryPhoneNumber?.phoneNumber || 'Não informado'}
                        </dd>
                      </div>
                      
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500">Último Acesso</dt>
                        <dd className="text-base text-gray-900">
                          {formatDate(clerkUser.lastSignInAt)}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'editProfile' && (
                <EditProfileForm 
                  user={{
                    id: clerkUser.id,
                    name: clerkUser.fullName,
                    email: clerkUser.primaryEmailAddress?.emailAddress,
                    phone: clerkUser.primaryPhoneNumber?.phoneNumber,
                    imageUrl: clerkUser.imageUrl
                  }}
                  onUpdate={(updatedData) => {
                    // Aqui você atualizaria os dados do usuário na sua API
                    // Por enquanto, apenas mostramos uma mensagem de sucesso
                    toast.success('Perfil atualizado com sucesso!');
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
