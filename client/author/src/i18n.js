import i18next from "i18next";
import ChainedBackend from "i18next-chained-backend";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const i18nAuthorInstance = i18next.createInstance();

i18nAuthorInstance
  .use(ChainedBackend)
  .use(LanguageDetector)
  .init({
    supportedLngs: ["bn", "en", "es", "ht", "ko", "ru", "zh"],
    fallbackLng: "en",
    ns: ["translation"],
    defaultNS: "translation",
    returnNull: false,
    preload: ["bn", "en", "es", "ht", "ko", "ru", "zh"],
    backend: {
      backends: [HttpBackend, HttpBackend],
      backendOptions: [
        {
          loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
      ],
    },
    react: {
      wait: true, // wait until translations are loaded
    },
  });

export default i18nAuthorInstance;
