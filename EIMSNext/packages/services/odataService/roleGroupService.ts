import { ODataServiceBase } from "../interface";
import { RoleGroup, RoleGroupRequest } from "@eimsnext/models";

export class RoleGroupService extends ODataServiceBase<RoleGroup, RoleGroupRequest> {
    protected modelName(): string {
        return "RoleGroup";
    }
}

const roleGroupService = new RoleGroupService()
export { roleGroupService }

