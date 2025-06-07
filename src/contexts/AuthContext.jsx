import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth ? JSON.parse(storedAuth) : false;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Erro ao ler 'currentUser' do localStorage:", error);
      localStorage.removeItem('currentUser');
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [isAuthenticated, currentUser]);

  const login = async (email, password) => {
    // Simulação de uma chamada API
    console.log('Tentando login com:', email, password); // Para debug
    // Por agora, qualquer login é bem-sucedido e define um utilizador mock
    // No futuro, aqui ocorreria uma chamada a um backend
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = { id: '1', name: 'Utilizador Teste', email: email }; 
        setIsAuthenticated(true);
        setCurrentUser(mockUser);
        resolve({ success: true, user: mockUser });
      }, 500); // Simula delay da rede
    });
  };

  const updateUserProfile = (updatedData) => {
    return new Promise((resolve, reject) => {
      // Simular uma pequena latência de API
      setTimeout(() => {
        if (currentUser) {
          try {
            const newUserData = { ...currentUser, ...updatedData };
            setCurrentUser(newUserData);
            localStorage.setItem('currentUser', JSON.stringify(newUserData));
            toast.success('Perfil atualizado com sucesso!');
            resolve(newUserData);
          } catch (e) {
            console.error("Erro ao atualizar dados do utilizador ou localStorage:", e);
            toast.error('Falha ao guardar as alterações do perfil.');
            reject(e); // Rejeita a promise com o erro
          }
        } else {
          toast.error('Nenhum utilizador logado para atualizar.');
          reject(new Error('Nenhum utilizador logado.'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    // localStorage será limpo pelo useEffect
    console.log('Utilizador deslogado.');
  };

  const value = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
