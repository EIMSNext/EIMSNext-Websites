import { CorpModelBase, IdBase } from "./modelBase";

export interface RoleGroupRequest extends IdBase {
  name: string;
  description: string;
  sortValue: number;
}

export interface RoleGroup extends CorpModelBase {
  name: string;
  description: string;
  sortValue: number;
}
