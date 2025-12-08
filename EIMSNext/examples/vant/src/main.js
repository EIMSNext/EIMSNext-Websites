import { createApp } from "vue";
import FormCreateMobile from "@eimsnext/form-render-vant";
import install from "@eimsnext/form-render-vant/auto-import";
import "vant/lib/index.css";
import App from "./App.vue";
import { appSetting, http, HttpInterceptors } from "@eimsnext/utils";
import { AxiosHeaders } from "axios";

const app = createApp(App);
//@ts-ignore
if (window.appSetting) appSetting.merge(window.appSetting);
let interceptors = new HttpInterceptors();
interceptors.errorHandler = (msg) => {
  alert(msg);
};
let httpConfig = {
  headers: new AxiosHeaders(),
  interceptors,
};
http.setConfig(httpConfig, httpConfig);

console.log("http", http);

FormCreateMobile.use(install);

app.use(FormCreateMobile);

app.mount("#app");
