import { DataItemType } from "@/common";
import { IListItem } from "@/list/type";
import { FieldType } from "@eimsnext/models";
import { SortDirection } from "@eimsnext/services";

export interface ISortField {
  field: string;
  label: string;
  type: FieldType;
}
export interface ISortItem {
  field: ISortField;
  sort: SortDirection;
}
export interface ISortList {
  items: ISortItem[];
}

export function buildSortListItems(fields: ISortField[]): IListItem[] {
  const items: IListItem[] = [];

  fields.forEach((x: ISortField) => {
    let item: IListItem = {
      id: x.field,
      label: x.label,
      type: DataItemType.Field,
    };

    items.push(item);
  });

  return items;
}