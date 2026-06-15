import { AxiosHeaders } from "axios";
import { appSetting, getAuthUrl } from "../appSetting";
import { HttpRequest } from "./httpRequest";
import { ContentType } from "./interface";
import accessToken from "./token";

const utf8ToBase64 = (s: string) => btoa(unescape(encodeURIComponent(s)));

export class AuthClient {
  private httpRequest: HttpRequest;
  constructor(request: HttpRequest) {
    this.httpRequest = request;
  }

  login(username: string, password: string, grant_type = "password") {
    const payload = {
      username,
      password,
      grant_type,
      client_id: appSetting.clientId,
    };
    const encrypted = utf8ToBase64(JSON.stringify(payload));
    const url = `${appSetting.authUrl}/auth/login`;
    const headers = new AxiosHeaders();
    headers.setContentType(ContentType.FORM_URLENCODED);
    return new Promise((resolve, reject) => {
      this.httpRequest
        .post({ url, data: { encrypted }, headers, withToken: false })
        .then((res) => {
          accessToken.set(res.access_token, res.expires_in);
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  get<T = any>(url: string, params?: any, withToken?: boolean) {
    return this.httpRequest.get<T>({ url: getAuthUrl(url), params, withToken, headers: new AxiosHeaders() });
  }

  post<T = any>(
    url: string,
    data: any,
    contentType: ContentType = ContentType.JSON,
    withToken?: true,
  ) {
    url = getAuthUrl(url, false);
    let headers = new AxiosHeaders();
    headers.setContentType(contentType);
    return this.httpRequest.post<T>({ url, data, headers, withToken });
  }
}
