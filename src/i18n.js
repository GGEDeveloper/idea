import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

const i18nConfig = {
  fallbackLng: 'pt',
  debug: process.env.NODE_ENV === 'development',
  defaultNS: 'common',
  ns: ['common'],
  interpolation: {
    escapeValue: false,
  },
  backend: {
    loadPath: '/locales/{{lng}}/common.json',
    requestOptions: {
      cache: 'no-store',
    },
  },
};

// Add language detection only on client side
if (isClient) {
  i18nConfig.detection = {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  };
}

i18n
  .use(Backend);

// Only use LanguageDetector on client side
if (isClient) {
  i18n.use(LanguageDetector);
}

i18n
  .use(initReactI18next)
  .init(i18nConfig);

export default i18n;
