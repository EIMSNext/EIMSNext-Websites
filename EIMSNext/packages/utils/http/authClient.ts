import { AxiosHeaders } from "axios";
import { appSetting, getAuthUrl } from "../appSetting";
import { HttpRequest } from "./httpRequest";
import { ContentType } from "./interface";
import accessToken from "./token";

const utf8ToBase64 = (s: string) => btoa(unescape(encodeURIComponent(s)));

export class PublicTokenError extends Error {
  constructor(message = "访问密码错误") {
    super(message);
    this.name = "PublicTokenError";
  }
}

export class AuthClient {
  private httpRequest: HttpRequest;
  constructor(request: HttpRequest) {
    this.httpRequest = request;
  }

  login(username: string, password: string, grant_type = "password") {
    return this.exchangeToken(username, password, grant_type, true);
  }

  requestToken(username: string, password: string, grant_type = "password") {
    return this.exchangeToken(username, password, grant_type, false);
  }

  /**
   * 申请公开访问 token。
   * - 不写入全局 accessToken（页面级 token 隔离）
   * - 401 → 抛 PublicTokenError（accessCode 错误友好提示）
   * - scope 必传，对应后端 PublicScope 枚举的单选值
   */
  async requestPublicToken(
    targetId: string,
    accessCode: string | undefined,
    scope: string | number,
  ): Promise<{ access_token: string; expires_in: number; [k: string]: any }> {
    let password: string;
    if (accessCode) {
      password = accessCode;
    } else {
      const challenge = await this.httpRequest.get<{ password: string; expiresAt: number }>({
        url: `${appSetting.authUrl}/api/public/challenge`,
        params: { targetId },
        withToken: false,
        headers: new AxiosHeaders(),
      });
      password = challenge.password;
    }

    try {
      return (await this.exchangeToken(
        `public_${targetId}`,
        password,
        "public",
        false,
        `${appSetting.authUrl}/public/token`,
        { scope: String(scope) },
        appSetting.publicClientId,
      )) as { access_token: string; expires_in: number; [k: string]: any };
    } catch (err: any) {
      if (err?.response?.status === 401) {
        throw new PublicTokenError();
      }
      throw err;
    }
  }

  private exchangeToken(
    username: string,
    password: string,
    grant_type = "password",
    persist = true,
    endpoint?: string,
    extraFields?: Record<string, string>,
    clientId = appSetting.clientId,
  ) {
    const payload = {
      username,
      password,
      grant_type,
      client_id: clientId,
      ...(extraFields || {}),
    };
    const encrypted = utf8ToBase64(JSON.stringify(payload));
    const url = endpoint || `${appSetting.authUrl}/auth/login`;
    const headers = new AxiosHeaders();
    headers.setContentType(ContentType.FORM_URLENCODED);
    return new Promise((resolve, reject) => {
      this.httpRequest
        .post({ url, data: { encrypted }, headers, withToken: false })
        .then((res) => {
          if (persist) {
            accessToken.set(res.access_token, res.expires_in);
          }

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
    withToken?: boolean,
  ) {
    url = getAuthUrl(url, false);
    let headers = new AxiosHeaders();
    headers.setContentType(contentType);
    return this.httpRequest.post<T>({ url, data, headers, withToken });
  }
}
