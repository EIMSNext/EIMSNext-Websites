import { AxiosHeaders } from "axios";
import { HttpRequest } from "./httpRequest";
import { ContentType, ODataMetadata, PageResult } from "./interface";
import qs from "qs";
import { getODataUrl } from "../appSetting";

export class ODataClient {
  private httpRequest: HttpRequest;
  private apiVersion = "v1";

  constructor(request: HttpRequest) {
    this.httpRequest = request;
  }

  get<T = any>(url: string, id: string, data?: any) {
    url = this.formatUrl<T>(url, id);
    if (data) {
      let qStr = typeof data === "string" ? data : qs.stringify(data);
      let qMark = qStr.startsWith("?") ? "" : "?";
      url = `${url}${qMark}${qStr}`;
    }
    let headers = this.getAxiosHeaders();
    return this.httpRequest.get<T>({ url, headers, withToken: true });
  }

  count(url: string, data?: any) {
    let $count = url.endsWith("$count") ? "" : "$count";
    url = this.formatUrl(url, $count);
    if (data) {
      let qStr = typeof data === "string" ? data : qs.stringify(data);
      console.log("qStr", qStr);
      data = qStr.startsWith("?") ? qStr.substring(1) : qStr;
    } else {
      //请求体不能undefined，否则contenttype不起作用
      data = "";
    }
    let headers = this.getAxiosHeaders(ContentType.TEXT_PLAIN);
    return this.httpRequest.post<number>({
      url,
      data,
      headers,
      withToken: true,
    });
  }

  query<T>(url: string, data?: any) {
    console.log("query data", data);

    url = this.formatUrl(url, "$query");
    if (data) {
      let qStr = typeof data === "string" ? data : qs.stringify(data);
      console.log("qStr", qStr);
      data = qStr.startsWith("?") ? qStr.substring(1) : qStr;
    } else {
      //请求体不能undefined，否则contenttype不起作用
      data = "";
    }
    let headers = this.getAxiosHeaders(ContentType.TEXT_PLAIN);
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

  post<T = any>(url: string, data: any) {
    url = this.formatUrl(url);
    let headers = this.getAxiosHeaders(ContentType.JSON);
    return this.httpRequest.post<T>({ url, data, headers, withToken: true });
  }

  put<T = any>(url: string, id: string, data: any) {
    url = this.formatUrl(url, id);
    let headers = this.getAxiosHeaders(ContentType.JSON);
    return this.httpRequest.put<T>({ url, data, headers, withToken: true });
  }

  patch<T = any>(url: string, id: string, data: any) {
    url = this.formatUrl(url, id);
    let headers = this.getAxiosHeaders(ContentType.JSON);
    return this.httpRequest.patch<T>({ url, data, headers, withToken: true });
  }

  delete<T = any>(url: string, id: string, data: any) {
    url = this.formatUrl(url, id);
    let headers = this.getAxiosHeaders();
    return this.httpRequest.delete<T>({ url, data, headers, withToken: true });
  }

  exec<T = any>(url: string, data: any) {
    url = this.formatUrl(url);
    let headers = this.getAxiosHeaders(ContentType.JSON);
    return this.httpRequest.post<T>({ url, data, headers, withToken: true });
  }

  private formatUrl<T>(url: string, id?: string) {
    let idPath = id ? "/" + id : "";
    url = url.startsWith("/") ? url : "/" + url;
    return url.startsWith("http")
      ? url
      : getODataUrl(url, this.apiVersion) + idPath;
  }

  private getAxiosHeaders(contentType?: ContentType) {
    let headers = new AxiosHeaders();
    headers.setAccept(ODataMetadata.None);
    if (contentType) headers.setContentType(contentType, true);
    console.log("headers", headers, contentType);
    return headers;
  }
}
