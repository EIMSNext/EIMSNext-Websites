import type { PluginInstall, PluginProfile, PluginProfileQueryRequest } from "@eimsnext/models";
import { ServiceBase } from "../interface";

export class PluginProfileService extends ServiceBase {
  query(params: PluginProfileQueryRequest) {
    return this.http().api.get<{ total: number; items: PluginProfile[] }>("/system/pluginstore", params);
  }

  get(id: string) {
    return this.http().api.get<PluginProfile>(`/system/pluginstore/${id}`);
  }

  install(id: string) {
    return this.http().api.post<{ pluginInstallId: string }>(`/system/pluginstore/${id}/install`, {});
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

const pluginProfileService = new PluginProfileService();
export { pluginProfileService };
