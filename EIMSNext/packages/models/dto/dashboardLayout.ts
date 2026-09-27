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
  /** Layout container that owns this item. Root-level items omit this value. */
  parentLayoutId?: string;
  /** Active tab identifier when the parent layout container uses tabs. */
  tabId?: string;
}

export interface IGridLayoutState {
  layout: IGridLayoutItem[];
  items: Record<string, DashboardItemDef>;
  draggable: boolean;
  resizable: boolean;
}
