import { ODataServiceBase } from "../interface";
import { Role, RoleRequest } from "@eimsnext/models";

export class RoleService extends ODataServiceBase<Role, RoleRequest> {
    protected modelName(): string {
        return "Role";
    }
}

const roleService = new RoleService()
export { roleService }

