import { createApp, readonly } from "vue";
import ELEMENT from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import vant from "vant";
import "element-plus/dist/index.css";
import "vant/lib/index.css";
import formCreate from "@eimsnext/form-render-elplus";
import App from "./App.vue";
import FcDesigner from "@eimsnext/form-designer";
import "element-plus/theme-chalk/dark/css-vars.css";
import {
  appSetting,
  http,
  HttpRequestConfig,
  HttpInterceptors,
} from "@eimsnext/utils";
import { createPinia } from "pinia";
import { AxiosHeaders } from "axios";

//@ts-ignore
appSetting.merge(window.appSetting);

//实际开发中， 在登录时创建Token
let interceptors = new HttpInterceptors();
interceptors.errorHandler = (msg) => {
  alert(msg);
};

let httpConfig: HttpRequestConfig = {
  headers: new AxiosHeaders(),
  interceptors,
};

http.setConfig(httpConfig, httpConfig);

http.auth.login("12345678901", "123456");

let pinia = createPinia();

const app = createApp(App);
app.provide("http", readonly(http));
// app.config.globalProperties.$http = http;

// formCreate.use(install);
app.use(pinia);
app.use(ELEMENT);
app.use(vant);
app.use(formCreate);
app.use(FcDesigner);
FcDesigner.setFormula([
  {
    menu: "math",
    name: "test",
    info: "test",
    example: "test(val) == !!val",
    handle(val: any) {
      return !!val;
    },
  },
]);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
