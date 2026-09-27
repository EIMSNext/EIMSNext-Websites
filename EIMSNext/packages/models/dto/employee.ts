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

export interface Employee extends CorpModelBase {
  code: string;
  empName: string;
  userId?: string;
  userName?: string;
  workPhone?: string;
  workEmail?: string;
  status: number;
  userBound: boolean;
  depts?: EmpDept[];
}

export enum EmployeeStatus {
  Active = 0,
  Inactive = 1,
  PendingReview = 2,
}
