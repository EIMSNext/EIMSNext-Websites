import { ODataServiceBase } from "../interface";
import { AdminGroup, AdminGroupRequest } from "@eimsnext/models";

export class AdminGroupService extends ODataServiceBase<AdminGroup, AdminGroupRequest> {
    protected modelName(): string {
        return "AdminGroup";
    }
}

const adminGroupService = new AdminGroupService()
export { adminGroupService }

