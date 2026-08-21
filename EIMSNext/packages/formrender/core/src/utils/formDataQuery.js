import { isSystemField } from "@eimsnext/models";

export const normalizeQueryField = (field) => {
  if (!field) return null;
  const source = field.sourceField || field.targetField || field;
  if (!source.field) return null;
  return {
    field: source.field,
    label: source.label || source.title || source.field,
    type: source.type ?? "none",
    format: source.format,
    options: source.options,
  };
};

export const mergeFormDataRecord = (item) => ({
  ...(item || {}),
  ...(item?.data || {}),
});

export const stringifyFormDataValue = (value) => {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value.map(stringifyFormDataValue).filter(Boolean).join(", ");
  }
  if (typeof value === "object") {
    return String(value.label ?? value.name ?? value.value ?? value.url ?? "");
  }
  return String(value);
};

export const resolveFormDataValue = (record, path) => {
  if (!record || !path) return "";
  if (Object.prototype.hasOwnProperty.call(record, path)) return record[path] ?? "";
  if (path.includes(">")) {
    const [parent, child] = path.split(">");
    if (Array.isArray(record[parent])) {
      return record[parent]
        .map((item) => stringifyFormDataValue(item?.[child]))
        .filter(Boolean)
        .join(", ");
    }
  }
  if (record.data && Object.prototype.hasOwnProperty.call(record.data, path)) {
    return record.data[path] ?? "";
  }
  return "";
};

const normalizeFilterValue = (value, currentForm) => {
  const raw = value?.type === "field" && value.fieldValue?.field
    ? resolveFormDataValue(currentForm, value.fieldValue.field)
    : value?.value;

  if (Array.isArray(raw) && raw.every((item) => item && typeof item === "object" && item.id != null)) {
    return raw.map((item) => item.id);
  }
  return raw;
};

const toDynamicQueryFilter = (filter, currentForm) => {
  if (filter?.items?.length) {
    const items = filter.items
      .map((item) => toDynamicQueryFilter(item, currentForm))
      .filter((item) => Object.keys(item).length > 0);
    return items.length ? { rel: filter.rel || "and", items } : {};
  }
  if (!filter?.field?.field) return {};

  return {
    field: isSystemField(filter.field.field)
      ? filter.field.field
      : `data.${filter.field.field}`,
    type: filter.field.type,
    op: filter.op,
    value: normalizeFilterValue(filter.value, currentForm),
  };
};

export const resolveQueryFilter = (filter, currentForm = {}) =>
  toDynamicQueryFilter(filter, currentForm);

export const createFormDataQuery = ({ formId, page, pageSize, filter, fields }) => {
  const items = [
    { field: "formId", type: "none", op: "eq", value: formId },
  ];
  if (filter && Object.keys(filter).length > 0) {
    items.push(filter);
  }

  return {
    ...(fields?.length
      ? {
          select: [
            { field: "id", visible: true },
            { field: "appId", visible: true },
            { field: "formId", visible: true },
            ...fields
              .filter((field, index, values) => values.findIndex((item) => item.field === field.field) === index)
              .map((field) => ({
                field: isSystemField(field.field) ? field.field : `data.${field.field}`,
                visible: true,
              })),
          ],
        }
      : {}),
    skip: (page - 1) * pageSize,
    take: pageSize,
    scope: { formId, inheritMemberPermissions: true },
    sort: [{ field: "createTime", type: "timestamp", dir: -1 }],
    filter: { rel: "and", items },
  };
};
