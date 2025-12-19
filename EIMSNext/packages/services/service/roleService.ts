import { ODataServiceBase } from "../interface";
import { Role, RoleRequest } from "@eimsnext/models";

export class RoleService extends ODataServiceBase<Role, RoleRequest> {
  protected modelName(): string {
    return "Role";
  }

  addEmps(roleId: string, empIds: string[]): Promise<void> {
    return this.http().api.exec(`${this.modelName()}/addemps`, {
      roleId,
      empIds,
    });
  }
}

const roleService = new RoleService();
export { roleService };
