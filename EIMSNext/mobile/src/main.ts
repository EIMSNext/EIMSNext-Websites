import { createApp } from "vue";
import { appSetting, DEFAULT_THEME_COLOR, applyTheme, generateThemeColors, setupHttp, toggleDarkMode } from "@eimsnext/utils";
import { createI18n } from "vue-i18n";
import { En, ZhCn } from "@eimsnext/locale";
import { Locale, showToast } from "vant";
import enUS from "vant/es/locale/lang/en-US";
import zhCN from "vant/es/locale/lang/zh-CN";
import FormCreateMobile from "@eimsnext/form-render-vant";
import installFormCreateMobile from "@eimsnext/form-render-vant/auto-import";
import "@eimsnext/form-render-vant/dist/index.css";
import { formulas } from "@eimsnext/utils";
import App from "./App.vue";
import router from "./router";
import "vant/lib/index.css";
import "./styles/index.scss";

// 与 admin 端保持一致：统一处理接口错误提示（packages/../admin/src/utils/http.ts）
const systemErrorText = () => (localStorage.getItem("language") === "en" ? En : ZhCn).common.systemError;

const tokenKey = () => appSetting.tokenKey || "jat";

// 登录/登出请求的失败由调用方自行提示（避免与页面自身的提示重复），
// 且登录接口返回的 401 不能被当成「会话过期」处理
const isAuthRequest = (url?: string) => Boolean(url && /\/identity\/(login|logout)/i.test(url));

let sessionExpiredHandled = false;

const handleSessionExpired = (message: string) => {
  localStorage.removeItem(tokenKey());
  showToast(String(message || systemErrorText()));

  if (sessionExpiredHandled || router.currentRoute.value.path === "/login") return;
  sessionExpiredHandled = true;
  void router.replace({ path: "/login", query: { redirect: router.currentRoute.value.fullPath } });
};

const initHttp = () =>
  setupHttp((error: any) => {
    const response = error?.response;
    const data = response?.data || {};
    const message =
      data.message || data.msg || data.error_description || data.error || error?.message || systemErrorText();

    // 登录/登出由页面自己提示，这里不重复弹
    if (isAuthRequest(response?.config?.url)) return;

    if (response?.status === 401) {
      handleSessionExpired(message);
      return;
    }

    showToast(String(message));
  });

// 回到登录页后重新允许会话过期提示（登录成功会跳走，flag 保持为 false）
router.afterEach((to) => {
  if (to.path === "/login") sessionExpiredHandled = false;
});

const initTheme = () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = localStorage.getItem("mobile-theme") || (prefersDark ? "dark" : "light");
  const themeColor = localStorage.getItem("themeColor") || DEFAULT_THEME_COLOR;

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
FormCreateMobile.use(installFormCreateMobile);
Object.entries(formulas).forEach(([name, handler]) => FormCreateMobile.setFormula(name, handler));
app.use(FormCreateMobile);
app.use(initI18n());
app.use(router);
app.mount("#app");
