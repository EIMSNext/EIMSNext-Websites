export interface IAppSetting {
  clientId: string;
  publicClientId: string;
  identityUrl: string;
  apiUrl: string;
  uploadUrl: string;
  tokenKey: string;
  httpTimeout: number;

  merge(env: any): void;
}

class AppSetting implements IAppSetting {
  clientId: string = "EIMSD160507G0401S171201B1014Next";
  publicClientId: string = "eimsnext.public";
  identityUrl: string = "https://identity.eimsnext.com";
  apiUrl: string = "https://api.eimsnext.com";
  uploadUrl: string = "https://file.eimsnext.com";
  tokenKey: string = "jat";
  httpTimeout: number = 10000;

  merge(env: any): void {
    for (let p of Reflect.ownKeys(this)) {
      if (env[p]) Reflect.set(this, p, env[p]);
    }
  }
}

export function getIdentityUrl(url: string, isApi: boolean = true) {
  return url.startsWith("http")
    ? url
    : isApi
      ? `${appSetting.identityUrl}/api${url}`
      : `${appSetting.identityUrl}${url}`;
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

export function getFileFullUrl(value: string | null | undefined): string {
  if (!value) return "";
  const normalized = String(value).replace(/\\/g, "/");
  if (/^(https?:|data:|blob:|\/\/)/i.test(normalized)) return normalized;
  return `${appSetting.uploadUrl.replace(/\/$/, "")}/${normalized.replace(/^\/+/, "")}`;
}

export const appSetting = new AppSetting();
