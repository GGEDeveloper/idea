import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

  return (
    <div className="relative ml-4" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center space-x-1 text-text-muted hover:text-secondary transition-colors focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t('language')}
      >
        <GlobeAltIcon className="h-5 w-5" />
        <span className="hidden md:inline text-sm font-medium">
          {currentLanguage.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${
                i18n.language === language.code
                  ? 'bg-gray-100 text-secondary font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              role="menuitem"
            >
              <span>{language.name}</span>
              {i18n.language === language.code && (
                <CheckIcon className="h-4 w-4 text-secondary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
