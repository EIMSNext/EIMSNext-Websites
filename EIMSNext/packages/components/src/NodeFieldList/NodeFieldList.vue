<template>
  <el-tree-select v-model="selectedNode" :data="nodeList" :props="selectProps" :render-after-expand="true" node-key="id"
    :default-expanded-keys="defaultExpand" :filterable="true" :filter-node-method="filterNode" @change="onInput" />
</template>

<script setup lang="ts">
import { useFormStore } from "@eimsnext/store";
import { FieldBuildRule, IFieldBuildSetting, INodeForm, buildNodeFieldTree } from "./type";
import { FilterNodeMethodFunction, TreeNodeData } from "element-plus";
import { IFormFieldDef } from "@/FieldList/type";
import { ref, toRef, watch } from "vue";
import { ITreeNode, TreeNodeType, findNode } from "@/common";

defineOptions({
  name: "NodeFieldList",
});
const props =
  withDefaults(
    defineProps<{
      modelValue: IFormFieldDef;
      fieldBuildSetting: IFieldBuildSetting;
      nodes: INodeForm[];
      fieldDef?: IFormFieldDef;
    }>(),
    {
    }
  );

const selectProps = { value: "id" };
const buildSetting = toRef(props.fieldBuildSetting)
const formStore = useFormStore();
const nodeList = ref<ITreeNode[]>(buildNodeFieldTree(props.nodes, props.fieldBuildSetting, props.fieldDef));
const defaultExpand = ref<string[]>([]);
const selectedNode = ref<ITreeNode>();
nodeList.value.forEach((x) => {
  if (x.nodeType == TreeNodeType.Form) {
    defaultExpand.value.push(x.id);
  }
  if (x.data.nodeId == props.modelValue.nodeId && x.data.code == props.modelValue.field) {
    selectedNode.value = x;
    return;
  }
});

const filterNode: FilterNodeMethodFunction = (value: string, data: TreeNodeData) => {
  if (!value) return true
  return data.label.includes(value)
}
const emit = defineEmits(["update:modelValue", "change"]);
const onInput = (val: string) => {
  let listItem = findNode(nodeList.value, val)!;
  // console.log("select treenode", val, listItem, nodeList.value);

  emit("update:modelValue", listItem.data);
  emit("change", listItem.data);
};

watch(
  () => props.modelValue,
  (newVal) => {
    // console.log("nodefield modelvalue", newVal);
    selectedNode.value = findNode(
      nodeList.value,
      `${newVal.nodeId}-${newVal.field}`
    );
  },
  {
    immediate: true,
  }
);
watch(
  () => buildSetting,
  (newVal) => {
    // console.log("nodefield fieldBuildSetting", newVal);
    nodeList.value = buildNodeFieldTree(props.nodes, props.fieldBuildSetting, props.fieldDef);
  },
  {
    deep: true,
  }
);

</script>
