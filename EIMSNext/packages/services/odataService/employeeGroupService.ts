import { ODataServiceBase } from "../interface";
import { MoveEmployeeGroupTreeNodeRequest, EmployeeGroup, EmployeeGroupRequest } from "@eimsnext/models";

export class EmployeeGroupService extends ODataServiceBase<EmployeeGroup, EmployeeGroupRequest> {
  protected modelName(): string {
    return "EmployeeGroup";
  }

  addEmps(employeeGroupId: string, empIds: string[]): Promise<void> {
    return this.http().api.exec(`/${this.modelName()}/AddEmps`, {
      employeeGroupId,
      empIds,
    });
  }

  removeEmps(employeeGroupId: string, empIds: string[]): Promise<void> {
    return this.http().api.exec(`/${this.modelName()}/RemoveEmps`, {
      employeeGroupId,
      empIds,
    });
  }

  move(data: MoveEmployeeGroupTreeNodeRequest): Promise<void> {
    return this.http().api.post<void>("/EmployeeGroup/Move", data);
  }
}

const employeeGroupService = new EmployeeGroupService();
export { employeeGroupService };
