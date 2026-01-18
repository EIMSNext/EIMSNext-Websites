import { AxiosHeaders } from "axios";
import { HttpRequest } from "./httpRequest";
import { getUploadUrl } from "../appSetting";

export class UploadClient {
  private httpRequest: HttpRequest;
  private apiVersion = "v1";

  constructor(request: HttpRequest) {
    this.httpRequest = request;
  }

  upload(url: string, file: any, onUploadProgress: any, withToken?: true) {
    url = this.formatUrl(url);
    let headers = new AxiosHeaders();
    // headers.setContentType(ContentType.FORM_DATA);
    return this.httpRequest.request({
      url,
      data: file,
      headers,
      withToken,
      method: "Post",
      onUploadProgress: onUploadProgress,
    });
  }

  download(url: string, withToken?: true) {
    url = this.formatUrl(url);
    let headers = new AxiosHeaders();
    return this.httpRequest.request({ url, headers, withToken });
  }

  private formatUrl(url: string) {
    return getUploadUrl(url, this.apiVersion);
  }
}
