import type { PluginInstall, PluginProfile, PluginStoreRequest } from "@eimsnext/models";
import { ServiceBase } from "../interface";

export class PluginStoreService extends ServiceBase {
  query(params: PluginStoreRequest) {
    return this.http().api.get<{ total: number; items: PluginProfile[] }>("/open/pluginstore", params);
  }

  get(id: string) {
    return this.http().api.get<PluginProfile>(`/open/pluginstore/${id}`);
  }

  install(id: string) {
    return this.http().api.post<{ pluginInstallId: string }>(`/open/pluginstore/${id}/install`, {});
  }

  getInstalls() {
    return this.http().api.get<PluginInstall[]>("/system/plugininstalls");
  }

  enableInstall(id: string) {
    return this.http().api.post<string>(`/system/plugininstalls/${id}/enable`, {});
  }

  disableInstall(id: string) {
    return this.http().api.post<string>(`/system/plugininstalls/${id}/disable`, {});
  }

  deleteInstall(id: string) {
    return this.http().api.delete<string>(`/system/plugininstalls/${id}`, {});
  }
}

const pluginStoreService = new PluginStoreService();
export { pluginStoreService };
