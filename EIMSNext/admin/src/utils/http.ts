import type { App } from "vue";
import { type AxiosResponse, AxiosHeaders } from "axios";
import { ElMessage } from "element-plus";
import { appSetting, http, HttpInterceptors, type HttpRequestConfig } from "@eimsnext/utils";

function initHttpConfig(): HttpRequestConfig {
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
    console.log("erro", response, error);
    if (response) {
      const data = (response && response.data) || {};

      const { code, msg, message } = data as any;
      const display = message || msg || "系统出错";
      ElMessage.error(display);
    } else {
      ElMessage.error(error?.message || error?.msg || "系统出错");
    }
  };

  return { headers: new AxiosHeaders(), interceptors } as HttpRequestConfig;
}

export default {
  install(app: App<Element>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    if (window.appSetting) appSetting.merge(window.appSetting);
    const httpConfig = initHttpConfig();
    http.setConfig(httpConfig, httpConfig);
    app.provide("http", http);
  },
};
