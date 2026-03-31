import { ReadonlyODataServiceBase } from "../interface";
import { DfExecLog } from "@eimsnext/models";

export class DfExecLogService extends ReadonlyODataServiceBase< DfExecLog> {
    protected modelName(): string {
        return "DfExecLog";
    }
}

const dfExecLogService = new DfExecLogService()
export { dfExecLogService }

