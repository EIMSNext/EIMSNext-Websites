import { createApp } from "vue";
import { toggleDarkMode } from "@eimsnext/utils";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import { isMobile } from "./utils/device";
import "./styles/main.scss";

document.documentElement.classList.toggle("device-mobile", isMobile);

if (localStorage.getItem("portal-theme") === "dark") {
  toggleDarkMode(true);
}

createApp(App).use(i18n).use(router).mount("#app");
