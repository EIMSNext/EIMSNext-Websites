import type { AppProfile, AppProfileRequest } from "../../models/dto/appProfile";
import { ServiceBase } from "../interface";

export class AppProfileService extends ServiceBase {
  query(params: AppProfileRequest) {
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
