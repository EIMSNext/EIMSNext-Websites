import { AxiosHeaders } from "axios";
import {appSetting} from "../appSetting";
import { ApiClient } from "./apiClient";
import { AuthClient } from "./authClient";
import { HttpRequest } from "./httpRequest";
import { ODataClient } from "./odataClient";
import { UploadClient } from "./uploadClient";
import { HttpRequestConfig } from "./interface";
import { deepMerge } from "../type";

export class HttpClient {
  auth: AuthClient;
  api: ApiClient;
  odata: ODataClient;
  upload: UploadClient;
  httpRequest: HttpRequest; //通用的http request, 请求外部网站时使用

  constructor() {
    const defaultConfig: HttpRequestConfig = {
      headers: new AxiosHeaders(),
      timeout: appSetting.httpTimeout ?? 300000,
    };

    this.auth = new AuthClient(new HttpRequest(defaultConfig));
    this.api = new ApiClient(new HttpRequest(defaultConfig));
    this.odata = new ODataClient(new HttpRequest(defaultConfig));
    this.upload = new UploadClient(new HttpRequest(defaultConfig));
    this.httpRequest = new HttpRequest(defaultConfig);
  }

  setConfig(authConfig?: HttpRequestConfig, apiConfig?: HttpRequestConfig) {
    const defaultConfig: HttpRequestConfig = {
      headers: new AxiosHeaders(),
      timeout: appSetting.httpTimeout ?? 300000,
    };

    this.auth = new AuthClient(
      new HttpRequest(
        authConfig ? deepMerge(authConfig, defaultConfig) : defaultConfig
      )
    );

    let apiCfg = apiConfig
      ? deepMerge(apiConfig, defaultConfig)
      : defaultConfig;
    this.api = new ApiClient(new HttpRequest(apiCfg));
    this.odata = new ODataClient(new HttpRequest(apiCfg));
    this.upload = new UploadClient(new HttpRequest(apiCfg));
  }
}

const http = new HttpClient();
export default http;
