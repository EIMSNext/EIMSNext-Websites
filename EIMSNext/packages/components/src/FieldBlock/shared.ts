import {
  FieldDef,
  FieldType,
  FormDef,
  getCreateBy,
  getCreateTime,
  getFlowStatus,
  getUpdateTime,
} from "@eimsnext/models";
import { useI18n } from "vue-i18n";

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
  t?: ReturnType<typeof useI18n>["t"];
}

const FIELD_BLOCK_TOKEN_REGEX = /\$\{([^}]+)\}/g;

export function buildFieldBlockFields(
  formDef?: FormDef,
  options: FieldBlockBuildOptions = {},
) {
  const { showSubFields = true, showSystemFields = true, t } = options;
  const fields: FieldBlockField[] = [];

  const getTypeLabel = (type: FieldType) => {
    if (!t) return getFieldBlockTypeLabel(type);
    const key = type.toLowerCase();
    return t(`comp.fieldBlock.typeLabels.${key}` as any) || t("common.fields");
  };

  const getSystemFieldLabel = (key: string) => {
    if (!t) return key;
    return t(`comp.fieldBlock.systemFields.${key}` as any);
  };

  const appendField = (field: FieldDef, parent?: FieldDef) => {
    fields.push({
      field: parent ? `${parent.field}>${field.field}` : field.field,
      label: parent ? `${parent.title}.${field.title}` : field.title,
      type: field.type,
      token: `\${${parent ? `${parent.field}>${field.field}` : field.field}}`,
      isSubField: !!parent,
      typeLabel: getTypeLabel(field.type),
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
      getCreateBy(getSystemFieldLabel("createBy")),
      getCreateTime(getSystemFieldLabel("createTime")),
      getUpdateTime(getSystemFieldLabel("updateTime")),
    ];

    if (formDef?.usingWorkflow) {
      systemFields.unshift(getFlowStatus(getSystemFieldLabel("flowStatus")));
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
      return "comp.fieldBlock.typeLabels.input";
    case FieldType.TextArea:
      return "comp.fieldBlock.typeLabels.textarea";
    case FieldType.Number:
      return "comp.fieldBlock.typeLabels.number";
    case FieldType.TimeStamp:
      return "comp.fieldBlock.typeLabels.timestamp";
    case FieldType.Employee1:
    case FieldType.Employee2:
      return "comp.fieldBlock.typeLabels.employee1";
    case FieldType.Department1:
    case FieldType.Department2:
      return "comp.fieldBlock.typeLabels.department1";
    case FieldType.Select1:
    case FieldType.Select2:
    case FieldType.Radio:
    case FieldType.CheckBox:
      return "comp.fieldBlock.typeLabels.select1";
    default:
      return "common.fields";
  }
}
