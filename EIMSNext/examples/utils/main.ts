import { createApp } from "vue";
import App from "./app.vue";
const app = createApp(App);

import {
  appSetting,
  http,
  HttpRequestConfig,
  HttpInterceptors,
} from "@eimsnext/utils";
import { AxiosHeaders, AxiosResponse } from "axios";

//@ts-ignore
appSetting.merge(window.appSetting);

let interceptors = new HttpInterceptors();
interceptors.responseResolve = (response: AxiosResponse<any, any>) => {
  // 如果响应是二进制流，则直接返回，用于下载文件、Excel 导出等
  if (response.config.responseType === "blob") {
    return response;
  }

  return response;
};
interceptors.errorHandler = (error: any) => {
  const { config, response } = error;
  if (response) {
    const { code, msg } = response.data;
    alert(msg || "系统出错");
  } else {
    alert(error || "系统出错");
  }
};

let httpConfig: HttpRequestConfig = {
  headers: new AxiosHeaders(),
  interceptors,
};
http.setConfig(httpConfig, httpConfig);

await http.auth.login("12345678901", "123456");

app.mount("#app");
