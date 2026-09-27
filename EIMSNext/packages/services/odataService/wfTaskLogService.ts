import { ReadonlyODataServiceBase } from "../interface";
import { WfTaskLog } from "@eimsnext/models";

export class WfTaskLogService extends ReadonlyODataServiceBase<WfTaskLog> {
  protected modelName(): string {
    return "WfTaskLog";
  }
}

const wfTaskLogService = new WfTaskLogService();
export { wfTaskLogService };
