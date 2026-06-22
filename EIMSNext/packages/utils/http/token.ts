import { appSetting } from "../appSetting";

export class AccessToken {
  private runtimeToken?: string;
  private runtimeExpiresAt?: number;
  private runtimeActive = false;

  get(): string | null | undefined {
    if (this.runtimeActive) {
      if (this.runtimeToken && (!this.runtimeExpiresAt || new Date().getTime() < this.runtimeExpiresAt)) {
        return this.runtimeToken;
      }

      return undefined;
    }

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
    this.clearRuntime();
    if (appSetting.tokenKey) {
      localStorage.removeItem(appSetting.tokenKey);
      localStorage.removeItem(`${appSetting.tokenKey}_exp`);
    }
  }

  setRuntime(token: string, expiresIn?: number): void {
    this.runtimeActive = true;
    this.runtimeToken = token;
    this.runtimeExpiresAt = expiresIn ? new Date().getTime() + (expiresIn - 300) * 1000 : undefined;
  }

  clearRuntime(): void {
    this.runtimeActive = false;
    this.runtimeToken = undefined;
    this.runtimeExpiresAt = undefined;
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
