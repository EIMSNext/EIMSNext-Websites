import { ODataServiceBase } from "../interface";
import { DashboardItemDef, DashboardItemDefRequest } from "@eimsnext/models";

export class DashboardItemDefService extends ODataServiceBase<DashboardItemDef, DashboardItemDefRequest> {
    protected modelName(): string {
        return "DashboardItemDef";
    }
}

const dashboardItemDefService = new DashboardItemDefService()
export { dashboardItemDefService }

