import { AxiosHeaders } from "axios";
import { HttpRequest } from "./httpRequest";
import { ContentType, PageResult } from "./interface";
import { getApiUrl } from "../appSetting";

export class ApiClient {
  private httpRequest: HttpRequest;
  private apiVersion = "v1";

  constructor(request: HttpRequest) {
    this.httpRequest = request;
  }

  get<T = any>(url: string, data?: any, withToken?: true) {
    url = this.formatUrl(url);
    let headers = new AxiosHeaders();
    return this.httpRequest.get<T>({ url, data, headers, withToken });
  }

  count(url: string, data?: any) {
    url = this.formatUrl(url);
    let headers = new AxiosHeaders();
    return this.httpRequest.post<number>({
      url,
      data,
      headers,
      withToken: true,
    });
  }

  query<T>(url: string, data?: any) {
    url = this.formatUrl(url);
    let headers = new AxiosHeaders();
    return new Promise<T[]>((resolve, reject) => {
      this.httpRequest
        .post<PageResult<T>>({ url, data, headers, withToken: true })
        .then((res) => {
          resolve(res.value);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  post<T = any>(
    url: string,
    data: any,
    contentType: ContentType = ContentType.JSON,
    withToken?: true
  ) {
    url = this.formatUrl(url);
    let headers = new AxiosHeaders();
    headers.setContentType(contentType);
    return this.httpRequest.post<T>({ url, data, headers, withToken });
  }

  put<T = any>(url: string, data: any, withToken?: true) {
    url = this.formatUrl(url);
    let headers = new AxiosHeaders();
    return this.httpRequest.put<T>({ url, data, headers, withToken });
  }

  patch<T = any>(url: string, data: any, withToken?: true) {
    url = this.formatUrl(url);
    let headers = new AxiosHeaders();
    return this.httpRequest.patch<T>({ url, data, headers, withToken });
  }

  delete<T = any>(url: string, data: any, withToken?: true) {
    url = this.formatUrl(url);
    let headers = new AxiosHeaders();
    return this.httpRequest.delete<T>({ url, data, headers, withToken });
  }

  // upload(url: string, file: any, withToken?: true) {
  //   url = this.formatUrl(url);
  //   let headers = new AxiosHeaders();
  //   headers.setContentType(ContentType.FORM_DATA);
  //   return this.httpRequest.request({ url, data: file, headers, withToken });
  // }

  // download(url: string, withToken?: true) {
  //   url = this.formatUrl(url);
  //   let headers = new AxiosHeaders();
  //   return this.httpRequest.request({ url, headers, withToken });
  // }

  exec<T = any>(
    url: string,
    data: any,
    method: string = "post",
    contentType: ContentType = ContentType.JSON,
    withToken?: true
  ) {
    url = this.formatUrl(url);
    let headers = new AxiosHeaders();
    if (method == "post") {
      headers.setContentType(contentType);
      return this.httpRequest.post<T>({ url, data, headers, withToken });
    } else {
      return this.httpRequest.get<T>({ url, data, headers, withToken });
    }
  }

  private formatUrl(url: string) {
    return getApiUrl(url, this.apiVersion);
  }
}
