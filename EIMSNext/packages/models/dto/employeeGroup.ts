import { CorpModelBase, IdBase } from "./modelBase";
import { EmployeeGroupCategory } from "./employeeGroupCategory";

export interface EmployeeGroupRequest extends IdBase {
  name?: string;
  description?: string;
  employeeGroupCategoryId?: string;
  sortValue?: number;
}

export interface EmployeeGroup extends CorpModelBase {
  name: string;
  description: string;
  employeeGroupCategoryId: string;
  sortValue: number;
  employeeGroupCategory?: EmployeeGroupCategory;
}

export interface MoveEmployeeGroupTreeNodeRequest {
  id: string;
  isGroup: boolean;
  employeeGroupCategoryId: string;
  previousId?: string;
  nextId?: string;
}
