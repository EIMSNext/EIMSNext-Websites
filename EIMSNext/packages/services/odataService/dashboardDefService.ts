import { ODataServiceBase } from "../interface";
import { DashboardDef, DashboardDefRequest } from "@eimsnext/models";

export class DashboardDefService extends ODataServiceBase<DashboardDef, DashboardDefRequest> {
    protected modelName(): string {
        return "DashboardDef";
    }
}

const dashboardDefService = new DashboardDefService()
export { dashboardDefService }

