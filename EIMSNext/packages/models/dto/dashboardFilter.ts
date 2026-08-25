export interface DashboardFilterSetting {
  version: 1;
  kind: "filter-widget";
  name: string;
  targetChartIds: string[];
  fieldTypeGroup?: string;
  bindings: DashboardFilterBinding[];
  filterMode?: DashboardFilterMode;
  operator?: string;
  rangeSourceType?: DashboardRangeSourceType;
  allowedRange?: DashboardFilterAllowedRange;
  defaultValueMode?: DashboardDefaultValueMode;
  defaultValue?: any;
  dynamicDefault?: DashboardDynamicDefault;
  memberLimit?: DashboardFilterMemberLimit;
  linkage?: DashboardFilterLinkage;
}

export interface DashboardFilterBinding {
  dataSourceId: string;
  dataSourceLabel: string;
  field?: DashboardFilterField;
}

export interface DashboardFilterField {
  formId: string;
  field: string;
  label: string;
  type: string;
  format?: string;
  options?: Array<{ value: string; label: string }>;
  isSubField?: boolean;
}

export interface DashboardFilterAllowedRange {
  enabled?: boolean;
  items?: Array<{ id: string; label: string; value?: any }>;
  min?: number;
  max?: number;
}

export interface DashboardDynamicDefault {
  type?: "currentUser" | "currentDept" | "today" | "thisWeek" | "thisMonth";
}

export interface DashboardFilterMemberLimit {
  deptIds?: string[];
}

export interface DashboardFilterLinkage {
  enabled?: boolean;
  sourceFilterIds?: string[];
}

export interface DashboardQuickFilterSetting {
  version: 1;
  kind: "quick-filter";
  name: string;
  showTitle: boolean;
  options: DashboardQuickFilterOption[];
}

export interface DashboardQuickFilterOption {
  id: string;
  name: string;
  conditions: DashboardFilterSetting[];
}

export interface DashboardFilterButtonSetting {
  version: 1;
  kind: "filter-button";
}

export type DashboardFilterMode = "options" | "text" | "range";
export type DashboardRangeSourceType = "staticOptions" | "memberScope" | "distinctData" | "fixedRange";
export type DashboardDefaultValueMode = "static" | "dynamic";
