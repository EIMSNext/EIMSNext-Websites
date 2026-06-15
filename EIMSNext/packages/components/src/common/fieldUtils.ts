import {
  FieldDef,
  FieldType,
  FlowStatus,
  FormDef,
  SystemField,
  getCreateBy,
  getCreateTime,
  getDataTitle,
  getFlowStatus,
} from "@eimsnext/models";
import dayjs from "dayjs";

export const normalizeValue = (value: any): any => {
  if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
    return value.map((item) => Array.isArray(item) && item.length > 0 ? item[0] : item);
  }

  return value;
};

export const extractImageUrl = (value: any): string => {
  const normalized = normalizeValue(value);
  if (!normalized) return "";
  const first = Array.isArray(normalized) ? normalized[0] : normalized;
  if (!first) return "";
  if (typeof first === "string") return first.replace(/\\/g, "/");
  if (typeof first === "object" && first.url) return String(first.url).replace(/\\/g, "/");
  return "";
};

export const flattenDataItem = (item: any) => {
  const dataItem = { ...item, ...item.data };
  delete dataItem.data;
  return dataItem;
};

export const dateFormat = (val: any, fmt?: string) => {
  const format = fmt || "YYYY-MM-DD";
  return val ? dayjs(val).format(format) : "";
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
  if (field === SystemField.DataTitle) return getDataTitle(label("comp.fieldBlock.systemFields.dataTitle", "Data Title"));
  if (field === SystemField.FlowStatus) return getFlowStatus(label("comp.fieldBlock.systemFields.flowStatus", "Flow Status"));
  if (field === SystemField.CreateBy) return getCreateBy(label("comp.fieldBlock.systemFields.createBy", "Submitter"));
  if (field === SystemField.CreateTime) return getCreateTime(label("comp.fieldBlock.systemFields.createTime", "Submit Time"));

  return undefined;
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

  if (type === FieldType.CheckBox || type === FieldType.Select2 || type === FieldType.Employee2 || type === FieldType.Department2) {
    if (Array.isArray(normalized)) {
      return normalized.map((item: any) => item?.label || item?.name || item?.value || item).filter(Boolean).join(", ");
    }
  }

  if (flowStatusLabel && type === FieldType.None && typeof normalized === "number") {
    return flowStatusLabel(normalized as FlowStatus);
  }

  if (Array.isArray(normalized)) {
    return normalized.map((item: any) => {
      if (Array.isArray(item)) return item.map((sub: any) => sub?.label || sub?.name || sub).join(", ");
      if (typeof item === "object" && item !== null) return item.label || item.name || item.value || "";
      return item;
    }).filter(Boolean).join(", ");
  }

  if (typeof normalized === "object") {
    return normalized.label || normalized.name || normalized.value || JSON.stringify(normalized);
  }

  return String(normalized);
};
