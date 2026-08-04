import dayjs from "dayjs";
import { FieldType } from "@eimsnext/models";

export const normalizeDataSelectField = (field) => {
  if (!field) return null;
  const source = field.sourceField || field.targetField || field;
  if (!source.field) return null;
  return {
    field: source.field,
    label: source.label || source.title || source.field,
    type: source.type || FieldType.None,
    format: source.format,
    options: source.options,
  };
};

export const createDataSelectQuery = ({ formId, page, pageSize, fields }) => ({
  ...(fields?.length
    ? {
        select: [
          { field: "id", visible: true },
          { field: "appId", visible: true },
          { field: "formId", visible: true },
          ...fields
            .filter(
              (field, index, values) =>
                values.findIndex((item) => item.field === field.field) === index,
            )
            .map((field) => ({ field: `data.${field.field}`, visible: true })),
        ],
      }
    : {}),
  skip: (page - 1) * pageSize,
  take: pageSize,
  scope: { formId, inheritMemberPermissions: true },
  sort: [{ field: "createTime", type: "timestamp", dir: -1 }],
  filter: {
    rel: "and",
    items: [{ field: "formId", type: "none", op: "eq", value: formId }],
  },
});

export const mergeDataSelectRecord = (item) => ({
  ...(item || {}),
  ...(item?.data || {}),
});

export const stringifyDataSelectValue = (value) => {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) {
    return value.map(stringifyDataSelectValue).filter(Boolean).join(", ");
  }
  if (typeof value === "object") {
    return String(value.label ?? value.name ?? value.value ?? value.url ?? "");
  }
  return String(value);
};

export const resolveDataSelectValue = (record, path) => {
  if (!record || !path) return "";
  if (Object.prototype.hasOwnProperty.call(record, path)) return record[path] ?? "";
  if (path.includes(">")) {
    const [parent, child] = path.split(">");
    if (Array.isArray(record[parent])) {
      return record[parent]
        .map((item) => stringifyDataSelectValue(item?.[child]))
        .filter(Boolean)
        .join(", ");
    }
  }
  if (record.data && Object.prototype.hasOwnProperty.call(record.data, path)) {
    return record.data[path] ?? "";
  }
  return "";
};

export const formatDataSelectValue = (value, field) => {
  if (field?.type === FieldType.TimeStamp && value) {
    const date = dayjs(Number(value));
    return date.isValid()
      ? date.format(field.format || "YYYY-MM-DD HH:mm:ss")
      : stringifyDataSelectValue(value);
  }
  if (field?.options?.length) {
    const values = Array.isArray(value) ? value : [value];
    return values
      .map((item) => {
        const raw = item && typeof item === "object" ? item.value : item;
        const option = field.options.find((candidate) => candidate.value === raw);
        return option?.label ?? stringifyDataSelectValue(item);
      })
      .filter(Boolean)
      .join(", ");
  }
  return stringifyDataSelectValue(value);
};

export const buildDataSelectValue = (record, displayFields, mappings = []) => {
  const fields = [...displayFields, ...mappings.map((mapping) => mapping.sourceField)]
    .filter((field) => !!field?.field)
    .filter(
      (field, index, values) =>
        values.findIndex((item) => item.field === field.field) === index,
    );
  const data = fields.reduce((result, field) => {
    result[field.field] = resolveDataSelectValue(record, field.field);
    return result;
  }, {});
  return {
    appId: String(record?.appId || ""),
    formId: String(record?.formId || ""),
    dataId: String(record?.id || record?._id || ""),
    data,
  };
};

export const normalizeDataSelectValue = (value) => {
  const candidate = Array.isArray(value) && value.length === 1 ? value[0] : value;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
  if (!candidate.data || typeof candidate.data !== "object" || Array.isArray(candidate.data)) {
    return null;
  }
  return {
    appId: String(candidate.appId || ""),
    formId: String(candidate.formId || ""),
    dataId: String(candidate.dataId || ""),
    data: candidate.data,
  };
};
