import { ODataServiceBase } from "../interface";
import { MoveRoleTreeNodeRequest, Role, RoleRequest } from "@eimsnext/models";

export class RoleService extends ODataServiceBase<Role, RoleRequest> {
  protected modelName(): string {
    return "Role";
  }

  addEmps(roleId: string, empIds: string[]): Promise<void> {
    return this.http().api.exec(`/${this.modelName()}/AddEmps`, {
      roleId,
      empIds,
    });
  }

  removeEmps(roleId: string, empIds: string[]): Promise<void> {
    return this.http().api.exec(`/${this.modelName()}/RemoveEmps`, {
      roleId,
      empIds,
    });
  }

  move(data: MoveRoleTreeNodeRequest): Promise<void> {
    return this.http().api.post<void>("/Role/Move", data);
  }
}

const roleService = new RoleService();
export { roleService };
