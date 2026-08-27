import { CorpModelBase, IdBase } from "./modelBase";

export interface FormDataPermissionGroupRequest extends IdBase {
  appId?: string;
  formId?: string;
  name?: string;
  desc?: string;
  type?: FormDataPermissionMode;
  members?: Member[];
  formDataPermissions?: FormDataPermissions;
  dataFilter?: string;
  formFieldPermissions?: FormFieldPermission[];
  disabled?: boolean;
}

export interface FormDataPermissionGroup extends CorpModelBase {
  appId: string;
  formId: string;
  name: string;
  desc?: string;
  type: FormDataPermissionMode;
  members?: Member[];
  formDataPermissions: FormDataPermissions;
  dataFilter?: string;
  formFieldPermissions?: FormFieldPermission[];
  disabled: boolean;
}

export enum FormDataPermissionMode {
  ManageSelfData = "0",
  ViewAllData = "1",
  ManageAllData = "2",
  Custom = "3",
}

export interface Member {
  id: string;
  value?: string;
  label: string;
  type: MemberType;
  cascadedDept: boolean;
}

export enum MemberType {
  None = "0",
  Department = "1",
  Employee = "2",
  EmployeeGroup = "3",
}

export enum FormDataPermissions {
  None = 0,
  View = 1 << 0,
  AddNew = 1 << 1,
  Edit = 1 << 2,
  Copy = 1 << 3,
  Remove = 1 << 4,
  Import = 1 << 5,
  Export = 1 << 6,
  All = (1 << 7) - 1,
}

export interface FormFieldPermission {
  id: string;
  visible: boolean;
  editable: boolean;
  tableInsert?: boolean;
  tableEdit?: boolean;
  tableDelete?: boolean;
}
