import { ODataServiceBase } from "../interface";
import { WfApprovalLog } from "@eimsnext/models";

export class WfApprovalLogService extends ODataServiceBase<WfApprovalLog, WfApprovalLog> {
    protected modelName(): string {
        return "WfApprovalLog";
    }
}

const wfApprovalLogService = new WfApprovalLogService()
export { wfApprovalLogService }

