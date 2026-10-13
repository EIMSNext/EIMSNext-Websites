import { AxiosHeaders } from "axios";
import { appSetting, getIdentityUrl } from "../appSetting";
import { HttpRequest } from "./httpRequest";
import { ContentType } from "./interface";
import accessToken from "./token";

const utf8ToBase64 = (s: string) => btoa(unescape(encodeURIComponent(s)));

// authorizeCode 请求的 encrypted 混淆变体：真实 base64 前缀 eyJ（即 '{"'）
// 替换为 3 位随机数，并去掉末尾 = 补位；后端解密前由 UnscrambleEncrypted 还原
const scrambleBase64 = (b64: string) =>
  b64.replace(/^eyJ/, String(Math.floor(100 + Math.random() * 900))).replace(/=+$/, "");

export class PublicTokenError extends Error {
  constructor(message = "访问密码错误") {
    super(message);
    this.name = "PublicTokenError";
  }
}

export class PublicTokenExpiredError extends PublicTokenError {
  constructor(message = "公开访问链接已过期") {
    super(message);
    this.name = "PublicTokenExpiredError";
  }
}

export class IdentityClient {
  private httpRequest: HttpRequest;
  constructor(request: HttpRequest) {
    this.httpRequest = request;
  }

  /**
   * 开发环境明文登录：POST /dev/token（Development-only 端点，明文表单，
   * grant_type/client_id 由服务端强制，生产环境 404）。token 落盘，供 dev-login 页使用。
   */
  requestDevToken(username: string, password: string) {
    const headers = new AxiosHeaders();
    headers.setContentType(ContentType.FORM_URLENCODED);
    return new Promise((resolve, reject) => {
      this.httpRequest
        .post({
          url: `${appSetting.identityUrl}/dev/token`,
          data: { username, password },
          headers,
          withToken: false,
        })
        .then((res) => {
          accessToken.set(res.access_token, res.expires_in);
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 门户密码登录签发一次性授权码（60 秒有效、单次使用）。
   * 不返回 token：调用方（admin/mobile）拿 lg_ 前缀 code 自行换取并保存 token。
   */
  requestAuthorizationCode(username: string, password: string) {
    const payload = { username, password, client_id: appSetting.clientId };
    const encrypted = scrambleBase64(utf8ToBase64(JSON.stringify(payload)));
    const headers = new AxiosHeaders();
    headers.setContentType(ContentType.FORM_URLENCODED);
    return this.httpRequest.post<{ code: string; expires_in: number }>({
      url: `${appSetting.identityUrl}/identity/authorizeCode`,
      data: { encrypted },
      headers,
      withToken: false,
    });
  }

  /**
   * 以授权码换取 token（grant_type=authorization_code → /web/token）。
   * code 按前缀分发：lg_ 本站登录授权码；wx_/ww_/dd_/fs_ 第三方集成登录 code（后端直接换本站 token）。
   */
  requestWebToken(code: string, persist = true) {
    return this.webToken("", "", "authorization_code", persist, undefined, { code });
  }

  /**
   * 申请公开访问 token。
   * - 不写入全局 accessToken（页面级 token 隔离）
   * - 401、429 或 400 invalid_grant → 抛 PublicTokenError（accessCode 错误友好提示）
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
        url: `${appSetting.identityUrl}/api/public/challenge`,
        params: { targetId },
        withToken: false,
        headers: new AxiosHeaders(),
      });
      password = challenge.password;
    }

    try {
      const publicScope =
        typeof scope === "number"
          ? ({ 1: "DashLink", 2: "FormLink", 4: "DataLink", 8: "QueryLink" } as Record<number, string>)[scope] || String(scope)
          : scope;

      return (await this.webToken(
        `public_${targetId}`,
        password,
        "public",
        false,
        `${appSetting.identityUrl}/public/token`,
        { scope: String(publicScope) },
        appSetting.publicClientId,
      )) as { access_token: string; expires_in: number; [k: string]: any };
    } catch (err: any) {
      const status = err?.response?.status;
      const payload = err?.response?.data;
      const invalidGrant = payload?.error === "invalid_grant" ||
        String(payload?.error_description || "").includes("公开访问凭证无效");
      const expired = payload?.error === "invalid_grant" &&
        String(payload?.error_description || "").includes("公开访问链接已过期");
      if (expired) {
        throw new PublicTokenExpiredError();
      }
      if (status === 401 || status === 429 || (status === 400 && invalidGrant)) {
        throw new PublicTokenError();
      }
      throw err;
    }
  }

  private webToken(
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
    const url = endpoint || `${appSetting.identityUrl}/web/token`;
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

  get<T = any>(url: string, params?: any, withToken?: boolean, isApi = true) {
    return this.httpRequest.get<T>({ url: getIdentityUrl(url, isApi), params, withToken, headers: new AxiosHeaders() });
  }

  post<T = any>(
    url: string,
    data: any,
    contentType: ContentType = ContentType.JSON,
    withToken?: boolean,
  ) {
    url = getIdentityUrl(url, false);
    let headers = new AxiosHeaders();
    headers.setContentType(contentType);
    return this.httpRequest.post<T>({ url, data, headers, withToken });
  }
}
