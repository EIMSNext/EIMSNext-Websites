export interface IAppSetting {
  clientId: string;
  authUrl: string;
  apiUrl: string;
  uploadUrl: string;
  tokenKey: string;
  httpTimeout: number;

  merge(env: any): void;
}

class AppSetting implements IAppSetting {
  clientId: string = "EIMSD160507G0401S171201B1014Next";
  authUrl: string = "https://auth.eimsnext.com";
  apiUrl: string = "https://api.eimsnext.com";
  uploadUrl: string = "https://upload.eimsnext.com";
  tokenKey: string = "jat";
  httpTimeout: number = 10000;

  merge(env: any): void {
    for (let p of Reflect.ownKeys(this)) {
      if (env[p]) Reflect.set(this, p, env[p]);
    }
  }
}

export function getAuthUrl(url: string, isApi: boolean = true) {
  return url.startsWith("http")
    ? url
    : isApi
      ? `${appSetting.authUrl}/api${url}`
      : `${appSetting.authUrl}${url}`;
}

export function getApiUrl(url: string, ver: string = "v1") {
  return url.startsWith("http") ? url : `${appSetting.apiUrl}/api/${ver}${url}`;
}

export function getODataUrl(url: string, ver: string = "v1") {
  return url.startsWith("http")
    ? url
    : `${appSetting.apiUrl}/odata/${ver}${url}`;
}

export function getUploadUrl(url: string, ver: string = "v1") {
  return url.startsWith("http")
    ? url
    : `${appSetting.uploadUrl}/api/${ver}${url}`;
}

const appSetting = new AppSetting();
export default appSetting;
