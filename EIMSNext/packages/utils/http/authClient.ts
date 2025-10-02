import { AxiosHeaders } from "axios";
import appSetting from "../appSetting";
import { HttpRequest } from "./httpRequest";
import { ContentType } from "./interface";
import accessToken from "./token";

export class AuthClient {
  private httpRequest: HttpRequest;
  constructor(request: HttpRequest) {
    this.httpRequest = request;
  }

  login(username: string, password: string, grant_type = "password") {
    let params = {
      username,
      password,
      grant_type,
      client_id: appSetting.clientId,
    };
    let url = `${appSetting.authUrl}/connect/token`;
    let headers = new AxiosHeaders();
    headers.setContentType(ContentType.FORM_URLENCODED);
    return new Promise((resolve, reject) => {
      this.httpRequest
        .post({ url, data: params, headers, withToken: false })
        .then((res) => {
          accessToken.set(res.access_token, res.expires_in);
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
