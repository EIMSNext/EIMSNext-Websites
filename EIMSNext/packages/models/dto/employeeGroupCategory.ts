import { CorpModelBase, IdBase } from "./modelBase";

export interface EmployeeGroupCategoryRequest extends IdBase {
  name?: string;
  description?: string;
  sortValue?: number;
}

export interface EmployeeGroupCategory extends CorpModelBase {
  name: string;
  description: string;
  sortValue: number;
}
