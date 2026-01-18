/*
 * @Author       : djkloop
 * @Date         : 2020-08-15 21:39:28
 * @LastEditors  : djkloop
 * @LastEditTime : 2020-08-15 22:01:32
 * @Description  : 头部注释
 * @FilePath     : /form-create2/packages/element-ui/examples/main.js
 */
import { createApp, h, defineComponent } from "vue";
import { InfoFilled } from "@element-plus/icons-vue";
import FormCreate from "@eimsnext/form-render-elplus";
import install from "@eimsnext/form-render-elplus/auto-import";
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

FormCreate.use(install);
app.use(FormCreate);
app.component("info", InfoFilled);

//todo ------------------ Demo 用 ------------------

// import VJsoneditor from 'v-jsoneditor'
import addressEffect from "./addressEffect";
import wangEditor from "@eimsnext/form-render-elplus";

// app.use(VJsoneditor)
FormCreate.register(addressEffect);
FormCreate.component("wangEditor", wangEditor);

//自定义组件
FormCreate.component(
  "testSlot",
  defineComponent({
    render() {
      return h("div", {}, this.$slots.test());
    },
  })
);

//todo ------------------ Demo 用 ------------------

app.mount("#app");
