import { AxiosHeaders } from "axios";
import { appSetting } from "../appSetting";
import { http, HttpInterceptors, type HttpRequestConfig } from "./index";

export function setupHttp(errorHandler?: (error: any) => void): void {
  if ((window as any).appSetting) {
    appSetting.merge((window as any).appSetting);
  }

  const interceptors = new HttpInterceptors();
  interceptors.responseResolve = (response) => response;
  interceptors.errorHandler = errorHandler;

  const httpConfig: HttpRequestConfig = {
    headers: new AxiosHeaders(),
    interceptors,
  };

  http.setConfig(httpConfig, httpConfig);
}
