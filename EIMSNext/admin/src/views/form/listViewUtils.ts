import {
  FieldDef,
  FieldType,
  FlowStatus,
  FormDef,
  FormListView,
  FormListViewField,
  FormListViewSettings,
  FormListViewType,
  MobileFormListViewType,
  SystemField,
  getCreateBy,
  getCreateTime,
  getDataTitle,
  getFlowStatus,
} from "@eimsnext/models";
import { IConditionList, IFieldSortList, IFormFieldDef, buildFieldListItems } from "@eimsnext/components";
import { SortDirection } from "@eimsnext/services";
import { getFileFullUrl, uniqueId } from "@eimsnext/utils";
import { dateFormat } from "@/utils/common";

export type FormDataFormatter = (row: Record<string, any>, field: string, value?: any) => string;

export const isListDisplayableField = (field?: Pick<IFormFieldDef, "type"> | null) =>
  !!field && field.type !== FieldType.DataSelect;

export const createEmptyCondition = (): IConditionList => ({
  id: uniqueId(),
  rel: "and",
  items: [],
});

export const createDefaultSort = (formId: string, t: (key: string) => string): IFieldSortList => ({
  items: [
    {
      field: {
        formId,
        field: SystemField.CreateTime,
        label: t("comp.fieldBlock.systemFields.createTime"),
        type: FieldType.TimeStamp,
      },
      sort: SortDirection.Desc,
    },
  ],
});

export const createDefaultFormListView = (formDef: FormDef, t: (key: string) => string): FormListView => ({
  id: "__default",
  appId: formDef.appId,
  formId: formDef.id,
  name: t("admin.formListView.defaultView"),
  pcType: FormListViewType.Table,
  mobileType: MobileFormListViewType.Table,
  sortIndex: 0,
  authGroupIds: [],
  disabled: false,
  settings: JSON.stringify({
    table: {
      displayFields: [],
      rowHeight: "auto",
    },
  } as FormListViewSettings),
  defaultFilter: JSON.stringify(createEmptyCondition()),
  defaultSort: JSON.stringify(createDefaultSort(formDef.id, t)),
  createTime: 0,
  updateTime: 0,
} as FormListView);

export const parseViewSettings = (settings?: string): FormListViewSettings => {
  if (!settings) return {};
  try {
    return JSON.parse(settings) as FormListViewSettings;
  } catch {
    return {};
  }
};

export const parseCondition = (value?: string): IConditionList => {
  if (!value) return createEmptyCondition();
  try {
    return JSON.parse(value) as IConditionList;
  } catch {
    return createEmptyCondition();
  }
};

export const parseSort = (formId: string, value: string | undefined, t: (key: string) => string): IFieldSortList => {
  if (!value) return createDefaultSort(formId, t);
  try {
    const sort = JSON.parse(value) as IFieldSortList;
    return sort?.items ? sort : createDefaultSort(formId, t);
  } catch {
    return createDefaultSort(formId, t);
  }
};

export const toViewFields = (fields: IFormFieldDef[]): FormListViewField[] =>
  fields.map((field) => ({
    field: field.field,
    label: field.label,
    type: field.type,
    isSubField: field.isSubField,
  }));

export const toFormFields = (formId: string, fields?: FormListViewField[]): IFormFieldDef[] =>
  (fields || []).map((field) => ({
    formId,
    field: field.field,
    label: field.label,
    type: field.type,
    isSubField: field.isSubField,
  })).filter(isListDisplayableField);

export const buildAllViewFields = (formDef: FormDef, t: (key: string) => string): IFormFieldDef[] => {
  return buildFieldListItems(formDef.id, formDef.content?.items || [], formDef.usingWorkflow, undefined, { t } as any)
    .map((item) => item.data as IFormFieldDef)
    .filter(isListDisplayableField);
};

