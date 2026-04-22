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

        <el-input
          v-if="getSetting(field.key).value.type === 'Custom'"
          v-model="getSetting(field.key).value.value"
          class="plugin-value-input"
          @change="syncFieldSetting(field)"
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
  </template>
</template>

<script lang="ts" setup>
import { computed, inject, reactive, ref } from "vue";
import { FieldDef, FieldType, type PluginFieldDesc, type PluginRuntimeInfo } from "@eimsnext/models";
import { systemService } from "@eimsnext/services";
import { FlowNodeType, IFlowContext, IFlowNodeData, PluginFieldSetting, createFlowNode } from "../Common/FlowData";
import { type IFormFieldDef, toFormFieldDef } from "@/FieldSelect/type";
import type { INodeForm } from "@/NodeFieldList/type";
import { getPrevNodes } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { useLocale } from "element-plus";

const { t } = useLocale();

defineOptions({
  name: "PluginNodeMeta",
});

const ready = ref(false);
const plugins = ref<PluginRuntimeInfo[]>([]);
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));
const nodes = ref<INodeForm[]>([]);
const pluginId = ref("");
const functionId = ref("");
const mappedFieldKeys = reactive<Record<string, string>>({});

const selectedPlugin = computed(() => plugins.value.find((x) => x.pluginId === pluginId.value));
const selectedFunction = computed(() => selectedPlugin.value?.functions.find((x) => x.id === functionId.value));
const fieldCandidates = computed(() =>
  nodes.value.flatMap((node) => buildNodeFieldCandidates(node)),
);

const init = async () => {
  activeData.value = flowContextRef.activeData;
  nodes.value = await getPrevNodes(flowContextRef.flowData, activeData.value);
  plugins.value = await systemService.getPlugins();

  const pluginMeta = activeData.value.metadata.pluginMeta!;
  pluginId.value = pluginMeta.pluginId;
  functionId.value = pluginMeta.functionId;
  for (const item of pluginMeta.fieldSettings) {
    if (item.value.fieldValue) {
      mappedFieldKeys[item.fieldKey] = candidateKey(item.value.fieldValue);
    }
  }

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
  activeData.value.metadata.pluginMeta!.pluginVersion = plugin?.version;
  activeData.value.metadata.pluginMeta!.functionId = "";
  activeData.value.metadata.pluginMeta!.functionName = undefined;
  activeData.value.metadata.pluginMeta!.fieldSettings = [];
  clearMappedFieldKeys();
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
    value: { type: field.allowCustomValue ? "Custom" : field.allowFieldMapping ? "Field" : "Empty", value: "" },
  }));
};

const syncFieldSetting = (field: { key: string; name: string; fieldType: string }) => {
  const setting = getSetting(field.key);
  setting.fieldName = field.name;
  setting.fieldType = field.fieldType;
  if (setting.value.type !== "Field") {
    delete setting.value.fieldValue;
    delete mappedFieldKeys[field.key];
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
    return "暂无可映射字段";
  }

  if (isUploadType(field.fieldType)) {
    return "请选择文件或图片字段";
  }

  return "请选择前置节点字段";
};

const getEmptyText = (field: PluginFieldDesc) => {
  if (isUploadType(field.fieldType)) {
    return "当前前置节点里没有兼容的文件/图片字段";
  }

  return "当前前置节点里没有兼容字段";
};

const getFieldHint = (field: PluginFieldDesc) => {
  const candidates = getFieldCandidates(field.fieldType, field.compatibleFieldTypes);
  const subFieldCount = candidates.filter((item) => item.isSubField).length;
  const uploadCount = candidates.filter((item) => isUploadType(String(item.type))).length;
  const fileHint = isUploadType(field.fieldType) ? "支持文件/图片字段映射。" : "";
  const subFieldHint = subFieldCount > 0 ? `可选子表字段 ${subFieldCount} 个。` : "";
  const uploadHint = isUploadType(field.fieldType) && uploadCount > 0 ? `文件/图片字段 ${uploadCount} 个。` : "";
  const countHint = `兼容字段 ${candidates.length} 个。`;
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
      { label: "文件/图片字段", items: uploadFields },
      { label: "其他兼容字段", items: normalFields },
    ]);
  }

  return buildGroups([
    { label: "主表字段", items: mainFields },
    { label: "子表字段", items: subFields },
  ]);
};

const buildGroups = (groups: Array<{ label: string; items: IFormFieldDef[] }>) => groups.filter((group) => group.items.length > 0);

const getCandidateMeta = (candidate: IFormFieldDef) => {
  const tags = [] as string[];
  if (candidate.isSubField) {
    tags.push("子表");
  }
  if (isUploadType(String(candidate.type))) {
    tags.push("文件");
  }
  if (candidate.singleResultNode === false) {
    tags.push("多结果");
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

const buildNodeFieldCandidates = (node: INodeForm): IFormFieldDef[] => {
  const formId = node.form?.id;
  const items = node.form?.content?.items ?? [];
  if (!formId) {
    return [];
  }

  return items.flatMap((field) => buildFieldCandidates(node, formId, field));
};

const buildFieldCandidates = (node: INodeForm, formId: string, field: FieldDef): IFormFieldDef[] => {
  if (field.type === FieldType.TableForm) {
    return (field.columns ?? []).map((subField) => {
      const candidate = toFormFieldDef(formId, subField, field, node.nodeId, node.singleResult);
      return {
        ...candidate,
        label: `${node.nodeName}.${candidate.label}`,
      };
    });
  }

  const candidate = toFormFieldDef(formId, field, undefined, node.nodeId, node.singleResult);
  return [{
    ...candidate,
    label: `${node.nodeName}.${candidate.label}`,
  }];
};

const isUploadType = (fieldType: string) => fieldType === FieldType.FileUpload || fieldType === FieldType.ImageUpload;

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
</style>
