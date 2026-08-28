import {
  TenantAccessSnapshot,
  CurrentUser,
  ECoinPrice,
  ECoinPriceBatchItem,
  PluginPublishRequest,
  PluginReloadResult,
  PluginRuntimeInfo,
} from "@eimsnext/models";
import { ServiceBase } from "../interface";

export class SystemService extends ServiceBase {
  getCurrentUser(): Promise<CurrentUser> {
    return this.http().api.get<CurrentUser>("/system/currentuser");
  }

  getAppMenuPerms(appId: string): Promise<any> {
    return this.http().api.get<any>(`/system/AppMenuPerms?appId=${appId}`);
  }

  getAdminPermissions(): Promise<TenantAccessSnapshot> {
    return this.http().api.get<TenantAccessSnapshot>("/system/AdminPermissions");
  }

  switchCorp(corpId: string): Promise<any> {
    return this.http().api.post<any>("/system/SwitchCorp", { corpId: corpId });
  }

  updateAvatar(avatar: string): Promise<{ avatar: string }> {
    return this.http().api.post<{ avatar: string }>("/system/updateavatar", { avatar });
  }

  updateSecret(clientId: string, secret: string): Promise<any> {
    return this.http().api.post<any>("/system/updateSecret", {
      clientId: clientId,
      secret: secret,
    });
  }

  getPlugins(): Promise<PluginRuntimeInfo[]> {
    return this.http().api.get<PluginRuntimeInfo[]>("/system/plugins");
  }

  getEnabledPlugins(): Promise<PluginRuntimeInfo[]> {
    return this.http().api.get<PluginRuntimeInfo[]>("/system/enabledplugins");
  }

  reloadPlugin(): Promise<PluginReloadResult> {
    return this.http().api.post<PluginReloadResult>("/system/reloadplugin", {});
  }

  publishPlugin(request: PluginPublishRequest): Promise<{ id: string; pluginId: string; version: string }> {
    return this.http().api.post("/system/pluginstore/publish", request);
  }

  batchUpsertECoinPrices(request: ECoinPriceBatchItem[]): Promise<ECoinPrice[]> {
    return this.http().api.post("/system/ecoinprice/batch", request);
  }
}

const systemService = new SystemService();
export { systemService };
