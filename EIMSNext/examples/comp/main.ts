import { createApp } from "vue";
import App from "./app.vue";
import {
  appSetting,
  http,
  HttpInterceptors,
  type HttpRequestConfig,
} from "@eimsnext/utils";
import JlPlus from "@eimsnext/components";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@eimsnext/components/dist/index.css";
import { createPinia } from "pinia";
import { AxiosHeaders } from "axios";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { setupStore, useUserStore } from "@eimsnext/store";

// console.log(JlPlus);
const app = createApp(App);
app.use(createPinia());

//@ts-ignore
appSetting.merge(window.appSetting);

let interceptors = new HttpInterceptors();
interceptors.errorHandler = (msg: any) => {
  alert(msg);
};
let httpConfig: HttpRequestConfig = {
  headers: new AxiosHeaders(),
  interceptors,
};
http.setConfig(httpConfig, httpConfig);

setupStore(app);

await useUserStore().login({
  username: "admin@eimsnext.com",
  password: "123456",
  grant_type: "password",
});

app.use(ElementPlus);
app.use(JlPlus);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
