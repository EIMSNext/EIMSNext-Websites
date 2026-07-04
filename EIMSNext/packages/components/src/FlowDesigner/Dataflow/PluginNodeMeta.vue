<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('dataflow.pluginName')" :required="true" />
    <el-select v-model="pluginId" class="full-width-input" @change="onPluginChanged">
      <el-option
        v-for="plugin in plugins"
        :key="plugin.pluginId"
        :label="plugin.name"
        :value="plugin.pluginId"
      />
    </el-select>

    <MetaItemHeader class="mt-[8px]" :label="t('dataflow.pluginFunction')" :required="true" />
    <el-select v-model="functionId" class="full-width-input" @change="onFunctionChanged">
      <el-option
        v-for="fn in selectedPlugin?.functions ?? []"
        :key="fn.id"
        :label="fn.name"
        :value="fn.id"
      />
    </el-select>

    <template v-for="field in selectedFunction?.inputFields ?? []" :key="field.key">
      <MetaItemHeader class="mt-[8px]" :label="field.name" :required="field.required" />
      <div class="plugin-field-row">
        <el-select v-model="getSetting(field.key).value.type" class="plugin-type-select" @change="syncFieldSetting(field)">
          <el-option v-if="field.allowCustomValue" :label="t('comp.value_Custom')" value="Custom" />
          <el-option
            v-if="field.allowFieldMapping"
            :label="t('comp.value_Field')"
            value="Field"
            :disabled="!hasFieldCandidates(field)"
          />
          <el-option :label="t('comp.value_Empty')" value="Empty" />
        </el-select>

        <el-input-number
          v-if="getSetting(field.key).value.type === 'Custom' && isNumberCustomField(field)"
          :model-value="getCustomNumberValue(field)"
          class="plugin-value-input"
          controls-position="right"
          @change="onCustomNumberChanged(field, $event)"
        />

        <el-date-picker
          v-else-if="getSetting(field.key).value.type === 'Custom' && isTimestampCustomField(field)"
          :model-value="getCustomTimestampValue(field)"
          class="plugin-value-input"
          type="datetime"
          value-format="x"
          @change="onCustomTimestampChanged(field, $event)"
        />

        <el-input
          v-else-if="getSetting(field.key).value.type === 'Custom' && !isJsonCustomField(field)"
          v-model="getSetting(field.key).value.value"
          class="plugin-value-input"
          @change="syncFieldSetting(field)"
        />

        <el-input
          v-else-if="getSetting(field.key).value.type === 'Custom'"
          :model-value="getCustomJsonText(field)"
          class="plugin-value-input"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
          :placeholder="getCustomJsonPlaceholder(field)"
          @change="onCustomJsonChanged(field, String($event))"
        />

        <el-select
          v-else-if="getSetting(field.key).value.type === 'Field'"
          v-model="mappedFieldKeys[field.key]"
          class="plugin-value-input"
          filterable
          clearable
          :placeholder="getFieldPlaceholder(field)"
          @change="onMappedFieldChanged(field.key, $event)"
        >
          <el-option-group
            v-for="group in getCandidateGroups(field)"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="candidate in group.items"
              :key="candidateKey(candidate)"
              :label="candidate.label"
              :value="candidateKey(candidate)"
            >
              <div class="plugin-option-row">
                <span>{{ candidate.label }}</span>
                <span class="plugin-option-meta">{{ getCandidateMeta(candidate) }}</span>
              </div>
            </el-option>
          </el-option-group>
          <template #empty>
            <div class="plugin-empty-text">{{ getEmptyText(field) }}</div>
          </template>
        </el-select>
      </div>
      <div class="plugin-field-hint">
        <span>{{ getFieldHint(field) }}</span>
      </div>
    </template>

    <MetaItemHeader class="mt-[12px]" :label="$t('comp.pluginNode.executionResult')" />
    <div class="plugin-result-desc">{{ $t('comp.pluginNode.executionResultDesc') }}</div>
    <div class="plugin-result-add-row">
      <el-button link type="primary" @click="addResultField">+ {{ $t('common.add') }}</el-button>
    </div>
    <div v-for="(field, index) in resultFields" :key="`${field.fieldKey}-${index}`" class="plugin-result-row">
      <el-select v-model="field.fieldKey" class="plugin-result-key" filterable @change="onResultFieldKeyChanged(field)">
        <el-option
          v-for="resultField in availableResultFieldOptions(index)"
          :key="resultField.key"
          :label="resultField.name"
          :value="resultField.key"
        />
      </el-select>
      <el-input v-model="field.fieldName" class="plugin-result-name" :placeholder="$t('comp.pluginNode.displayName')" />
      <el-select v-model="field.fieldType" class="plugin-result-type">
        <el-option v-for="item in resultTypeOptions" :key="item.value" :label="$t(item.label)" :value="item.value" />
      </el-select>
      <el-button link type="danger" @click="removeResultField(index)">{{ $t('common.delete') }}</el-button>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { computed, inject, reactive, ref } from "vue";
