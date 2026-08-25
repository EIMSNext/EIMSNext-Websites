<template>
  <el-tree-select
    v-model="selectedNode"
    :data="nodeList"
    :props="selectProps"
    :render-after-expand="true"
    node-key="id"
    :placeholder="t('common.selectField')"
    :default-expanded-keys="defaultExpand"
    :filterable="true"
    :clearable="true"
    :filter-node-method="filterNode"
    @change="onInput"
  />
</template>

<script setup lang="ts">
import {
  IFieldBuildSetting,
  INodeForm,
  buildNodeFieldTree,
} from "./type";
import { FilterNodeMethodFunction, TreeNodeData } from "element-plus";
import { IFormFieldDef } from "@/FieldSelect/type";
import { computed, ref, watch } from "vue";
import { DataItemType, ITreeNode, findNode } from "@/common";
import { FieldType } from "@eimsnext/models";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "NodeFieldList",
});
const props = withDefaults(
  defineProps<{
    modelValue: IFormFieldDef;
    fieldBuildSetting: IFieldBuildSetting;
    nodes: INodeForm[];
    fieldDef?: IFormFieldDef;
  }>(),
  {},
);

const selectProps = { value: "id" };
const nodeList = ref<ITreeNode[]>([]);
const defaultExpand = ref<string[]>([]);
const selectedNode = ref<string>();

const selectedNodeId = computed(() =>
  props.modelValue?.nodeId && props.modelValue?.field
    ? `${props.modelValue.nodeId}-${props.modelValue.field}`
    : undefined,
);

const missingLabel = (field: IFormFieldDef) => {
  const label = field.label || field.field;
  return label.includes(t("eventFlow.deletedField")) ? label : `${label}（${t("eventFlow.deletedField")}）`;
};

const appendMissingSelectedNode = () => {
  nodeList.value = nodeList.value.filter((item) => !item.data?.missing || item.id === selectedNodeId.value);
  if (!props.modelValue?.field || !selectedNodeId.value) return;
  if (findNode(nodeList.value, selectedNodeId.value)) return;

  nodeList.value = [
    {
      id: selectedNodeId.value,
      value: props.modelValue.field,
      label: missingLabel(props.modelValue),
      type: DataItemType.Field,
      disabled: true,
      data: { ...props.modelValue, label: missingLabel(props.modelValue), missing: true },
    },
    ...nodeList.value,
  ];
};

const rebuildNodeTree = () => {
  nodeList.value = buildNodeFieldTree(
    props.nodes,
    props.fieldBuildSetting,
    props.fieldDef,
  );

  defaultExpand.value = nodeList.value
    .filter((x) => x.type == DataItemType.Form)
    .map((x) => x.id);

  selectedNode.value = selectedNodeId.value;
  appendMissingSelectedNode();
};

const filterNode: FilterNodeMethodFunction = (
  value: string,
  data: TreeNodeData,
) => {
  if (!value) return true;
  return data.label.includes(value);
};

const emit = defineEmits(["update:modelValue", "change"]);

const onInput = (val: string) => {
  let listItem = findNode(nodeList.value, val);
  let data = listItem?.data ?? {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  };
  emit("update:modelValue", data);
  emit("change", data);
};

watch(
  () => [props.nodes, props.fieldBuildSetting, props.fieldDef],
  () => {
    rebuildNodeTree();
  },
  {
    deep: true,
    immediate: true,
  },
);
watch(
  () => props.modelValue,
  () => {
    selectedNode.value = selectedNodeId.value;
    appendMissingSelectedNode();
  },
  {
    deep: true,
  },
);
</script>
