import { ODataServiceBase } from "../interface";
import { AuthGroup, AuthGroupRequest } from "@eimsnext/models";

export class AuthGroupService extends ODataServiceBase<AuthGroup, AuthGroupRequest> {
    protected modelName(): string {
        return "AuthGroup";
    }
}

const authGroupService = new AuthGroupService()
export { authGroupService }

