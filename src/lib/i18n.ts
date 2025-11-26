import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from '../locales/tr/common.json';
import en from '../locales/en/common.json';
import de from '../locales/de/common.json';
import fr from '../locales/fr/common.json';

const savedLanguage = localStorage.getItem('i18nextLng') || 'tr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: {
        translation: tr,
      },
      en: {
        translation: en,
      },
      de: {
        translation: de,
      },
      fr: {
        translation: fr,
      },
    },
    lng: savedLanguage,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;

