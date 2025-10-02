import { CorpModelBase, IdBase } from "./modelBase";

export interface DepartmentRequest extends IdBase {
  code: string;
  name: string;
  parentId?: string;
  isCompany: boolean;
}

export interface Department extends CorpModelBase {
  code: string;
  name: string;
  isCompany: boolean;
  parentId?: string;
  parentName?: string;
  heriarchyId?: string;
  heriarchyName?: string;
}
