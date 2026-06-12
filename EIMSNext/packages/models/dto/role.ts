import { CorpModelBase, IdBase } from "./modelBase";
import { RoleGroup } from "./roleGroup";

export interface RoleRequest extends IdBase {
  name?: string;
  description?: string;
  roleGroupId?: string;
  sortValue?: number;
}

export interface Role extends CorpModelBase {
  name: string;
  description: string;
  roleGroupId: string;
  sortValue: number;
  roleGroup?: RoleGroup;
}

export interface MoveRoleTreeNodeRequest {
  id: string;
  isGroup: boolean;
  roleGroupId: string;
  previousId?: string;
  nextId?: string;
}
