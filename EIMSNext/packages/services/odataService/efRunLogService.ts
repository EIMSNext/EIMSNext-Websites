import { ReadonlyODataServiceBase } from "../interface";
import { EfRunLogNode, EfRunLogDetail, EfRunLogQueryParams, EfRunLogQueryResult } from "@eimsnext/models";

export class EfRunLogService extends ReadonlyODataServiceBase<EfRunLogNode> {
  protected modelName(): string {
    return "EfRunLogNode";
  }

  queryRuns(params: EfRunLogQueryParams): Promise<EfRunLogQueryResult> {
    return this.http().api.get<EfRunLogQueryResult>("/EfRunLog/Runs", params);
  }

  getRunDetail(runLogId: string): Promise<EfRunLogDetail> {
    return this.http().api.get<EfRunLogDetail>(`/EfRunLog/Runs/${runLogId}`);
  }

  retryRun(runLogId: string, nodeId: string): Promise<{ runLogId: string; queued: boolean }> {
    return this.http().api.post(`/EfRunLog/${runLogId}/Retry`, { nodeId });
  }
}

const efRunLogService = new EfRunLogService();
export { efRunLogService };
