import { IFormFieldDef } from "../FieldList/type";

export enum SortDirection {
  Asc = 1,
  Desc = -1,
}

export interface IFieldSortItem {
  field: IFormFieldDef;
  sort: SortDirection;
}

export interface IFieldSortList {
  items: IFieldSortItem[];
}
