import { ISelectedTag } from "@/selectedTags/type";
import { IListItem } from "@/list/type";

export enum MemberTabs {
  None = 0,
  Department = 1,
  EmployeeGroup = 2,
  Employee = 4,
  Dynamic = 8,
  CurDept = 16,
  CurUser = 32,
  DynamicParam = 64,
}

export type MemberSourceMode = "management" | "form-design" | "form-runtime" | "public";

export interface IMemberLimit {
  depts?: ISelectedTag[];
  employeeGroups?: ISelectedTag[];
}

export interface IMemberSelectOptions {
  showTabs?: MemberTabs | number;
  cascadedDept?: boolean;
  showCascade?: boolean;
  multiple?: boolean;
  limit?: IMemberLimit;
  dynamicMembers?: ISelectedTag[];
  dynamicManagerLevels?: number[];
  showContract?: false;
  sourceMode?: MemberSourceMode;
  formId?: string;
  fieldId?: string;
  sourceType?: "employee" | "department";
}

export interface IDynamicMemberGroup extends IListItem {
  items: ISelectedTag[];
}
