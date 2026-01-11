<template>
  <el-tree-select v-model="selectedNode" :data="nodeList" :props="selectProps" :render-after-expand="true" node-key="id"
    :placeholder="t('comp.selectField')" :default-expanded-keys="defaultExpand" :filterable="true" :clearable="true"
    :filter-node-method="filterNode" @change="onInput" />
</template>

<script setup lang="ts">
import { useFormStore } from "@eimsnext/store";
import { FieldBuildRule, IFieldBuildSetting, INodeForm, buildNodeFieldTree } from "./type";
import { FilterNodeMethodFunction, TreeNodeData } from "element-plus";
import { IFormFieldDef } from "@/FieldList/type";
import { ref, toRef, watch } from "vue";
import { ITreeNode, TreeNodeType, findNode } from "@/common";
import { FieldType } from "@eimsnext/models";
import { useLocale } from "element-plus"
const { t } = useLocale()

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

//TODO: 在弹出框显示时，计算哪个展开更合适
if (nodeList.value.length == 1) { }
else {
  nodeList.value.forEach((x) => {
    if (x.nodeType == TreeNodeType.Form) {
      defaultExpand.value.push(x.id);
    }
    if (x.data.nodeId == props.modelValue.nodeId && x.data.code == props.modelValue.field) {
      selectedNode.value = x;
      return;
    }
  });
}

const calcExpand = () => {

}

const filterNode: FilterNodeMethodFunction = (value: string, data: TreeNodeData) => {
  if (!value) return true
  return data.label.includes(value)
}

const emit = defineEmits(["update:modelValue", "change"]);

const onInput = (val: string) => {
  let listItem = findNode(nodeList.value, val);
  let data = listItem?.data ?? {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  }
  emit("update:modelValue", data);
  emit("change", data);
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
    // console.log("nodefield fieldBuildSetting", newVal.value, props.fieldBuildSetting);
    nodeList.value = buildNodeFieldTree(props.nodes, props.fieldBuildSetting, props.fieldDef);
  },
  {
    deep: true,
  }
);

</script>
