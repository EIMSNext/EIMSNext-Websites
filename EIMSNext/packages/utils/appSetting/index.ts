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
  authUrl: string = "http://auth.eimsnext.com";
  apiUrl: string = "http://api.eimsnext.com";
  uploadUrl: string = "http://upload.eimsnext.com";
  tokenKey: string = "jat";
  httpTimeout: number = 10000;

  merge(env: any): void {
    for (let p of Reflect.ownKeys(this)) {
      if (env[p]) Reflect.set(this, p, env[p]);
    }
  }
}

const appSetting = new AppSetting();
export default appSetting;
