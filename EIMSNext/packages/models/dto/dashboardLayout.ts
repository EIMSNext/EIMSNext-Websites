import { DashboardItemDef, DashItemType } from "./dashboardItemDef";

export interface IGridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  dragIgnoreFrom?: string;
  resizeIgnoreFrom?: string;
  inEdit?: boolean;
  drag?: boolean;
  type?: DashItemType;
}

export interface IGridLayoutState {
  layout: IGridLayoutItem[];
  items: Record<string, DashboardItemDef>;
  draggable: boolean;
  resizable: boolean;
}