import {
  FieldDef,
  FieldType,
  type PluginFieldDesc,
  type PluginRuntimeInfo,
} from "@eimsnext/models";
import { systemService } from "@eimsnext/services";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  PluginFieldSetting,
  PluginResultFieldSetting,
  createFlowNode,
} from "../Common/FlowData";
import { type IFormFieldDef, toFormFieldDef } from "@/FieldSelect/type";
import type { INodeForm } from "@/NodeFieldList/type";
import { getPrevNodes } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "PluginNodeMeta",
});

const ready = ref(false);
const plugins = ref<PluginRuntimeInfo[]>([]);
const flowContext = inject<IFlowContext>("flowContext")!;
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));
const nodes = ref<INodeForm[]>([]);
const pluginId = ref("");
const functionId = ref("");
const mappedFieldKeys = reactive<Record<string, string>>({});
const customValueTexts = reactive<Record<string, string>>({});
const resultFields = ref<PluginResultFieldSetting[]>([]);

const resultTypeOptions = computed(() => [
  { label: "comp.pluginNode.resultTypes.input", value: FieldType.Input },
  { label: "comp.pluginNode.resultTypes.textarea", value: FieldType.TextArea },
  { label: "comp.pluginNode.resultTypes.number", value: FieldType.Number },
  { label: "comp.pluginNode.resultTypes.timestamp", value: FieldType.TimeStamp },
  { label: "comp.pluginNode.resultTypes.radio", value: FieldType.Radio },
  { label: "comp.pluginNode.resultTypes.checkbox", value: FieldType.CheckBox },
  { label: "comp.pluginNode.resultTypes.select1", value: FieldType.Select1 },
  { label: "comp.pluginNode.resultTypes.select2", value: FieldType.Select2 },
  { label: "comp.pluginNode.resultTypes.employee1", value: FieldType.Employee1 },
  { label: "comp.pluginNode.resultTypes.employee2", value: FieldType.Employee2 },
  { label: "comp.pluginNode.resultTypes.department1", value: FieldType.Department1 },
  { label: "comp.pluginNode.resultTypes.department2", value: FieldType.Department2 },
  { label: "comp.pluginNode.resultTypes.fileUpload", value: FieldType.FileUpload },
  { label: "comp.pluginNode.resultTypes.imageUpload", value: FieldType.ImageUpload },
  { label: "comp.pluginNode.resultTypes.signature", value: FieldType.Signature },
  { label: "comp.pluginNode.resultTypes.tableForm", value: FieldType.TableForm },
  { label: "comp.pluginNode.resultTypes.serialNo", value: FieldType.SerialNo },
]);

const selectedPlugin = computed(() => plugins.value.find((x) => x.pluginId === pluginId.value));
const selectedFunction = computed(() => selectedPlugin.value?.functions.find((x) => x.id === functionId.value));
const fieldCandidates = computed(() =>
  nodes.value.flatMap((node) => buildNodeFieldCandidates(node)),
);

const init = async () => {
  activeData.value = flowContext.activeData;
  nodes.value = await getPrevNodes(flowContext.flowData, activeData.value);
  plugins.value = await systemService.getEnabledPlugins();

  const pluginMeta = activeData.value.metadata.pluginMeta!;
  pluginId.value = pluginMeta.pluginId;
  functionId.value = pluginMeta.functionId;
  resultFields.value = pluginMeta.resultFields;
  for (const item of pluginMeta.fieldSettings) {
    if (item.value.fieldValue) {
      mappedFieldKeys[item.fieldKey] = candidateKey(item.value.fieldValue);
    }
  }
  selectedFunction.value?.inputFields.forEach((field) => syncFieldSetting(field));

  ready.value = true;
};

const getSetting = (fieldKey: string): PluginFieldSetting => {
  let item = activeData.value.metadata.pluginMeta!.fieldSettings.find((x) => x.fieldKey === fieldKey);
  if (!item) {
    item = {
      fieldKey,
      fieldType: "",
      value: { type: "Custom", value: "" },
    };
    activeData.value.metadata.pluginMeta!.fieldSettings.push(item);
  }

  return item;
};

