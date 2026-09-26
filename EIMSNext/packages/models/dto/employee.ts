import { CorpModelBase, IdBase } from "./modelBase";

export interface EmployeeRequest extends IdBase {
  code?: string;
  empName?: string;
  workPhone?: string;
  workEmail?: string;
  departments?: EmployeeDepartmentRequest[];
  invite?: string;
}

export interface EmployeeDepartmentRequest {
  departmentId: string;
  isManager?: boolean;
  sortValue?: number;
}

export interface DepartmentRef {
  id: string;
  name: string;
  isManager?: boolean;
  sortValue?: number;
}

export interface EmpDept {
  deptId: string;
  deptName: string;
}

export interface EmployeeDepartment {
  employeeId: string;
  departmentId: string;
  isManager?: boolean;
  sortValue?: number;
  heriarchyId?: string;
  department?: { id?: string; name?: string };
}

export interface EmployeeGroupMember {
  employeeId: string;
  employeeGroupId: string;
  employeeGroupName?: string;
  sortValue?: number;
}

export type Employee = Omit<CorpModelBase, "createTime" | "updateTime"> & {
  createTime?: number | string;
  updateTime?: number | string;
  code: string;
  empName: string;
  userId?: string;
  userName?: string;
  workPhone?: string;
  workEmail?: string;
  status: number;
  userBound: boolean;
  departments?: EmployeeDepartment[];
  groups?: EmployeeGroupMember[];
};

export enum EmployeeStatus {
  Active = 0,
  Inactive = 1,
  PendingReview = 2,
}
