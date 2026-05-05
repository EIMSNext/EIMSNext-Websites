import {
  FieldDef,
  FieldType,
  FlowStatus,
  FormDef,
  FormData,
  SystemField,
  getCreateBy,
  getCreateTime,
  getFlowStatus,
  getUpdateTime,
} from "@eimsnext/models";
import { IConditionList, toDynamicFilter } from "../ConditionList/type";
import { flowStatusArray } from "../common";
import dayjs from "dayjs";

export interface IDataSelectField {
  field: string;
  label: string;
  type: FieldType;
  format?: string;
  options?: any[];
}

export interface IDataSelectMapping {
  sourceField: IDataSelectField;
  targetField: IDataSelectField;
}

export interface IDataSelectQueryOptions {
  formId: string;
  page: number;
  pageSize: number;
  filter?: IConditionList;
}

export const normalizeDataSelectField = (field: any): IDataSelectField | null => {
  if (!field) {
    return null;
  }

  const source = field.sourceField || field.targetField || field;
  if (!source.field) {
    return null;
  }

  return {
    field: source.field,
    label: source.label || source.title || source.field,
    type: source.type || FieldType.None,
    format: source.format,
    options: source.options,
  };
};

export const toSelectDataField = (field: FieldDef, parent?: FieldDef): ISelectDataField => ({
  field: parent ? `${parent.field}>${field.field}` : field.field,
  label: parent ? `${parent.title}.${field.title}` : field.title,
  type: field.type,
  format: field.props?.format,
  options: field.props?.options,
});

export const toDataSelectField = (field: FieldDef, parent?: FieldDef): IDataSelectField => ({
  field: parent ? `${parent.field}>${field.field}` : field.field,
  label: parent ? `${parent.title}.${field.title}` : field.title,
  type: field.type,
  format: field.props?.format,
  options: field.props?.options,
});

export const buildDataSelectFields = (form?: FormDef, includeSystemFields: boolean = false) => {
  const result: IDataSelectField[] = [];
  const items = form?.content?.items || [];

  items.forEach((item) => {
    if (item.type === FieldType.TableForm && item.columns?.length) {
      item.columns.forEach((sub) => {
        result.push(toDataSelectField(sub, item));
      });
      return;
    }

    result.push(toDataSelectField(item));
  });

  if (!includeSystemFields || !form) {
    return result;
  }

  if (form.usingWorkflow) {
    const flowField = getFlowStatus("流程状态");
    result.unshift({ field: flowField.field, label: flowField.title, type: flowField.type });
  }

  const createByField = getCreateBy("提交人");
  const createTimeField = getCreateTime("提交时间");
  const updateTimeField = getUpdateTime("更新时间");

  result.push(
    { field: createByField.field, label: createByField.title, type: createByField.type },
    { field: createTimeField.field, label: createTimeField.title, type: createTimeField.type },
    { field: updateTimeField.field, label: updateTimeField.title, type: updateTimeField.type },
  );

  return result;
};

export const createDataSelectQuery = ({ formId, page, pageSize, filter }: IDataSelectQueryOptions) => {
  const items: any[] = [
    {
      field: "formId",
      type: "none",
      op: "eq",
      value: formId,
    },
  ];

  const dynamicFilter = filter?.items?.length ? toDynamicFilter(filter) : null;
  if (dynamicFilter && Object.keys(dynamicFilter).length > 0) {
    items.push(dynamicFilter);
  }

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    scope: {},
    sort: [
      {
        field: "createTime",
        type: "timestamp",
        dir: -1,
      },
    ],
    filter: {
      rel: "and",
      items,
    },
  };
};

export const mergeDataSelectRecord = (item: FormData | Record<string, any>) => ({
  ...(item || {}),
  ...((item as any)?.data || {}),
});

export const resolveDataSelectValue = (record: Record<string, any>, path: string) => {
  if (!record || !path) return "";

  if (Object.prototype.hasOwnProperty.call(record, path)) {
    return record[path] ?? "";
  }

  if (path.includes(">")) {
    const [parent, child] = path.split(">");
    const parentValue = record[parent];
    if (Array.isArray(parentValue)) {
      return parentValue
        .map((item) => {
          const value = item?.[child];
          return stringifySelectDataValue(value);
        })
        .filter(Boolean)
        .join(", ");
    }
  }

  if ((record as any).data && Object.prototype.hasOwnProperty.call((record as any).data, path)) {
    return (record as any).data[path] ?? "";
  }

  return "";
};

