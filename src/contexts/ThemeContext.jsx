import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Função para obter a configuração padrão do sistema (via admin ou API)
  const getSystemDefaultTheme = async () => {
    try {
      // Por agora retorna 'light', mas no futuro virá das configurações do admin
      const response = await fetch('/api/settings/default-theme', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        return data.defaultTheme || 'light';
      }
    } catch (error) {
      console.log('Could not fetch system default theme, using light');
    }
    return 'light';
  };

  // Estado do tema com inicialização SSR-safe
  const [theme, setTheme] = useState('light'); // Start with light theme for SSR
  const [isLoading, setIsLoading] = useState(true);
  const [systemDefault, setSystemDefault] = useState('light');
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    
    // 1. Verificar se há preferência salva no localStorage
    const savedTheme = localStorage?.getItem('theme');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme);
      setIsLoading(false);
      return;
    }

    // 2. Verificar preferência do sistema
    if (window?.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    setIsLoading(false);
  }, []);

  // Carregar configuração padrão do sistema
  useEffect(() => {
    if (!isClient) return;
    
    const loadSystemDefault = async () => {
      const defaultTheme = await getSystemDefaultTheme();
      setSystemDefault(defaultTheme);
      
      // Se não há preferência salva e não há preferência do sistema, usar padrão do admin
      const savedTheme = localStorage?.getItem('theme');
      const hasSystemPreference = window?.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (!savedTheme && !hasSystemPreference) {
        setTheme(defaultTheme);
      }
    };

    loadSystemDefault();
  }, [isClient]);

  // Aplicar o tema ao documento
  useEffect(() => {
    if (!isClient) return;
    
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Salvar no localStorage
    localStorage?.setItem('theme', theme);
  }, [theme, isClient]);

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    if (!isClient) return;
    
    const mediaQuery = window?.matchMedia('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;
    
    const handleChange = (e) => {
      // Só alterar automaticamente se o utilizador não tem preferência salva
      const savedTheme = localStorage?.getItem('theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isClient]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  const resetToSystem = () => {
    if (!isClient) return;
    
    localStorage?.removeItem('theme');
    if (window?.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme(systemDefault);
    }
  };

  const value = {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isLoading,
    systemDefault,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    resetToSystem,
    // Função utilitária para classes condicionais
    themeClass: (lightClass, darkClass) => theme === 'dark' ? darkClass : lightClass,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext }; 