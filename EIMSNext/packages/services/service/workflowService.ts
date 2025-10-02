import { ServiceBase } from "../interface";
import { StartRequest, ApproveRequest } from "@eimsnext/models";

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

  private getUrl<T>(url: string, id?: string) {
    let idPath = id ? "/" + id : "";
    url = url.startsWith("/") ? url : "/" + url;
    return url.startsWith("http") ? url : `${url}${idPath}`;
  }
}

const workflowService = new WorkflowService();
export { workflowService };
