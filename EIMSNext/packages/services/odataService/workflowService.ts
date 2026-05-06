import { ServiceBase } from "../interface";
import {
  StartRequest,
  ApproveRequest,
  ReturnRequest,
  TransferRequest,
  AddSignRequest,
  WithdrawRequest,
  UrgeRequest,
  ReturnTargetNode,
  WorkflowActionStatus,
} from "@eimsnext/models";

export class WorkflowService extends ServiceBase {
  protected modelName(): string {
    return "Workflow";
  }

  start(data: StartRequest): Promise<any> {
    let url = this.getUrl(this.modelName(), "Start");
    return this.http().api.post<any>(url, data);
  }

  approve(data: ApproveRequest) {
    let url = this.getUrl(this.modelName(), "Approve");
    return this.http().api.post<any>(url, data);
  }

  submit(data: ApproveRequest) {
    return this.http().api.post<any>(this.getUrl(this.modelName(), "Submit"), data);
  }

  reject(data: ApproveRequest) {
    return this.http().api.post<any>(this.getUrl(this.modelName(), "Reject"), data);
  }

  return(data: ReturnRequest) {
    return this.http().api.post<any>(this.getUrl(this.modelName(), "Return"), data);
  }

  addSign(data: AddSignRequest) {
    return this.http().api.post<any>(this.getUrl(this.modelName(), "AddSign"), data);
  }

  transfer(data: TransferRequest) {
    return this.http().api.post<any>(this.getUrl(this.modelName(), "Transfer"), data);
  }

  withdraw(data: WithdrawRequest) {
    let url = this.getUrl(this.modelName(), "Withdraw");
    return this.http().api.post<any>(url, data);
  }

  urge(data: UrgeRequest) {
    let url = this.getUrl(this.modelName(), "Urge");
    return this.http().api.post<any>(url, data);
  }

  getActionStatus(dataId: string, wfInstanceId?: string) {
    const query = wfInstanceId
      ? `?dataId=${encodeURIComponent(dataId)}&wfInstanceId=${encodeURIComponent(wfInstanceId)}`
      : `?dataId=${encodeURIComponent(dataId)}`;
    return this.http().api.get<WorkflowActionStatus>(`${this.getUrl(this.modelName(), "ActionStatus")}${query}`);
  }

  getReturnTargets(dataId: string, wfInstanceId?: string) {
    const query = wfInstanceId
      ? `?dataId=${encodeURIComponent(dataId)}&wfInstanceId=${encodeURIComponent(wfInstanceId)}`
      : `?dataId=${encodeURIComponent(dataId)}`;
    return this.http().api.get<ReturnTargetNode[]>(`${this.getUrl(this.modelName(), "ReturnTargets")}${query}`);
  }

  private getUrl<T>(url: string, id?: string) {
    let idPath = id ? "/" + id : "";
    url = url.startsWith("/") ? url : "/" + url;
    return url.startsWith("http") ? url : `${url}${idPath}`;
  }
}

const workflowService = new WorkflowService();
export { workflowService };
