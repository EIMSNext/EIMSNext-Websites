import { createApp } from "vue";
import { applyTheme, generateThemeColors, setupHttp, toggleDarkMode } from "@eimsnext/utils";
import { createI18n } from "vue-i18n";
import { En, ZhCn } from "@eimsnext/locale";
import { Locale } from "vant";
import enUS from "vant/es/locale/lang/en-US";
import zhCN from "vant/es/locale/lang/zh-CN";
import App from "./App.vue";
import router from "./router";
import "vant/es/toast/style";
import "./styles/index.scss";

const initHttp = () => {
  setupHttp((error) => {
    console.error("mobile http error", error);
  });
};

const initTheme = () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = localStorage.getItem("mobile-theme") || (prefersDark ? "dark" : "light");
  const themeColor = localStorage.getItem("themeColor") || "#4080ff";

  toggleDarkMode(theme === "dark");
  applyTheme(generateThemeColors(themeColor));
};

const initI18n = () => {
  const language = localStorage.getItem("language") === "en" ? "en" : "zh-CN";
  Locale.use(language === "en" ? "en-US" : "zh-CN", language === "en" ? enUS : zhCN);
  return createI18n({
    locale: language,
    fallbackLocale: "zh-CN",
    messages: {
      en: En,
      "zh-CN": ZhCn,
    },
    legacy: false,
  });
};

initHttp();
initTheme();

const app = createApp(App);
app.use(initI18n());
app.use(router);
app.mount("#app");
