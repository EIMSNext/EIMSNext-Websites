import appSetting from "../appSetting";

export class AccessToken {
  get(): string | null | undefined {
    if (appSetting.tokenKey) return localStorage.getItem(appSetting.tokenKey);
  }

  set(token: string, expiresIn: number): void {
    if (appSetting.tokenKey) {
      localStorage.setItem(appSetting.tokenKey, token);

      //提前5分钟过期
      let nowInMilliseconds = new Date().getTime();
      let expiresInTime = nowInMilliseconds + (expiresIn - 300) * 1000;

      localStorage.setItem(
        `${appSetting.tokenKey}_exp`,
        expiresInTime.toString()
      );
    }
  }

  clear(): void {
    if (appSetting.tokenKey) {
      localStorage.removeItem(appSetting.tokenKey);
      localStorage.removeItem(`${appSetting.tokenKey}_exp`);
    }
  }

  isLoggedIn(): boolean {
    if (appSetting.tokenKey) {
      let token = localStorage.getItem(appSetting.tokenKey);
      if (token) {
        let expiresInTime = localStorage.getItem(`${appSetting.tokenKey}_exp`);
        if (expiresInTime) {
          let nowInMilliseconds = new Date().getTime();
          return nowInMilliseconds < parseInt(expiresInTime);
        }
      }
    }

    return false;
  }
}

const accessToken = new AccessToken();
export default accessToken;
