import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend) // Carrega traduções de um servidor (ou de public/locales)
  .use(LanguageDetector) // Deteta o idioma do utilizador
  .use(initReactI18next) // Passa a instância i18n para react-i18next
  .init({
    fallbackLng: 'pt', // Idioma de fallback
    debug: true, // Ativa o modo de debug (útil durante o desenvolvimento)
    interpolation: {
      escapeValue: false, // React já faz escaping por defeito
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Caminho para os ficheiros de tradução
    },
  });

export default i18n;
