import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// BASE_URL is injected by Vite ( '/' in dev, '/repo-name/' in build )
const base = import.meta.env.BASE_URL;

// build a load path that works in dev + GH Pages (with subpath)
const loadPath = `${base}i18n/{{lng}}.json`;

export function setupI18n(translatePage) {
  return i18next
    .use(HttpBackend)
    .use(LanguageDetector)
    .init({
      debug: true,
      fallbackLng: 'en',
      load: 'languageOnly',
      backend: { loadPath },
      detection: {
        order: ['localStorage','querystring','navigator'],
        caches: ['localStorage']
      }
    })
    .then(() => {
      translatePage();
      i18next.on('languageChanged', () => translatePage());
      return i18next;
    });
}