import { CurrentUser } from "@eimsnext/models";
import { ServiceBase } from "../interface";

export class SystemService extends ServiceBase {
  getCurrentUser(): Promise<CurrentUser> {
    return this.http().api.get<CurrentUser>("/system/currentuser");
  }

  getAppMenuPerms(appId: string): Promise<any> {
    return this.http().api.get<any>(`/system/AppMenuPerms?appId=${appId}`);
  }

  switchCorp(corpId: string): Promise<any> {
    return this.http().api.post<any>("/system/SwitchCorp", { corpId: corpId });
  }

  updateSecret(clientId: string, secret: string): Promise<any> {
    return this.http().api.post<any>("/system/updateSecret", {
      clientId: clientId,
      secret: secret,
    });
  }
}

const systemService = new SystemService();
export { systemService };
