import { ODataServiceBase } from "../interface";
import { DfExecLog } from "@eimsnext/models";

export class DfExecLogService extends ODataServiceBase<DfExecLog, DfExecLog> {
    protected modelName(): string {
        return "DfExecLog";
    }
}

const dfExecLogService = new DfExecLogService()
export { dfExecLogService }

