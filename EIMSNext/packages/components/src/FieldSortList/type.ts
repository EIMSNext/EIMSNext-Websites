import { IFormFieldDef } from "../FieldSelect/type";
import { SortDirection } from "@eimsnext/services";

export interface IFieldSortItem {
  field: IFormFieldDef;
  sort: SortDirection;
}

export interface IFieldSortList {
  items: IFieldSortItem[];
}
