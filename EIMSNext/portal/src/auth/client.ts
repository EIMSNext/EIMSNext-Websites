import { AxiosHeaders } from "axios";
import { HttpRequest, IdentityClient, appSetting } from "@eimsnext/utils";

if (window.appSetting) {
  appSetting.merge(window.appSetting);
}

const request = new HttpRequest({
  headers: new AxiosHeaders(),
  timeout: appSetting.httpTimeout ?? 30000,
});

// 认证请求的失败由页面自行提示；固定 path 让公共 401 兜底跳转对认证页失效
request.setCurrentPathGetter(() => "/login");

export const identityClient = new IdentityClient(request);

export function extractAuthError(error: unknown): string {
  const data = (error as any)?.response?.data || {};
  return data.message || data.error_description || data.error || "";
}
