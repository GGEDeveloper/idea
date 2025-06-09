import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobeAltIcon, CheckIcon } from '@heroicons/react/24/outline';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  const languages = [
    { code: 'pt', name: t('languages.pt') },
    { code: 'en', name: t('languages.en') },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
    // Salvar preferência no localStorage
    localStorage.setItem('i18nextLng', lng);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Referências para os itens do menu
  const menuItems = useRef([]);
  const firstItemRef = useRef(null);
  const lastItemRef = useRef(null);
  const buttonRef = useRef(null);

  // Efeito para gerenciar navegação por teclado e foco
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === 'Tab' && !e.shiftKey && document.activeElement === lastItemRef.current) {
        // Fechar menu se tab para fora do último item
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'Tab' && e.shiftKey && document.activeElement === firstItemRef.current) {
        // Fechar menu se shift+tab para fora do primeiro item
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown' && document.activeElement === buttonRef.current) {
        // Mover para o primeiro item do menu com seta para baixo
        e.preventDefault();
        firstItemRef.current?.focus();
      } else if (e.key === 'ArrowUp' && document.activeElement === buttonRef.current) {
        // Mover para o último item do menu com seta para cima
        e.preventDefault();
        lastItemRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focar no primeiro item quando o menu abrir
  useEffect(() => {
    if (isOpen) {
      firstItemRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative ml-3" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`flex items-center space-x-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary rounded-full p-1 ${
          isOpen ? 'text-secondary' : 'text-text-muted hover:text-secondary'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t('language')}
        aria-controls="language-menu"
        id="language-button"
      >
        <GlobeAltIcon className="h-5 w-5" />
        <span className="hidden md:inline text-sm font-medium">
          {currentLanguage.name}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-button"
            tabIndex="-1"
            id="language-menu"
          >
          {languages.map((language, index) => {
            const isSelected = i18n.language === language.code;
            const isFirst = index === 0;
            const isLast = index === languages.length - 1;
            
            return (
              <button
                key={language.code}
                ref={(el) => {
                  if (isFirst) firstItemRef.current = el;
                  if (isLast) lastItemRef.current = el;
                  menuItems.current[index] = el;
                }}
                onClick={() => changeLanguage(language.code)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' && !isLast) {
                    e.preventDefault();
                    menuItems.current[index + 1]?.focus();
                  } else if (e.key === 'ArrowUp' && !isFirst) {
                    e.preventDefault();
                    menuItems.current[index - 1]?.focus();
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    firstItemRef.current?.focus();
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    lastItemRef.current?.focus();
                  }
                }}
                className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 ${
                  isSelected
                    ? 'bg-gray-100 text-secondary font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                role="menuitemradio"
                aria-checked={isSelected}
                tabIndex={isOpen ? 0 : -1}
              >
                <span>{language.name}</span>
                {isSelected && (
                  <CheckIcon className="h-4 w-4 text-secondary" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {isSelected ? t('language.selected', { language: language.name }) : language.name}
                </span>
              </button>
            );
          })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
