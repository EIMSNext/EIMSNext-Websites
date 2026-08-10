import { ODataServiceBase } from "../interface";
import { AuthGroup, AuthGroupRequest, AuthGroupType } from "@eimsnext/models";

export class AuthGroupService extends ODataServiceBase<AuthGroup, AuthGroupRequest> {
    protected modelName(): string {
        return "AuthGroup";
    }

    async getAssigned(formId: string): Promise<AuthGroup[]> {
        const groups = await this.http().api.get<AuthGroup[]>("/FormData/authgroups", { formId });
        return groups.map((group) => ({
            ...group,
            type: String(group.type) as AuthGroupType,
            fieldPerms: group.fieldPerms ?? [],
        }));
    }
}

const authGroupService = new AuthGroupService()
export { authGroupService }

