import { Department } from "./department";
import { CorpModelBase, IdBase } from "./modelBase";

export interface EmployeeRequest extends IdBase {
  code: string;
  empName: string;
  workPhone?: string;
  workEmail?: string;
  departmentId: string;
  isManager: boolean;
  invite?: string;
}

export interface Employee extends CorpModelBase {
  code: string;
  empName: string;
  userId?: string;
  userName?: string;
  workPhone?: string;
  workEmail?: string;
  status: number;
  departmentId: string;
  isManager: boolean;
  approved: boolean;
  department?: Department;
}
