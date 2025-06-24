'use client';

import React, { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  showLabels?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabels = false, className = "" }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  // Only run on client-side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Get initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        applyTheme(systemTheme);
      } else {
        applyTheme(savedTheme);
      }
    } else {
      // Default to system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme('system');
      applyTheme(systemTheme);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const setLightTheme = () => {
    setTheme('light');
    localStorage.setItem('theme', 'light');
    applyTheme('light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
    localStorage.setItem('theme', 'dark');
    applyTheme('dark');
  };

  const resetToSystem = () => {
    setTheme('system');
    localStorage.setItem('theme', 'system');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(systemTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setDarkTheme();
    } else {
      setLightTheme();
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // Get current effective theme
  const effectiveTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  // Simple toggle version
  const SimpleToggle = () => (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-10 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group ${className}`}
      title="Alternar tema"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun Icon */}
        <SunIcon
          className={`
            absolute w-5 h-5 text-yellow-500 transition-all duration-300 transform
            ${effectiveTheme === 'dark' 
              ? 'opacity-0 scale-0 rotate-180' 
              : 'opacity-100 scale-100 rotate-0'
            }
          `}
        />
        
        {/* Moon Icon */}
        <MoonIcon
          className={`
            absolute w-5 h-5 text-blue-600 dark:text-blue-400 transition-all duration-300 transform
            ${effectiveTheme === 'dark' 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-0 -rotate-180'
            }
          `}
        />
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-200/0 via-yellow-200/10 to-yellow-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );

  // Dropdown version with multiple options
  const DropdownToggle = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-10 h-10 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group ${className}`}
          title="Escolher tema"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {effectiveTheme === 'light' && (
              <SunIcon className="w-5 h-5 text-yellow-500 transition-all duration-300" />
            )}
            {effectiveTheme === 'dark' && (
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
            <div className="absolute right-0 top-12 z-20 min-w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
              <button
                onClick={() => {
                  setLightTheme();
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left text-sm transition-colors duration-200
                  hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3
                  ${theme === 'light' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}
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
                  hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3
                  ${theme === 'dark' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}
                `}
              >
                <MoonIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Modo Escuro</span>
                {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
              </button>
              
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
              
              <button
                onClick={() => {
                  resetToSystem();
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left text-sm transition-colors duration-200
                  hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3
                  ${theme === 'system' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}
                `}
              >
                <ComputerDesktopIcon className="w-4 h-4 text-gray-500" />
                <span>Sistema</span>
                {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Labeled version
  const LabeledToggle = () => (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Tema:
      </span>
      <SimpleToggle />
      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
        {effectiveTheme === 'dark' ? 'Escuro' : 'Claro'}
      </span>
    </div>
  );

  // Return appropriate version
  if (showLabels) return <LabeledToggle />;
  return <SimpleToggle />;
};

export default ThemeToggle; 