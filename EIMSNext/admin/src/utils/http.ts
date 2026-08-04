import type { App } from "vue";
import { type AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import { http, setupHttp } from "@eimsnext/utils";
import { En, ZhCn } from "@eimsnext/locale";

const systemErrorText = () => (localStorage.getItem("language") === "en" ? En : ZhCn).common.systemError;

export default {
  install(app: App<Element>) {
    setupHttp((error: any) => {
      const response = error?.response;
      if (response) {
        const data = response.data || {};
        const isPublicAccessCodeFailure =
          /\/public\/token/i.test(response.config?.url || "") &&
          (data.error === "invalid_grant" ||
            String(data.error_description || "").includes("公开访问凭证无效"));
        if (isPublicAccessCodeFailure) return;
        const display =
          data.message ||
          data.msg ||
          data.error_description ||
          data.error ||
          systemErrorText();
        ElMessage.error(display);
      } else {
        ElMessage.error(error?.message || error?.msg || systemErrorText());
      }
    });
    app.provide("http", http);
  },
};
