import { ReadonlyODataServiceBase } from "../interface";
import { WfTask } from "@eimsnext/models";

export class WfTaskService extends ReadonlyODataServiceBase<WfTask> {
  protected modelName(): string {
    return "WfTask";
  }
}

const wfTaskService = new WfTaskService();
export { wfTaskService };
