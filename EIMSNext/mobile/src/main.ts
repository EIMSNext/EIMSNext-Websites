import { createApp } from "vue";
import { AxiosHeaders } from "axios";
import { setupStore } from "@eimsnext/store";
import { applyTheme, generateThemeColors, toggleDarkMode } from "@eimsnext/components";
import { HttpInterceptors, appSetting, http, type HttpRequestConfig } from "@eimsnext/utils";
import FormCreateMobile from "@eimsnext/form-render-vant";
import install from "@eimsnext/form-render-vant/auto-import";
import App from "./App.vue";
import router from "./router";
import "vant/lib/index.css";
import "./styles/index.scss";

const initHttp = () => {
  if (window.appSetting) {
    appSetting.merge(window.appSetting);
  }

  const interceptors = new HttpInterceptors();
  interceptors.errorHandler = (error) => {
    console.error("mobile http error", error);
  };

  const httpConfig: HttpRequestConfig = {
    headers: new AxiosHeaders(),
    interceptors,
  };

  http.setConfig(httpConfig, httpConfig);
};

const initTheme = () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = localStorage.getItem("mobile-theme") || (prefersDark ? "dark" : "light");
  toggleDarkMode(theme === "dark");
  applyTheme(generateThemeColors("#4080FF"));
};

initHttp();
initTheme();

const app = createApp(App);
FormCreateMobile.use(install);
app.use(FormCreateMobile);
setupStore(app);
app.use(router);
app.mount("#app");
