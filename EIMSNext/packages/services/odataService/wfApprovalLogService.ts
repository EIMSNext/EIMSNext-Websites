import { ReadonlyODataServiceBase } from "../interface";
import { WfApprovalLog } from "@eimsnext/models";

export class WfApprovalLogService extends ReadonlyODataServiceBase<WfApprovalLog> {
  protected modelName(): string {
    return "WfApprovalLog";
  }
}

const wfApprovalLogService = new WfApprovalLogService();
export { wfApprovalLogService };
