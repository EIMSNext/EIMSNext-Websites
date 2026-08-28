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
}

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
  adminScope?: boolean;
}

export interface IDynamicMemberGroup extends IListItem {
  items: ISelectedTag[];
}
