import type { AppProfile, AppProfileQueryRequest } from "@eimsnext/models";
import { ServiceBase } from "../interface";

export class AppProfileService extends ServiceBase {
  query(params: AppProfileQueryRequest) {
    return this.http().api.get<{ total: number; items: AppProfile[] }>("/open/appstore", params);
  }

  get(id: string) {
    return this.http().api.get<AppProfile>(`/open/appstore/${id}`);
  }

  install(id: string) {
    return this.http().api.post<{ appId: string }>(`/open/appstore/${id}/install`, {});
  }
}

const appProfileService = new AppProfileService();
export { appProfileService };
