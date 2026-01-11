import { CorpModelBase, IdBase } from "./modelBase";

export interface AuthGroupRequest extends IdBase {
  appId?: string;
  formId?: string;
  name?: string;
  desc?: string;
  type?: AuthGroupType;
  members?: Member[];
  dataPerms?: DataPerms;
  dataFilter?: string;
  fieldPerms?: IFieldPerm[];
  disabled?: boolean;
}

export interface AuthGroup extends CorpModelBase {
  appId: string;
  formId: string;
  name: string;
  desc?: string;
  type: AuthGroupType;
  members?: Member[];
  dataPerms: DataPerms;
  dataFilter?: string;
  fieldPerms?: IFieldPerm[];
  disabled: boolean;
}

export enum AuthGroupType {
  ManageSelfData = "0",
  ViewAllData = "1",
  ManageAllData = "2",
  Custom = "3",
}

export interface Member {
  id: string;
  code?: string;
  label: string;
  type: MemberType;
  cascadedDept: boolean;
}

export enum MemberType {
  None = "0",
  Department = "1",
  Employee = "2",
  Role = "3",
}

export enum DataPerms {
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

export interface IFieldPerm {
  id: string;
  visible: boolean;
  editable: boolean;
  tableInsert?: boolean;
  tableEdit?: boolean;
  tableDelete?: boolean;
}
