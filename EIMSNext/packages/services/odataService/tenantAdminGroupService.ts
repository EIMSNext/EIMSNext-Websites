import { ODataServiceBase } from "../interface";
import {
  TenantAdminGroup,
  TenantAdminGroupRequest,
  MoveTenantAdminGroupRequest,
} from "@eimsnext/models";

export class TenantAdminGroupService extends ODataServiceBase<TenantAdminGroup, TenantAdminGroupRequest> {
  protected modelName(): string {
    return "TenantAdminGroup";
  }

  move(data: MoveTenantAdminGroupRequest): Promise<TenantAdminGroup> {
    return this.http().api.post<TenantAdminGroup>("/TenantAdminGroup/Move", data);
  }
}

const tenantAdminGroupService = new TenantAdminGroupService();
export { tenantAdminGroupService };
