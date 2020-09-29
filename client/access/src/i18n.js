import { i18nStates, setI18nState } from "app/globalFlagsSlice";
import store from "app/store";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ChainedBackend from "i18next-chained-backend";
import HttpBackend from "i18next-http-backend";

const i18nAccessInstance = i18next.createInstance();

i18nAccessInstance
  .use(ChainedBackend)
  .use(LanguageDetector)
  .init(
    {
      supportedLngs: ["bn", "en", "es", "ht", "ko", "ru", "zh"],
      fallbackLng: "en",
      ns: ["translation", "catalog"],
      defaultNS: "translation",
      returnNull: false,
      backend: {
        backends: [HttpBackend, HttpBackend],
        backendOptions: [
          {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
          },
          {
            loadPath: "/api/explore/v1/locales/{{lng}}/{{ns}}.json",
          },
        ],
      },
      react: {
        wait: true, // wait until translations are loaded
      },
    },
    // Callback is executed after i18next initialization completes, successfully
    // or otherwise.
    (errors, _t) => {
      if (errors && errors.length > 0) {
        store.dispatch(setI18nState(i18nStates.FAILED));
      } else {
        store.dispatch(setI18nState(i18nStates.INITIALIZED));
      }
    }
  );

export default i18nAccessInstance;
