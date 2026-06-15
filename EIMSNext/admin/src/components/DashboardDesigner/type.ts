import { DashboardItemDef, DashItemType, FieldType, IGridLayoutItem, IGridLayoutState } from "@eimsnext/models";
import { DatasourceType } from "@eimsnext/services";

export type { IGridLayoutItem, IGridLayoutState };

export interface IDataSource {
  id: string;
  type: DatasourceType;
  label: string;
}

export interface IDraggableItem {
  id: string;
  icon: string;
  label: string;
  type: DashItemType;
}
export interface IDataSourceField {
  formId?: string;
  id: string;
  type: FieldType;
  label?: string;
  isComputed?: boolean;
}
