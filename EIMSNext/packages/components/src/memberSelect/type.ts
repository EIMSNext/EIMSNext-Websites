import { ISelectedTag } from "@/selectedTags/type";

export enum MemberTabs {
  None = 0,
  Department = 1,
  Role = 2,
  Employee = 4,
  Dynamic = 8,
  CurDept = 16,
  CurUser = 32,
}

export interface IMemberLimit {
  depts?: ISelectedTag[];
}
