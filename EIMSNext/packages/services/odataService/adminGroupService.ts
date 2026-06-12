import { ODataServiceBase } from "../interface";
import {
  AdminGroup,
  AdminGroupRequest,
  MoveAdminGroupRequest,
} from "@eimsnext/models";

export class AdminGroupService extends ODataServiceBase<AdminGroup, AdminGroupRequest> {
  protected modelName(): string {
    return "AdminGroup";
  }

  move(data: MoveAdminGroupRequest): Promise<AdminGroup> {
    return this.http().api.post<AdminGroup>("/AdminGroup/Move", data);
  }
}

const adminGroupService = new AdminGroupService();
export { adminGroupService };
