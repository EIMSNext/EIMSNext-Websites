import { uniqueId } from "@eimsnext/form-render-core";
import { useFormStore } from "@eimsnext/store";
import { FieldType } from "@eimsnext/models";
import { buildDataSelectFields, findDataSelectField, normalizeDataSelectField } from "@eimsnext/components";

const FIELD_TYPE_RULE_MAP = {
  [FieldType.Input]: "input",
  [FieldType.TextArea]: "textarea",
  [FieldType.Number]: "number",
  [FieldType.TimeStamp]: "timestamp",
  [FieldType.Department1]: "department1",
  [FieldType.Department2]: "department2",
  [FieldType.Employee1]: "employee1",
  [FieldType.Employee2]: "employee2",
  [FieldType.ImageUpload]: "imageupload",
  [FieldType.FileUpload]: "fileupload",
  [FieldType.Select1]: "select",
  [FieldType.Select2]: "select2",
  [FieldType.Radio]: "radio",
  [FieldType.CheckBox]: "checkbox",
};

const RULE_TYPE_FIELD_MAP = {
  input: FieldType.Input,
  textarea: FieldType.TextArea,
  number: FieldType.Number,
  timestamp: FieldType.TimeStamp,
  department1: FieldType.Department1,
  department2: FieldType.Department2,
  employee1: FieldType.Employee1,
  employee2: FieldType.Employee2,
  imageupload: FieldType.ImageUpload,
  fileupload: FieldType.FileUpload,
  select: FieldType.Select1,
  select2: FieldType.Select2,
  radio: FieldType.Radio,
  checkbox: FieldType.CheckBox,
  tableform: FieldType.TableForm,
};

export const getActiveRule = (designer) => designer?.setupState?.activeRule;

export const getCurrentFormRules = (designer) => {
  const designerApi = designer?.proxy || designer;
  if (designerApi?.getRule) {
    return designerApi.getRule() || [];
  }
  return designer?.setupState?.children || [];
};

export const getCurrentContextRules = (designer, contextRule) => {
  const activeRule = contextRule || getActiveRule(designer);
  const setupState = designer?.setupState;
  const tableForm = activeRule && setupState?.getTableFormByRule?.(activeRule);
  if (tableForm) {
    return setupState.getTableFormRootChildren?.(tableForm) || [];
  }
  return getCurrentFormRules(designer);
};

export const walkRules = (rules, visitor) => {
  (rules || []).forEach((rule) => {
    if (!rule || typeof rule !== "object") return;
    visitor(rule);
    if (Array.isArray(rule.children)) {
      walkRules(rule.children, visitor);
    }
  });
};

export const getCurrentFormFields = (designer, currentField, contextRule) => {
  const fields = [];
  const formId = designer?.setupState?.formId || "";
  walkRules(getCurrentContextRules(designer, contextRule), (rule) => {
    if (!rule.field || !rule.title) return;
    if (rule.field === currentField || rule.type === "dataselect") return;
    const fieldType = RULE_TYPE_FIELD_MAP[rule.type] || rule.type || FieldType.None;
    fields.push({
      formId,
      field: rule.field,
      label: rule.title,
      type: fieldType,
      format: rule.props?.format,
      options: rule.options || rule.props?.options,
    });
  });
  return fields;
};

export const loadSourceFormFields = async (formId) => {
  if (!formId) return [];
  const formStore = useFormStore();
  const form = await formStore.get(formId);
  return buildDataSelectFields(form, true);
};

export const normalizeSelectionProcess = (value) => ({
  buttonText: value?.buttonText || "选择数据",
  tableFields: (value?.tableFields || []).map(normalizeDataSelectField).filter(Boolean),
});

export const normalizeDisplayConfig = (value) => ({
  fields: (value?.fields || []).map(normalizeDataSelectField).filter(Boolean),
});

export const normalizeFillConfig = (value) => ({
  mappings: (value?.mappings || [])
    .map((item) => {
      const sourceField = normalizeDataSelectField(item?.sourceField);
      const targetField = normalizeDataSelectField(item?.targetField);
      if (!sourceField || !targetField) return null;
      return { sourceField, targetField };
    })
    .filter(Boolean),
});

export const buildUniqueFieldName = (designer, preferred) => {
  const usedFields = new Set();
  walkRules(getCurrentFormRules(designer), (rule) => {
    if (rule.field) {
      usedFields.add(rule.field);
    }
  });

  const baseName = preferred || uniqueId();
  if (!usedFields.has(baseName)) {
    return baseName;
  }

  let index = 1;
  while (usedFields.has(`${baseName}_${index}`)) {
    index += 1;
  }
  return `${baseName}_${index}`;
};

export const createRuleFromField = (designer, field) => {
  const menuName = FIELD_TYPE_RULE_MAP[field.type] || "input";
  const menu = designer?.setupState?.dragRuleList?.[menuName];
  if (!menu) {
    return null;
  }

  const props = {};
  if (["input", "textarea", "number", "timestamp"].includes(menu.name)) {
    props.placeholder = `请输入${field.label}`;
  }

  return {
    menu,
    menuName,
    title: field.label,
    field: buildUniqueFieldName(designer, field.field),
    props,
  };
};

export const buildMappingsFromFields = (sourceFields, targetFields) => {
  return sourceFields
    .map((field, index) => {
      const targetField = targetFields[index];
      if (!field || !targetField) return null;
      return { sourceField: field, targetField };
    })
    .filter(Boolean);
};

export const isFieldTypeCompatible = (sourceField, targetField) => {
  if (!sourceField || !targetField) return false;
  return sourceField.type === targetField.type;
};

export const buildDefaultDisplayFields = (selectionProcess, sourceFields) => {
  const currentFields = normalizeSelectionProcess(selectionProcess).tableFields;
  if (currentFields.length > 0) {
    return currentFields;
  }
  return sourceFields.slice(0, 2);
};

export const pickFieldsByNames = (fields, names) => {
  return (names || [])
    .map((name) => findDataSelectField(fields, name))
    .filter(Boolean);
};
