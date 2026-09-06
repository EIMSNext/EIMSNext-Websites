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

export interface IDashboardGridSize {
  w: number;
  h: number;
}

const compactDashboardItemTypes = new Set<DashItemType>([DashItemType.RealTime, DashItemType.Text]);

export const getDashboardItemDefaultSize = (type?: DashItemType): IDashboardGridSize => {
  if (type === DashItemType.RealTime) return { w: 2, h: 5 };
  if (type === DashItemType.Text) return { w: 2, h: 8 };
  return { w: 12, h: 12 };
};

export const getDashboardItemMinSize = (type?: DashItemType): IDashboardGridSize =>
  compactDashboardItemTypes.has(type as DashItemType) ? { w: 1, h: 1 } : { w: 6, h: 3 };
