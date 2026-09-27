import type {
  WorkbenchCatalogApp,
  WorkbenchChartItem,
} from "@eimsnext/models";
import { ServiceBase } from "../interface";

export class WorkbenchService extends ServiceBase {
  getCatalog(): Promise<WorkbenchCatalogApp[]> {
    return this.http().api.get<WorkbenchCatalogApp[]>("/workbench/catalog");
  }

  getChartItem(dashboardItemId: string): Promise<WorkbenchChartItem> {
    return this.http().api.get<WorkbenchChartItem>(
      `/workbench/chartitem/${encodeURIComponent(dashboardItemId)}`
    );
  }
}

const workbenchService = new WorkbenchService();
export { workbenchService };
