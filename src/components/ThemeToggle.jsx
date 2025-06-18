import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggle = ({ showLabels = false, className = "" }) => {
  const { theme, toggleTheme, setLightTheme, setDarkTheme, resetToSystem, isLoading } = useTheme();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-10 h-10 bg-bg-secondary rounded-lg"></div>
      </div>
    );
  }

  // Versão simples - apenas toggle
  const SimpleToggle = () => (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-button group relative w-10 h-10 p-2 rounded-lg ${className}`}
      title={t('theme.toggle')}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Ícone do Sol */}
        <SunIcon
          className={`
            absolute w-5 h-5 text-yellow-500 transition-all duration-300 transform
            ${theme === 'dark' 
              ? 'opacity-0 scale-0 rotate-180' 
              : 'opacity-100 scale-100 rotate-0'
            }
          `}
        />
        
        {/* Ícone da Lua */}
        <MoonIcon
          className={`
            absolute w-5 h-5 text-blue-600 dark:text-blue-400 transition-all duration-300 transform
            ${theme === 'dark' 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-0 -rotate-180'
            }
          `}
        />
      </div>
      
      {/* Efeito de brilho */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-200/0 via-yellow-200/10 to-yellow-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );

  // Versão com dropdown para múltiplas opções
  const DropdownToggle = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`theme-toggle-button group relative w-10 h-10 p-2 rounded-lg ${className}`}
          title={t('theme.chooseTheme')}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {theme === 'light' && (
              <SunIcon className="w-5 h-5 text-yellow-500 transition-all duration-300" />
            )}
            {theme === 'dark' && (
              <MoonIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-all duration-300" />
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            ></div>
            
            {/* Menu */}
            <div className="absolute right-0 top-12 z-20 min-w-48 bg-bg-base rounded-lg shadow-lg border border-border-base py-2">
              <button
                onClick={() => {
                  setLightTheme();
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left text-sm transition-colors duration-200
                  hover:bg-bg-secondary flex items-center gap-3
                  ${theme === 'light' ? 'bg-bg-tertiary text-primary' : 'text-text-base'}
                `}
              >
                <SunIcon className="w-4 h-4 text-yellow-500" />
                <span>Modo Claro</span>
                {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
              </button>
              
              <button
                onClick={() => {
                  setDarkTheme();
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left text-sm transition-colors duration-200
                  hover:bg-bg-secondary flex items-center gap-3
                  ${theme === 'dark' ? 'bg-bg-tertiary text-primary' : 'text-text-base'}
                `}
              >
                <MoonIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Modo Escuro</span>
                {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
              </button>
              
              <hr className="my-2 border-border-base" />
              
              <button
                onClick={() => {
                  resetToSystem();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-text-base hover:bg-bg-secondary flex items-center gap-3 transition-colors duration-200"
              >
                <ComputerDesktopIcon className="w-4 h-4 text-gray-500" />
                <span>Sistema</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Versão com labels
  const LabeledToggle = () => (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-text-base">
        Tema:
      </span>
      <SimpleToggle />
      <span className="text-xs text-text-muted capitalize">
        {theme === 'dark' ? 'Escuro' : 'Claro'}
      </span>
    </div>
  );

  // Retornar a versão apropriada
  if (showLabels) return <LabeledToggle />;
  return <SimpleToggle />;
};

export default ThemeToggle; 