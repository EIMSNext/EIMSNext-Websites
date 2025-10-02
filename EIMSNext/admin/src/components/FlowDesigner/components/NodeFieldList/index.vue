<template>
  <el-tree-select
    v-model="selectedNode"
    :data="nodeList"
    :props="selectProps"
    :render-after-expand="true"
    node-key="id"
    :default-expanded-keys="defaultExpand"
    @change="onInput"
  />
</template>

<script setup lang="ts">
import { IListItem, ITreeNode, TreeNodeType, findNode } from "@eimsnext/components";
import { useFormStore } from "@eimsnext/store";
import { FieldBuildRule, INodeForm, buildNodeFieldTree } from "./type";
import { IFormFieldDef } from "../../../FieldList/type";

defineOptions({
  name: "NodeFieldList",
});
const props = defineProps<{
  nodes: INodeForm[];
  fieldBuildRule?: FieldBuildRule;
  modelValue: IFormFieldDef;
}>();

const selectProps = { value: "id" };
const formStore = useFormStore();
const nodeList = ref<ITreeNode[]>(buildNodeFieldTree(props.nodes, props.fieldBuildRule));
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

const emit = defineEmits(["update:modelValue", "change"]);
const onInput = (val: string) => {
  let listItem = findNode(nodeList.value, val)!;
  // console.log("select treenode", val, listItem, nodeList.value);

  emit("update:modelValue", listItem.data);
  emit("change", listItem.data);
};

watch(
  props.modelValue,
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
</script>
