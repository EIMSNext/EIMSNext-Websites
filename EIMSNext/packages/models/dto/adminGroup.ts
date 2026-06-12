import { CorpModelBase, IdBase } from "./modelBase";

export enum AdminGroupType {
  Normal = "0",
  Folder = "1",
  System = "2",
}

export enum ScopeMode {
  All = "0",
  Partial = "1",
}

export enum PermissionLevel {
  None = "0",
  View = "1",
  Manage = "2",
}

export interface AdminGroupRequest extends IdBase {
  name?: string;
  description?: string;
  type?: AdminGroupType;
  parentId?: string;
  sortValue?: number;
  employeeIds?: string[];
  appIds?: string[];
  canCreateOrDeleteApp?: boolean;
  appDepartmentScopeMode?: ScopeMode;
  appDepartmentIds?: string[];
  appRoleScopeMode?: ScopeMode;
  appRoleIds?: string[];
  contactDepartmentPermission?: PermissionLevel;
  contactDepartmentScopeMode?: ScopeMode;
  contactDepartmentIds?: string[];
  contactRolePermission?: PermissionLevel;
  contactRoleScopeMode?: ScopeMode;
  contactRoleIds?: string[];
}

export interface AdminGroup extends CorpModelBase {
  name: string;
  description?: string;
  type: AdminGroupType;
  parentId: string;
  sortValue: number;
  employeeIds: string[];
  appIds: string[];
  canCreateOrDeleteApp: boolean;
  appDepartmentScopeMode: ScopeMode;
  appDepartmentIds: string[];
  appRoleScopeMode: ScopeMode;
  appRoleIds: string[];
  contactDepartmentPermission: PermissionLevel;
  contactDepartmentScopeMode: ScopeMode;
  contactDepartmentIds: string[];
  contactRolePermission: PermissionLevel;
  contactRoleScopeMode: ScopeMode;
  contactRoleIds: string[];
}

export interface MoveAdminGroupRequest {
  id: string;
  parentId: string;
  previousId?: string;
  nextId?: string;
}
