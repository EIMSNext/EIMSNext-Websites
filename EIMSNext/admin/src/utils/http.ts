import type { App } from "vue";
import { type AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import { http, setupHttp } from "@eimsnext/utils";

export default {
  install(app: App<Element>) {
    setupHttp((error: any) => {
      const response = error?.response;
      if (response) {
        const data = response.data || {};
        const display = data.message || data.msg || "系统出错";
        ElMessage.error(display);
      } else {
        ElMessage.error(error?.message || error?.msg || "系统出错");
      }
    });
    app.provide("http", http);
  },
};