export const getViewDisplayFields = (
  formDef: FormDef,
  view: FormListView,
  settings: FormListViewSettings,
  t: (key: string) => string,
): IFormFieldDef[] => {
  const configured = view.pcType === FormListViewType.Table
    ? settings.table?.displayFields
    : view.pcType === FormListViewType.Kanban
      ? settings.kanban?.displayFields
      : settings.gallery?.displayFields;

  if (configured && configured.length > 0) {
    return toFormFields(formDef.id, configured);
  }

  return view.id === "__default" || view.pcType === FormListViewType.Table ? [] : buildAllViewFields(formDef, t).slice(0, 3);
};

export const flattenDataItem = (item: any) => {
  const dataItem = { ...item, ...item.data };
  delete dataItem.data;
  return dataItem;
};

export const normalizeValue = (value: any): any => {
  if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
    return value.map((item) => Array.isArray(item) && item.length > 0 ? item[0] : item);
  }

  return value;
};

export const findFieldDef = (formDef: FormDef, field: string, t?: (key: string) => string): FieldDef | undefined => {
  const items = formDef.content?.items || [];
  for (const item of items) {
    if (item.field === field) return item;
    if (item.columns?.length && field.includes(">")) {
      const [parent, child] = field.split(">");
      if (parent === item.field) {
        return item.columns.find((sub) => sub.field === child);
      }
    }
  }

  const label = (key: string, fallback: string) => t ? t(key) : fallback;
  if (field === SystemField.DataTitle) return getDataTitle(label("comp.fieldBlock.systemFields.dataTitle", "数据标题"));
  if (field === SystemField.FlowStatus) return getFlowStatus(label("comp.fieldBlock.systemFields.flowStatus", "流程状态"));
  if (field === SystemField.CreateBy) return getCreateBy(label("comp.fieldBlock.systemFields.createBy", "提交人"));
  if (field === SystemField.CreateTime) return getCreateTime(label("comp.fieldBlock.systemFields.createTime", "提交时间"));

  return undefined;
};

export const extractImageUrl = (value: any): string => {
  const normalized = normalizeValue(value);
  if (!normalized) return "";
  const first = Array.isArray(normalized) ? normalized[0] : normalized;
  if (!first) return "";
  if (typeof first === "string") return getFileFullUrl(first);
  if (typeof first === "object" && first.url) return getFileFullUrl(String(first.url));
  return "";
};

export const formatFormValue = (
  value: any,
  fieldDef?: Pick<FieldDef, "type" | "props"> | { type?: string; format?: string },
  flowStatusLabel?: (status: FlowStatus) => string,
): string => {
  if (value === undefined || value === null || value === "") return "";

  const normalized = normalizeValue(value);
  const type = fieldDef?.type;
  const format = "format" in (fieldDef || {}) ? (fieldDef as any).format : (fieldDef as FieldDef | undefined)?.props?.format;

  if (type === FieldType.TimeStamp) {
    return dateFormat(normalized, format);
  }

  if (type === FieldType.ImageUpload) {
    return extractImageUrl(normalized);
  }

  if (type === FieldType.DataSelect && Array.isArray(normalized)) {
    return normalized.map((item) => {
      if (!item || typeof item !== "object") return String(item ?? "");
      const label = item.label || item.name || "";
      const itemValue = item.value ?? "";
      return label ? `${label}: ${itemValue}` : String(itemValue);
    }).filter(Boolean).join("; ");
  }

  if (type === FieldType.CheckBox || type === FieldType.Select2 || type === FieldType.Employee2 || type === FieldType.Department2) {
    if (Array.isArray(normalized)) {
      return normalized.map((item) => item?.label || item?.name || item?.value || item).filter(Boolean).join(", ");
    }
  }

  if (flowStatusLabel && type === FieldType.None && typeof normalized === "number") {
    return flowStatusLabel(normalized as FlowStatus);
  }

  if (Array.isArray(normalized)) {
    return normalized.map((item) => {
      if (Array.isArray(item)) return item.map((sub) => sub?.label || sub?.name || sub).join(", ");
      if (typeof item === "object" && item !== null) return item.label || item.name || item.value || "";
      return item;
    }).filter(Boolean).join(", ");
  }

  if (typeof normalized === "object") {
    return normalized.label || normalized.name || normalized.value || JSON.stringify(normalized);
  }

  return String(normalized);
};
