import { ReadonlyODataServiceBase } from "../interface";
import { DfExecLog, DfRunLogDetail, DfRunLogQueryParams, DfRunLogQueryResult } from "@eimsnext/models";

export class DfExecLogService extends ReadonlyODataServiceBase<DfExecLog> {
  protected modelName(): string {
    return "DfExecLog";
  }

  queryRuns(params: DfRunLogQueryParams): Promise<DfRunLogQueryResult> {
    return this.http().api.get<DfRunLogQueryResult>("/DfExecLog/Runs", params);
  }

  getRunDetail(runLogId: string): Promise<DfRunLogDetail> {
    return this.http().api.get<DfRunLogDetail>(`/DfExecLog/Runs/${runLogId}`);
  }
}

const dfExecLogService = new DfExecLogService();
export { dfExecLogService };
