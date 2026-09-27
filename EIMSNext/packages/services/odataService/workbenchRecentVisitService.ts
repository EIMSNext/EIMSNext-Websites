import { ODataServiceBase } from "../interface";
import { WorkbenchRecentVisit, WorkbenchRecentVisitRequest } from "@eimsnext/models";

export class WorkbenchRecentVisitService extends ODataServiceBase<WorkbenchRecentVisit, WorkbenchRecentVisitRequest> {
  protected modelName(): string {
    return "WorkbenchRecentVisit";
  }
}

const workbenchRecentVisitService = new WorkbenchRecentVisitService();
export { workbenchRecentVisitService };
