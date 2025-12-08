import { createApp } from "vue";
import FormCreateMobile from "@eimsnext/form-render-vant";
import install from "@eimsnext/form-render-vant/auto-import";
import "vant/lib/index.css";
import App from "./App.vue";

const app = createApp(App);

FormCreateMobile.use(install);

app.use(FormCreateMobile);

app.mount("#app");
