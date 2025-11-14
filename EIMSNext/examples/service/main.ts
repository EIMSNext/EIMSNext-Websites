import { createApp } from "vue";
import App from "./app.vue";
import { http, HttpRequestConfig, HttpInterceptors, appSetting } from "@eimsnext/utils";
import { setupStore } from "@eimsnext/store";
import { AxiosHeaders } from "axios";

const app = createApp(App);
//@ts-ignore
appSetting.merge(window.appSetting);

let interceptors = new HttpInterceptors();
interceptors.errorHandler = (msg: any) => { alert(msg) };
let httpConfig: HttpRequestConfig = { headers: new AxiosHeaders(), interceptors };
http.setConfig(httpConfig, httpConfig);

setupStore(app)
app.mount("#app");
