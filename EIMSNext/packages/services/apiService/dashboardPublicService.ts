import { DashboardDef, DashboardItemDef, FormData } from "@eimsnext/models";
import { AggCalcRequest } from "../requestModel";
import { IFormDataFilterOptionsRequest, IFormDataFilterOptionsResponse, IDynamicFindOptions } from "../requestModel";
import { ServiceBase } from "../interface";

export interface DashboardPublicPayload {
  dashboard: DashboardDef;
  items: DashboardItemDef[];
}

export class DashboardPublicService extends ServiceBase {
  getDashboard(token: string): Promise<DashboardPublicPayload> {
    return this.http().api.get<DashboardPublicPayload>(`/open/dashboard/${token}`);
  }

  calculate(token: string, itemId: string, req: AggCalcRequest): Promise<any[]> {
    return this.http().api.post<any[]>(`/open/dashboard/${token}/chart?itemId=${encodeURIComponent(itemId)}`, req);
  }

  countData(token: string, itemId: string, options?: IDynamicFindOptions): Promise<number> {
    return this.http().api.post<number>(`/open/dashboard/${token}/data/count`, { itemId, options });
  }

  queryData(token: string, itemId: string, options?: IDynamicFindOptions): Promise<FormData[]> {
    return this.http().api.query(`/open/dashboard/${token}/data/query`, { itemId, options });
  }

  getFilterOptions(token: string, itemId: string, options: IFormDataFilterOptionsRequest): Promise<IFormDataFilterOptionsResponse> {
    return this.http().api.post<IFormDataFilterOptionsResponse>(`/open/dashboard/${token}/filter/options`, { itemId, options });
  }
}

const dashboardPublicService = new DashboardPublicService();
export { dashboardPublicService };
