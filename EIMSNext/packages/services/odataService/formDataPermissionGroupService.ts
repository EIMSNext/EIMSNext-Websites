import { ODataServiceBase } from "../interface";
import { FormDataPermissionGroup, FormDataPermissionGroupRequest, FormDataPermissionMode } from "@eimsnext/models";

export class FormDataPermissionGroupService extends ODataServiceBase<FormDataPermissionGroup, FormDataPermissionGroupRequest> {
    protected modelName(): string {
        return "FormDataPermissionGroup";
    }

    async getAssigned(formId: string): Promise<FormDataPermissionGroup[]> {
        const groups = await this.http().api.get<FormDataPermissionGroup[]>("/FormData/permission-group", { formId });
        return groups.map((group) => ({
            ...group,
            type: String(group.type) as FormDataPermissionMode,
            formFieldPermissions: group.formFieldPermissions ?? [],
        }));
    }
}

const formDataPermissionGroupService = new FormDataPermissionGroupService()
export { formDataPermissionGroupService }