const onPluginChanged = () => {
  const plugin = selectedPlugin.value;
  activeData.value.metadata.pluginMeta!.pluginId = pluginId.value;
  activeData.value.metadata.pluginMeta!.pluginName = plugin?.name;
  activeData.value.metadata.pluginMeta!.functionId = "";
  activeData.value.metadata.pluginMeta!.functionName = undefined;
  activeData.value.metadata.pluginMeta!.fieldSettings = [];
  activeData.value.metadata.pluginMeta!.resultFields = [];
  resultFields.value = activeData.value.metadata.pluginMeta!.resultFields;
  clearMappedFieldKeys();
  clearCustomValueTexts();
  functionId.value = "";
};

const onFunctionChanged = () => {
  const fn = selectedFunction.value;
  activeData.value.metadata.pluginMeta!.functionId = functionId.value;
  activeData.value.metadata.pluginMeta!.functionName = fn?.name;
  clearMappedFieldKeys();
  activeData.value.metadata.pluginMeta!.fieldSettings = (fn?.inputFields ?? []).map((field) => ({
    fieldKey: field.key,
    fieldName: field.name,
    fieldType: field.fieldType,
    value: {
      type: field.allowCustomValue ? "Custom" : field.allowFieldMapping ? "Field" : "Empty",
      value: field.allowCustomValue ? getDefaultCustomValue(field) : undefined,
    },
  }));
  activeData.value.metadata.pluginMeta!.resultFields = [];
  resultFields.value = activeData.value.metadata.pluginMeta!.resultFields;
  clearCustomValueTexts();
};

const syncFieldSetting = (field: PluginFieldDesc) => {
  const setting = getSetting(field.key);
  setting.fieldName = field.name;
  setting.fieldType = field.fieldType;
  if (setting.value.type !== "Field") {
    delete setting.value.fieldValue;
    delete mappedFieldKeys[field.key];
  }
  if (setting.value.type === "Custom" && isJsonCustomField(field) && (setting.value.value === "" || setting.value.value === undefined)) {
    setting.value.value = getDefaultCustomValue(field);
  }
};

const onMappedFieldChanged = (fieldKey: string, key: string) => {
  if (!key) {
    const setting = getSetting(fieldKey);
    delete setting.value.fieldValue;
    delete mappedFieldKeys[fieldKey];
    return;
  }

  const field = parseCandidateKey(key);
  const setting = getSetting(fieldKey);
  setting.value.fieldValue = field;
};

const getFieldCandidates = (fieldType: string, compatibleFieldTypes: string[] = []) => {
  const accepted = new Set([fieldType, ...compatibleFieldTypes].map((item) => String(item)));
  return fieldCandidates.value.filter((candidate) => accepted.has(String(candidate.type)));
};

const hasFieldCandidates = (field: PluginFieldDesc) => getFieldCandidates(field.fieldType, field.compatibleFieldTypes).length > 0;

const getFieldPlaceholder = (field: PluginFieldDesc) => {
  if (!hasFieldCandidates(field)) {
    return t("comp.pluginNode.noMappableFields");
  }

  if (isUploadType(field.fieldType)) {
    return t("comp.pluginNode.selectFileOrImageField");
  }

  return t("comp.pluginNode.selectPrevNodeField");
};

const getEmptyText = (field: PluginFieldDesc) => {
  if (isUploadType(field.fieldType)) {
    return t("comp.pluginNode.noCompatibleFileImageFields");
  }

  return t("comp.pluginNode.noCompatibleFields");
};

const getFieldHint = (field: PluginFieldDesc) => {
  const candidates = getFieldCandidates(field.fieldType, field.compatibleFieldTypes);
  const subFieldCount = candidates.filter((item) => item.isSubField).length;
  const uploadCount = candidates.filter((item) => isUploadType(String(item.type))).length;
  const fileHint = isUploadType(field.fieldType) ? t("comp.pluginNode.supportsFileImageMapping") : "";
  const subFieldHint = subFieldCount > 0 ? t("comp.pluginNode.optionalSubFields", { count: subFieldCount }) : "";
  const uploadHint = isUploadType(field.fieldType) && uploadCount > 0 ? t("comp.pluginNode.fileImageFields", { count: uploadCount }) : "";
  const countHint = t("comp.pluginNode.compatibleFields", { count: candidates.length });
  return [countHint, subFieldHint, uploadHint, fileHint].filter(Boolean).join(" ");
};

