import type { IFormFieldDef } from "@/FieldSelect/type";
import { splitSubField } from "@/FieldSelect/type";
import type { PluginFieldSetting } from "../Common/FlowData";

export interface FieldReferenceLike {
  nodeId?: string;
  formId?: string;
  field?: string;
  isSubField?: boolean;
}

export interface PluginFieldSettingLike {
  fieldKey: string;
  fieldName?: string;
  fieldType?: string;
  required?: boolean;
  value?: {
    type?: string;
    fieldValue?: FieldReferenceLike;
  };
  subFieldSettings?: PluginFieldSettingLike[];
}

export interface PluginFieldValidationError<TNode = unknown> {
  node: TNode;
  label: string;
}

export const isSubTableFieldReference = (field?: FieldReferenceLike) =>
  !!field?.field && (field.isSubField === true || field.field.includes(">"));

export const getSubTableName = (field?: FieldReferenceLike) => {
  if (!isSubTableFieldReference(field) || !field?.field) {
    return undefined;
  }

  const [tableKey] = splitSubField(field.field);
  return tableKey || undefined;
};

export const getFieldMappingSourceKey = (field?: FieldReferenceLike & { singleResultNode?: boolean }) => {
  if (!field?.field) {
    return undefined;
  }

  const tableKey = getSubTableName(field);
  if (tableKey) {
    return `${field.nodeId ?? ""}|${field.formId ?? ""}|${tableKey}`;
  }

  return field.singleResultNode === false
    ? `${field.nodeId ?? ""}|${field.formId ?? ""}|master`
    : undefined;
};

export const getSelectedSubTableSourceKey = (
  setting: Pick<PluginFieldSetting, "subFieldSettings">,
  excludingFieldKey?: string,
) => {
  const sourceKeys = new Set<string>();
  setting.subFieldSettings?.forEach((subSetting) => {
    if (subSetting.fieldKey === excludingFieldKey || subSetting.value.type !== "Field") {
      return;
    }

    const sourceKey = getFieldMappingSourceKey(subSetting.value.fieldValue);
    if (sourceKey) {
      sourceKeys.add(sourceKey);
    }
  });

  return sourceKeys.size === 1 ? [...sourceKeys][0] : undefined;
};

export const getMainFieldCandidates = <T extends IFormFieldDef>(candidates: T[]) =>
  candidates.filter((candidate) => !candidate.isSubField);

export const getCompatibleSubFieldCandidates = <T extends IFormFieldDef>(
  candidates: T[],
  selectedSourceKey?: string,
) =>
  candidates.filter((candidate) => {
    const candidateSourceKey = getFieldMappingSourceKey(candidate);
    return !candidateSourceKey || !selectedSourceKey || candidateSourceKey === selectedSourceKey;
  });

export const isPluginFieldConfigured = (setting: PluginFieldSettingLike): boolean => {
  if (setting.fieldType === "tableform") {
    return setting.subFieldSettings?.some((item) => isPluginFieldConfigured(item)) ?? false;
  }

  if (setting.value?.type === "Empty") {
    return false;
  }

  if (setting.value?.type === "Field") {
    return !!setting.value.fieldValue;
  }

  return !!setting.value?.type;
};

export const collectPluginFieldValidationErrors = <TNode>(
  node: TNode,
  settings: PluginFieldSettingLike[] | undefined,
) => {
  const errors: PluginFieldValidationError<TNode>[] = [];
  settings?.forEach((setting) => validatePluginFieldSetting(node, setting, errors));
  return errors;
};

const validatePluginFieldSetting = <TNode>(
  node: TNode,
  setting: PluginFieldSettingLike,
  errors: PluginFieldValidationError<TNode>[],
  parentLabel?: string,
  isSubFieldSetting = false,
) => {
  const label = parentLabel
    ? `${parentLabel} > ${setting.fieldName || setting.fieldKey}`
    : setting.fieldName || setting.fieldKey;

  if (setting.required && !isPluginFieldConfigured(setting)) {
    errors.push({ node, label });
  }

  if (setting.fieldType === "tableform" && setting.subFieldSettings?.length) {
    const sourceKeys = new Set(
      setting.subFieldSettings
        .filter((item) => item.value?.type === "Field")
        .map((item) => getFieldMappingSourceKey(item.value?.fieldValue))
        .filter(Boolean) as string[],
    );
    if (sourceKeys.size > 1) {
      errors.push({ node, label });
    }
  }

  if (!isSubFieldSetting
    && setting.fieldType !== "tableform"
    && setting.value?.type === "Field"
    && isSubTableFieldReference(setting.value.fieldValue)) {
    errors.push({ node, label });
  }

  setting.subFieldSettings?.forEach((subSetting) =>
    validatePluginFieldSetting(node, subSetting, errors, label, true),
  );
};
