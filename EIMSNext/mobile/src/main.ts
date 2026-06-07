import { createApp } from "vue";
import { setupHttp } from "@eimsnext/utils";
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
  document.documentElement.classList.toggle("dark", theme === "dark");
};

initHttp();
initTheme();

const app = createApp(App);
app.use(router);
app.mount("#app");
