import type { DashboardItemDef } from "./dashboardItemDef";
import type { CorpModelBase, IdBase } from "./modelBase";

export type WorkbenchWidgetType =
  | "flowCenter"
  | "myApps"
  | "recent"
  | "favorites"
  | "chartBoard";

export type WorkbenchTargetType = "app" | "form" | "dashboard";

export interface WorkbenchLayoutItem {
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
  type: WorkbenchWidgetType;
  locked?: boolean;
  config?: WorkbenchWidgetConfig;
}

export interface WorkbenchWidgetConfig {
  title?: string;
  dashboardId?: string;
  dashboardItemId?: string;
  charts?: WorkbenchChartLayoutItem[];
}

/** A user's independent placement of a dashboard chart in the workbench. */
export interface WorkbenchChartLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  dashboardId: string;
  dashboardItemId: string;
  title: string;
}

export interface WorkbenchConfig extends CorpModelBase {
  employeeId: string;
  layout: string;
  pageStyle: string;
}

export interface WorkbenchConfigRequest extends IdBase {
  layout?: string;
  pageStyle?: string;
}

export interface WorkbenchItem extends CorpModelBase {
  id: string;
  employeeId?: string;
  targetType: WorkbenchTargetType;
  targetId: string;
  appId: string;
  title: string;
  icon: string;
  iconColor: string;
  sortIndex?: number;
  lastVisitTime?: number;
  visitCount?: number;
}

export type WorkbenchFavorite = WorkbenchItem;

export type WorkbenchRecentVisit = WorkbenchItem;

export interface WorkbenchFavoriteRequest extends IdBase {
  targetType?: WorkbenchTargetType;
  targetId?: string;
  sortIndex?: number;
}

export interface WorkbenchRecentVisitRequest extends IdBase {
  targetType?: Extract<WorkbenchTargetType, "form" | "dashboard">;
  targetId?: string;
}

export interface WorkbenchTargetRequest {
  targetType: WorkbenchTargetType;
  targetId: string;
}

export interface WorkbenchCatalogMenu {
  id: string;
  title: string;
  targetType: WorkbenchTargetType | "group";
  icon: string;
  iconColor: string;
  children: WorkbenchCatalogMenu[];
}

export interface WorkbenchCatalogChart {
  id: string;
  name: string;
  dashboardId: string;
  appId: string;
}

export interface WorkbenchCatalogDashboard {
  id: string;
  name: string;
  appId: string;
  charts: WorkbenchCatalogChart[];
}

export interface WorkbenchCatalogApp {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  menus: WorkbenchCatalogMenu[];
  dashboards: WorkbenchCatalogDashboard[];
}

export type WorkbenchChartItem = DashboardItemDef;
