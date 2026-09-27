import {
  AddSignRequest,
  ApproveRequest,
  ChangeApproverRequest,
  FlowManageQueryRequest,
  FlowManageTaskQueryResult,
  ReturnRequest,
  ReturnTargetNode,
  StartRequest,
  TerminateWorkflowRequest,
  TransferRequest,
  UrgeRequest,
  WithdrawRequest,
  WorkflowActionStatus,
  WorkflowNodeAction,
} from "@eimsnext/models";
import { ServiceBase } from "../interface";

export class WorkflowService extends ServiceBase {
  protected modelName(): string {
    return "Workflow";
  }

  start(data: StartRequest): Promise<any> {
    return this.http().api.post<any>(this.getUrl(this.modelName(), "Start"), data);
  }

  approve(data: ApproveRequest) {
    return this.http().api.post<any>(this.getUrl(this.modelName(), "Approve"), data);
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
    return this.http().api.post<any>(this.getUrl(this.modelName(), "Withdraw"), data);
  }

  urge(data: UrgeRequest) {
    return this.http().api.post<any>(this.getUrl(this.modelName(), "Urge"), data);
  }

  getActionStatus(dataId: string, wfInstanceId?: string) {
    const query = wfInstanceId
      ? `?dataId=${encodeURIComponent(dataId)}&wfInstanceId=${encodeURIComponent(wfInstanceId)}`
      : `?dataId=${encodeURIComponent(dataId)}`;
    return this.http().api.get<WorkflowActionStatus>(`${this.getUrl(this.modelName(), "ActionStatus")}${query}`);
  }

  getNodeActions(dataId: string, wfInstanceId: string) {
    const query = `?dataId=${encodeURIComponent(dataId)}&wfInstanceId=${encodeURIComponent(wfInstanceId)}`;
    return this.http().api.get<WorkflowNodeAction[]>(`${this.getUrl(this.modelName(), "NodeActions")}${query}`);
  }

  getReturnNodes(dataId: string, wfInstanceId?: string) {
    const query = wfInstanceId
      ? `?dataId=${encodeURIComponent(dataId)}&wfInstanceId=${encodeURIComponent(wfInstanceId)}`
      : `?dataId=${encodeURIComponent(dataId)}`;
    return this.http().api.get<ReturnTargetNode[]>(`${this.getUrl(this.modelName(), "ReturnNodes")}${query}`);
  }

  async queryManageTasks(params: FlowManageQueryRequest): Promise<FlowManageTaskQueryResult> {
    return this.http().api.get<FlowManageTaskQueryResult>(this.getUrl(this.modelName(), "ManageTasks"), params);
  }

  terminate(data: TerminateWorkflowRequest): Promise<any> {
    return this.http().api.post<any>(this.getUrl(this.modelName(), "Terminate"), data);
  }

  changeApprover(data: ChangeApproverRequest): Promise<any> {
    return this.http().api.post<any>(this.getUrl(this.modelName(), "ChangeApprover"), data);
  }

  private getUrl<T>(url: string, id?: string) {
    const idPath = id ? "/" + id : "";
    url = url.startsWith("/") ? url : "/" + url;
    return url.startsWith("http") ? url : `${url}${idPath}`;
  }
}

const workflowService = new WorkflowService();
export { workflowService };