const getCandidateGroups = (field: PluginFieldDesc) => {
  const candidates = getFieldCandidates(field.fieldType, field.compatibleFieldTypes);
  const mainFields = candidates.filter((item) => !item.isSubField);
  const subFields = candidates.filter((item) => item.isSubField);
  const uploadFields = candidates.filter((item) => isUploadType(String(item.type)));
  const normalFields = candidates.filter((item) => !isUploadType(String(item.type)));

  if (isUploadType(field.fieldType)) {
    return buildGroups([
      { label: t("comp.pluginNode.fileImageFieldsGroup"), items: uploadFields },
      { label: t("comp.pluginNode.otherCompatibleFieldsGroup"), items: normalFields },
    ]);
  }

  return buildGroups([
    { label: t("comp.pluginNode.mainTableFieldsGroup"), items: mainFields },
    { label: t("comp.pluginNode.subTableFieldsGroup"), items: subFields },
  ]);
};

const buildGroups = (groups: Array<{ label: string; items: IFormFieldDef[] }>) => groups.filter((group) => group.items.length > 0);

const getCandidateMeta = (candidate: IFormFieldDef) => {
  const tags = [] as string[];
  if (candidate.isSubField) {
    tags.push(t("comp.pluginNode.subTable"));
  }
  if (isUploadType(String(candidate.type))) {
    tags.push(t("comp.pluginNode.file"));
  }
  if (candidate.singleResultNode === false) {
    tags.push(t("comp.pluginNode.multiResult"));
  }

  return tags.join(" / ");
};

const candidateKey = (field: Partial<IFormFieldDef>) => `${field.nodeId}|${field.formId}|${field.field}`;

const parseCandidateKey = (key: string): IFormFieldDef => {
  const candidate = fieldCandidates.value.find((item) => candidateKey(item) === key);
  if (candidate) {
    return { ...candidate };
  }

  const [nodeId, formId, field] = key.split("|");
  return {
    nodeId,
    formId,
    field,
    label: field,
    type: "" as FieldType,
    isSubField: field.includes(">"),
  };
};

const clearMappedFieldKeys = () => {
  Object.keys(mappedFieldKeys).forEach((key) => {
    delete mappedFieldKeys[key];
  });
};

const clearCustomValueTexts = () => {
  Object.keys(customValueTexts).forEach((key) => {
    delete customValueTexts[key];
  });
};

const isJsonCustomField = (field: PluginFieldDesc) => {
  return isMultipleCustomField(field) || [
    FieldType.Employee1,
    FieldType.Department1,
  ].includes(field.fieldType as FieldType);
};

const isMultipleCustomField = (field: PluginFieldDesc) => {
  return field.multiple || [
    FieldType.CheckBox,
    FieldType.Select2,
    FieldType.Employee2,
    FieldType.Department2,
    FieldType.TableForm,
  ].includes(field.fieldType as FieldType);
};

const isNumberCustomField = (field: PluginFieldDesc) => field.fieldType === FieldType.Number;

const isTimestampCustomField = (field: PluginFieldDesc) => field.fieldType === FieldType.TimeStamp;

const getDefaultCustomValue = (field: PluginFieldDesc) => {
  if (isNumberCustomField(field) || isTimestampCustomField(field)) {
    return null;
  }

  if (!isJsonCustomField(field)) {
    return "";
  }

  return isMultipleCustomField(field) ? [] : {};
};