export const stringifyDataSelectValue = (value: any): string => {
  if (value == null) return "";

  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      return value
        .map((item) => stringifyDataSelectValue(item[0]))
        .filter(Boolean)
        .join(", ");
    }

    return value.map((item) => stringifyDataSelectValue(item)).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    if ("label" in value && value.label != null) {
      return String(value.label);
    }
    if ("name" in value && value.name != null) {
      return String(value.name);
    }
    if ("url" in value && value.url != null) {
      return String(value.url);
    }
    return Object.values(value)
      .map((item) => stringifyDataSelectValue(item))
      .filter(Boolean)
      .join(" ");
  }

  return String(value);
};

const normalizeAssetUrl = (value: string) => String(value || "").replace(/\\/g, "/");

const renderImageValue = (value: any) => {
  if (!value) return "";

  if (Array.isArray(value)) {
    const urls = value
      .map((item) => {
        if (typeof item === "string") return normalizeAssetUrl(item);
        if (item && typeof item === "object" && item.url) return normalizeAssetUrl(item.url);
        return "";
      })
      .filter(Boolean);

    return urls
      .map((url, index) => `<img src="${url}" class="table-image-thumb${index > 0 ? " table-image-thumb-spaced" : ""}" />`)
      .join("");
  }

  if (typeof value === "object" && value.url) {
    return `<img src="${normalizeAssetUrl(value.url)}" class="table-image-thumb" />`;
  }

  if (typeof value === "string") {
    return `<img src="${normalizeAssetUrl(value)}" class="table-image-thumb" />`;
  }

  return "";
};

const formatCollectionValue = (value: any[]) => {
  if (!value.length) return "";

  if (Array.isArray(value[0])) {
    return value
      .map((item) => {
        if (!Array.isArray(item) || item.length === 0) return "";
        const first = item[0];
        if (typeof first === "object" && first !== null) {
          return first.label || first.name || stringifyDataSelectValue(first);
        }
        return String(first ?? "");
      })
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value[0] === "object" && value[0] !== null) {
    return value
      .map((item) => item?.label || item?.name || stringifyDataSelectValue(item))
      .filter(Boolean)
      .join(", ");
  }

  return value.map((item) => String(item ?? "")).filter(Boolean).join(", ");
};

export const formatDataSelectValue = (
  value: any,
  field?: IDataSelectField,
  options?: { t?: (key: string) => string },
) => {
  if (field?.field === SystemField.FlowStatus || field?.type === (getFlowStatus("流程状态").type as FieldType)) {
    const status = flowStatusArray().find((item) => item.id === value);
    return status ? (options?.t ? options.t(status.i18n) : status.label) : stringifyDataSelectValue(value);
  }

  if (field?.type === FieldType.TimeStamp && value) {
    const format = field.format || "YYYY-MM-DD HH:mm:ss";
    return dayjs(Number(value)).isValid() ? dayjs(Number(value)).format(format) : stringifyDataSelectValue(value);
  }

  if (field?.type === FieldType.ImageUpload) {
    return renderImageValue(value);
  }

  if (field?.type === FieldType.FileUpload) {
    if (Array.isArray(value)) {
      return formatCollectionValue(value);
    }
    if (value && typeof value === "object") {
      return value.label || value.name || value.url || stringifyDataSelectValue(value);
    }
    return value ? String(value) : "";
  }

  if (value && typeof value === "object") {
    if ((value as any).label) {
      return String((value as any).label);
    }

    if (Array.isArray(value)) {
      return formatCollectionValue(value);
    }
  }

  return stringifyDataSelectValue(value);
};

export const buildDataSelectDisplayValue = (
  record: Record<string, any>,
  fields: IDataSelectField[],
) => {
  return fields.map((field) => ({
    label: field.label,
    value: formatDataSelectValue(resolveDataSelectValue(record, field.field), field),
  }));
};

export const findDataSelectField = (fields: IDataSelectField[], fieldName: string) => {
  return fields.find((item) => item.field === fieldName) || null;
};

export const isSystemDataSelectField = (field: string) => {
  return [
    SystemField.FlowStatus,
    SystemField.CreateBy,
    SystemField.CreateTime,
    SystemField.UpdateTime,
  ].includes(field as SystemField);
};

export type ISelectDataField = IDataSelectField;
export type ISelectDataMapping = IDataSelectMapping;
export type ISelectDataQueryOptions = IDataSelectQueryOptions;

export const normalizeSelectDataField = normalizeDataSelectField;
export const buildSelectDataFields = buildDataSelectFields;
export const createSelectDataQuery = createDataSelectQuery;
export const mergeSelectDataRecord = mergeDataSelectRecord;
export const resolveSelectDataValue = resolveDataSelectValue;
export const stringifySelectDataValue = stringifyDataSelectValue;
export const formatSelectDataValue = formatDataSelectValue;
export const buildSelectedDisplayValue = buildDataSelectDisplayValue;
export const findSelectDataField = findDataSelectField;
export const isSystemSelectDataField = isSystemDataSelectField;
