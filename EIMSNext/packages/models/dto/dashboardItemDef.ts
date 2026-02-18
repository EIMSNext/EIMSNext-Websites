import { CorpModelBase, IdBase } from "./modelBase";

export interface DashboardItemDefRequest extends IdBase {
  appId?: string;
  dashboardId?: string;
  layoutId?: string;
  itemType?: DashItemType;
  details?: string;
}

export interface DashboardItemDef extends CorpModelBase {
  appId: string;
  dashboardId: string;
  layoutId: string;
  itemType: DashItemType;
  details: string;
}

export enum DashItemType {
  Chart = "chart",
  Comp = "comp",
  Tool = "tool",
}
