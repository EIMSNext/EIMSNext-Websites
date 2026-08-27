import { CorpModelBase, IdBase } from "./modelBase";

export enum TenantAdminGroupType {
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

export interface TenantAdminGroupRequest extends IdBase {
  name?: string;
  description?: string;
  type?: TenantAdminGroupType;
  parentId?: string;
  sortValue?: number;
  employeeIds?: string[];
  appIds?: string[];
  canCreateOrDeleteApp?: boolean;
  appDepartmentScopeMode?: ScopeMode;
  appDepartmentIds?: string[];
  appEmployeeGroupScopeMode?: ScopeMode;
  appEmployeeGroupIds?: string[];
  contactDepartmentPermission?: PermissionLevel;
  contactDepartmentScopeMode?: ScopeMode;
  contactDepartmentIds?: string[];
  contactEmployeeGroupPermission?: PermissionLevel;
  contactEmployeeGroupScopeMode?: ScopeMode;
  contactEmployeeGroupIds?: string[];
}

export interface TenantAdminGroup extends CorpModelBase {
  name: string;
  description?: string;
  type: TenantAdminGroupType;
  parentId: string;
  sortValue: number;
  employeeIds: string[];
  appIds: string[];
  canCreateOrDeleteApp: boolean;
  appDepartmentScopeMode: ScopeMode;
  appDepartmentIds: string[];
  appEmployeeGroupScopeMode: ScopeMode;
  appEmployeeGroupIds: string[];
  contactDepartmentPermission: PermissionLevel;
  contactDepartmentScopeMode: ScopeMode;
  contactDepartmentIds: string[];
  contactEmployeeGroupPermission: PermissionLevel;
  contactEmployeeGroupScopeMode: ScopeMode;
  contactEmployeeGroupIds: string[];
}

export interface TenantAccessSnapshot {
  isNormalAdmin: boolean;
  canCreateOrDeleteApp: boolean;
  manageableAppIds: string[];
  deletableAppIds: string[];
  appDepartmentScopeMode: ScopeMode;
  appDepartmentIds: string[];
  appEmployeeGroupScopeMode: ScopeMode;
  appEmployeeGroupIds: string[];
  contactViewDepartmentScopeMode: ScopeMode;
  contactViewDepartmentIds: string[];
  contactManageDepartmentScopeMode: ScopeMode;
  contactManageDepartmentIds: string[];
  contactViewEmployeeGroupScopeMode: ScopeMode;
  contactViewEmployeeGroupIds: string[];
  contactManageEmployeeGroupScopeMode: ScopeMode;
  contactManageEmployeeGroupIds: string[];
}

export interface MoveTenantAdminGroupRequest {
  id: string;
  parentId: string;
  previousId?: string;
  nextId?: string;
}
