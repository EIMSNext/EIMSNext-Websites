import {
  DashboardFilterBinding,
  DashboardFilterField,
  DashboardFilterSetting,
  DashboardRangeSourceType,
  DashboardFilterMode,
  FieldType,
} from "@eimsnext/models";
import { IFormFieldDef } from "@eimsnext/components";
import { IDataSource } from "../type";
import { getDashboardConditionFieldType } from "../fieldType";

export interface IDashboardChartTarget {
  id: string;
  name: string;
  dataSource: IDataSource;
}

export interface IDashboardBindingCandidate {
  dataSourceId: string;
  dataSourceLabel: string;
  fields: IFormFieldDef[];
}

export const createDefaultFilterSetting = (name = "筛选组件"): DashboardFilterSetting => ({
  version: 1,
  kind: "filter-widget",
  name,
  targetChartIds: [],
  bindings: [],
  filterMode: "options",
  operator: "eq",
  rangeSourceType: "distinctData",
  defaultValueMode: "static",
  defaultValue: undefined,
  allowedRange: { enabled: false, items: [] },
  linkage: { enabled: false, sourceFilterIds: [] },
} as DashboardFilterSetting & { memberLimit?: { deptIds: string[] } });

export const isFilterSetting = (value: unknown): value is DashboardFilterSetting => {
  return !!value && typeof value === "object" && (value as DashboardFilterSetting).kind === "filter-widget";
};

export const getFieldTypeGroup = (field?: IFormFieldDef) => {
  return field ? getDashboardConditionFieldType(field.type) : undefined;
};

export const getRangeSourceType = (field?: IFormFieldDef): DashboardRangeSourceType => {
  switch (field?.type) {
    case FieldType.Select1:
    case FieldType.Select2:
    case FieldType.Radio:
    case FieldType.CheckBox:
      return field.options?.length ? "staticOptions" : "distinctData";
    case FieldType.Employee1:
    case FieldType.Employee2:
    case FieldType.Department1:
    case FieldType.Department2:
      return "memberScope";
    case FieldType.Number:
    case FieldType.TimeStamp:
      return "fixedRange";
    default:
      return "distinctData";
  }
};

export const getFilterMode = (field?: IFormFieldDef): DashboardFilterMode => {
  switch (field?.type) {
    case FieldType.Number:
    case FieldType.TimeStamp:
      return "range";
    default:
      return "options";
  }
};

export const toBinding = (candidate: IDashboardBindingCandidate, field?: IFormFieldDef): DashboardFilterBinding => ({
  dataSourceId: candidate.dataSourceId,
  dataSourceLabel: candidate.dataSourceLabel,
  field: field ? toDashboardFilterField(field) : undefined,
});

export const toDashboardFilterField = (field: IFormFieldDef): DashboardFilterField => ({
  formId: field.formId,
  field: field.field,
  label: field.label,
  type: field.type,
  format: field.format,
  options: field.options,
  isSubField: field.isSubField,
});
