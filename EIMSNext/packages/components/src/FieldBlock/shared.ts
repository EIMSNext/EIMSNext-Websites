import {
  FieldDef,
  FieldType,
  FormDef,
  getCreateBy,
  getCreateTime,
  getFlowStatus,
  getUpdateTime,
} from "@eimsnext/models";

export interface FieldBlockField {
  field: string;
  label: string;
  type: FieldType;
  token: string;
  isSubField?: boolean;
  typeLabel?: string;
}

export interface FieldBlockBuildOptions {
  showSubFields?: boolean;
  showSystemFields?: boolean;
}

const FIELD_BLOCK_TOKEN_REGEX = /\$\{([^}]+)\}/g;

export function buildFieldBlockFields(
  formDef?: FormDef,
  options: FieldBlockBuildOptions = {},
) {
  const { showSubFields = true, showSystemFields = true } = options;
  const fields: FieldBlockField[] = [];

  const appendField = (field: FieldDef, parent?: FieldDef) => {
    fields.push({
      field: parent ? `${parent.field}>${field.field}` : field.field,
      label: parent ? `${parent.title}.${field.title}` : field.title,
      type: field.type,
      token: `\${${parent ? `${parent.field}>${field.field}` : field.field}}`,
      isSubField: !!parent,
      typeLabel: getFieldBlockTypeLabel(field.type),
    });
  };

  (formDef?.content?.items || []).forEach((field) => {
    if (field.type === FieldType.TableForm) {
      if (showSubFields && field.columns?.length) {
        field.columns.forEach((subField) => appendField(subField, field));
      }
      return;
    }

    appendField(field);
  });

  if (showSystemFields) {
    const systemFields = [
      getCreateBy("提交人"),
      getCreateTime("提交时间"),
      getUpdateTime("更新时间"),
    ];

    if (formDef?.usingWorkflow) {
      systemFields.unshift(getFlowStatus("流程状态"));
    }

    systemFields.forEach((field) => appendField(field));
  }

  return fields;
}

export function getFieldBlockTokens(content: string) {
  return Array.from(content.matchAll(FIELD_BLOCK_TOKEN_REGEX)).map((match) => ({
    token: match[0],
    field: match[1],
    index: match.index || 0,
  }));
}

export function findFieldBlockField(fields: FieldBlockField[], field: string) {
  return fields.find((item) => item.field === field);
}

export function getFieldBlockTypeLabel(type: FieldType) {
  switch (type) {
    case FieldType.Input:
      return "文本";
    case FieldType.TextArea:
      return "文本";
    case FieldType.Number:
      return "数字";
    case FieldType.TimeStamp:
      return "时间戳";
    case FieldType.Employee1:
    case FieldType.Employee2:
      return "成员";
    case FieldType.Department1:
    case FieldType.Department2:
      return "部门";
    case FieldType.Select1:
    case FieldType.Select2:
    case FieldType.Radio:
    case FieldType.CheckBox:
      return "选项";
    default:
      return "字段";
  }
}