const getCustomNumberValue = (field: PluginFieldDesc) => {
  const value = getSetting(field.key).value.value;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

const onCustomNumberChanged = (field: PluginFieldDesc, value: number | undefined) => {
  const setting = getSetting(field.key);
  setting.value.value = typeof value === "number" && Number.isFinite(value) ? value : null;
  syncFieldSetting(field);
};

const getCustomTimestampValue = (field: PluginFieldDesc) => {
  const value = getSetting(field.key).value.value;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

const onCustomTimestampChanged = (field: PluginFieldDesc, value: string | number | Date | undefined | null) => {
  const setting = getSetting(field.key);
  setting.value.value = normalizeTimestampValue(value);
  syncFieldSetting(field);
};

const normalizeTimestampValue = (value: string | number | Date | undefined | null) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  if (typeof value === "string" && value.trim()) {
    const timestamp = Number(value);
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  return null;
};

const getCustomJsonText = (field: PluginFieldDesc) => {
  if (customValueTexts[field.key] !== undefined) {
    return customValueTexts[field.key];
  }

  const rawValue = getSetting(field.key).value.value;
  const value = rawValue === "" ? getDefaultCustomValue(field) : rawValue ?? getDefaultCustomValue(field);
  return JSON.stringify(value, null, 2);
};

const getCustomJsonPlaceholder = (field: PluginFieldDesc) => {
  return isMultipleCustomField(field)
    ? t("comp.pluginNode.customJsonArrayPlaceholder")
    : t("comp.pluginNode.customJsonObjectPlaceholder");
};

const onCustomJsonChanged = (field: PluginFieldDesc, text: string) => {
  customValueTexts[field.key] = text;
  try {
    const parsed = text.trim() ? JSON.parse(text) : getDefaultCustomValue(field);
    const shouldBeArray = isMultipleCustomField(field);
    if (shouldBeArray !== Array.isArray(parsed)) {
      ElMessage.error(shouldBeArray ? t("comp.pluginNode.customJsonArrayRequired") : t("comp.pluginNode.customJsonObjectRequired"));
      return;
    }

    const setting = getSetting(field.key);
    setting.value.value = parsed;
    syncFieldSetting(field);
  } catch {
    ElMessage.error(t("comp.pluginNode.invalidJsonValue"));
  }
};

const buildNodeFieldCandidates = (node: INodeForm): IFormFieldDef[] => {
  if (node.outputFields?.length) {
    return node.outputFields.map((field) => ({
      ...field,
      label: `${node.nodeName}.${field.label}`,
    }));
  }

  const formId = node.form?.id;
  const items = node.form?.content?.items ?? [];
  if (!formId) {
    return [];
  }

  return items.flatMap((field) => buildFieldCandidates(node, formId, field));
};

const buildFieldCandidates = (node: INodeForm, formId: string, field: FieldDef): IFormFieldDef[] => {
  if (field.type === FieldType.TableForm) {
    const tableCandidate = toFormFieldDef(formId, field, undefined, node.nodeId, node.singleResult);
    const subCandidates = (field.columns ?? []).map((subField) => {
      const candidate = toFormFieldDef(formId, subField, field, node.nodeId, node.singleResult);
      return {
        ...candidate,
        label: `${node.nodeName}.${candidate.label}`,
      };
    });

    return [{
      ...tableCandidate,
      label: `${node.nodeName}.${tableCandidate.label}`,
    }, ...subCandidates];
  }

  const candidate = toFormFieldDef(formId, field, undefined, node.nodeId, node.singleResult);
  return [{
    ...candidate,
    label: `${node.nodeName}.${candidate.label}`,
  }];
};

const isUploadType = (fieldType: string) => fieldType === FieldType.FileUpload || fieldType === FieldType.ImageUpload;

const addResultField = () => {
  const nextField = selectedFunction.value?.resultFields.find((field) => !resultFields.value.some((item) => item.fieldKey === field.key));
  if (!nextField) {
    return;
  }

  resultFields.value.push({
    fieldKey: nextField.key,
    fieldName: nextField.name,
    fieldType: nextField.fieldType,
  });
};

const removeResultField = (index: number) => {
  resultFields.value.splice(index, 1);
};

const availableResultFieldOptions = (currentIndex: number) => {
  const currentKey = resultFields.value[currentIndex]?.fieldKey;
  return (selectedFunction.value?.resultFields ?? []).filter(
    (field) => field.key === currentKey || !resultFields.value.some((item, index) => index !== currentIndex && item.fieldKey === field.key),
  );
};

const onResultFieldKeyChanged = (field: PluginResultFieldSetting) => {
  const selected = selectedFunction.value?.resultFields.find((item) => item.key === field.fieldKey);
  if (!selected) {
    return;
  }

  field.fieldName = selected.name;
  field.fieldType = selected.fieldType;
};

init();
</script>

<style scoped>
.full-width-input {
  width: 100%;
}

.plugin-field-row {
  display: flex;
  gap: var(--et-space-8);
}

.plugin-type-select {
  width: 140px;
}

.plugin-value-input {
  flex: 1;
}

.plugin-field-hint {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 4px;
}

.plugin-empty-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  padding: 8px 0;
  text-align: center;
}

.plugin-option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.plugin-option-meta {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  flex-shrink: 0;
}

.plugin-result-desc {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 4px;
}

.plugin-result-add-row {
  margin: 8px 0;
}

.plugin-result-row {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
  margin-bottom: 8px;
}

.plugin-result-key,
.plugin-result-name,
.plugin-result-type {
  flex: 1;
}
</style>
