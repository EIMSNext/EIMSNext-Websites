import { ODataServiceBase } from "../interface";
import { WorkbenchConfig, WorkbenchConfigRequest } from "@eimsnext/models";

export class WorkbenchConfigService extends ODataServiceBase<WorkbenchConfig, WorkbenchConfigRequest> {
  protected modelName(): string {
    return "WorkbenchConfig";
  }
}

const workbenchConfigService = new WorkbenchConfigService();
export { workbenchConfigService };
