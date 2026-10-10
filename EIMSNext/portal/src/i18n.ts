import { createI18n } from "vue-i18n";
import { En, ZhCn } from "@eimsnext/locale";

// 语言偏好与 admin/mobile 共用同一个 localStorage key
const stored = localStorage.getItem("language");

const i18n = createI18n({
  legacy: false,
  locale: stored === "en" ? "en" : "zh-CN",
  fallbackLocale: "zh-CN",
  messages: {
    "zh-CN": ZhCn,
    en: En,
  },
});

export default i18n;
