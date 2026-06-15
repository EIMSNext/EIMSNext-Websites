import { ReadonlyODataServiceBase } from "../interface";
import { DfRunLogNode, DfRunLogDetail, DfRunLogQueryParams, DfRunLogQueryResult } from "@eimsnext/models";

export class DfRunLogService extends ReadonlyODataServiceBase<DfRunLogNode> {
  protected modelName(): string {
    return "DfRunLogNode";
  }

  queryRuns(params: DfRunLogQueryParams): Promise<DfRunLogQueryResult> {
    return this.http().api.get<DfRunLogQueryResult>("/DfRunLog/Runs", params);
  }

  getRunDetail(runLogId: string): Promise<DfRunLogDetail> {
    return this.http().api.get<DfRunLogDetail>(`/DfRunLog/Runs/${runLogId}`);
  }
}

const dfRunLogService = new DfRunLogService();
export { dfRunLogService };
