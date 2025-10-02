<template>
  <MetaItemHeader :label="t('删除对象')" :required="true"></MetaItemHeader>
  <div class="mode-container">
    <el-select
      v-model="mode"
      size="default"
      style="width: 300px; margin-right: 5px"
      @change="modeChanged"
    >
      <el-option label="选择表单修改数据" :value="UpdateMode.Form" />
      <el-option label="选择节点修改数据" :value="UpdateMode.Node" />
    </el-select>
    <FormList
      v-if="mode == UpdateMode.Form"
      v-model="formItem"
      :appId="appId"
      @change="formChanged"
    ></FormList>
    <el-select
      v-if="mode == UpdateMode.Node"
      v-model="activeData.metadata.deleteMeta!.nodeId"
      size="default"
      @change="nodeChanged"
    >
      <el-option
        v-for="node in nodes"
        :key="node.nodeId"
        :label="node.nodeName"
        :value="node.nodeId"
      />
    </el-select>
  </div>
  <MetaItemHeader class="mt-[8px]" :label="t('数据筛选条件')" :required="true"></MetaItemHeader>
  <ConditionList
    v-model="condList"
    :formId="formId"
    :nodeId="nodeId"
    :nodes="nodes"
    :fieldBuildRule="FieldBuildRule.SingleResultOnly"
    @change="onCondition"
  ></ConditionList>
</template>
<script lang="ts" setup>
import { FlowNodeType, IFlowContext, IFlowNodeData, UpdateMode, createFlowNode } from "../FlowData";
import { useContextStore, useFormStore } from "@eimsnext/store";
import FormList from "../../FormList/index.vue";
import ConditionList from "../../ConditionList/index.vue";
import { useLocale } from "element-plus";
import { IFormItem } from "@/components/FormList/type";
import { FieldBuildRule, INodeForm } from "../components/NodeFieldList/type";
import { getPrevNodes } from "./type";
import MetaItemHeader from "../components/MetaItemHeader/index.vue";
import { IConditionList } from "@/components/ConditionList/type";
import { uniqueId } from "@eimsnext/utils";
const { t } = useLocale();

defineOptions({
  name: "DeleteNodeMeta",
});

const nodeId = ref("");
const formId = ref("");

// const formStore = useFormStore();
// const formDef = ref<FormDef>();
const mode = ref(UpdateMode.Form);

const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None));

const appId = ref(flowContext!.appId);
const formItem = ref<IFormItem>({ id: "" });
const nodes = ref<INodeForm[]>([]);

const modeChanged = (mode: UpdateMode) => {
  formId.value = "";
  formItem.value.id = "";
  condList.value = { id: uniqueId(), rel: "and", items: [] };

  activeData.value.metadata.deleteMeta!.deleteMode = mode;
  activeData.value.metadata.deleteMeta!.nodeId = undefined;
  activeData.value.metadata.deleteMeta!.formId = "";
  activeData.value.metadata.deleteMeta!.condition = condList.value;
};
const nodeChanged = () => {
  if (activeData.value.metadata.deleteMeta!.nodeId) {
    var node = nodes.value.find((x) => x.nodeId == activeData.value.metadata.deleteMeta!.nodeId);
    if (node) {
      formId.value = node.form?.id ?? "";
      formItem.value.id = formId.value;
      activeData.value.metadata.deleteMeta!.formId = formId.value;
    }
  }
};

const formChanged = async (form: IFormItem) => {
  // console.log("formChanged", form);
  formId.value = form.id;
  formItem.value.id = formId.value;
  condList.value = { id: uniqueId(), rel: "and", items: [] };

  activeData.value.metadata.deleteMeta!.formId = form.id;
  activeData.value.metadata.deleteMeta!.condition = condList.value;
};
const onCondition = (list: IConditionList) => {
  activeData.value.metadata.deleteMeta!.condition = list;
};

watch(
  flowContextRef,
  async (newValue: IFlowContext) => {
    // console.log("activeData", newValue.activeData);
    activeData.value = newValue.activeData;
    nodes.value = await getPrevNodes(newValue.flowData, activeData.value);

    mode.value = activeData.value.metadata.deleteMeta!.deleteMode;
    nodeId.value = activeData.value.id;
    formId.value = activeData.value.metadata.deleteMeta!.formId;
    formItem.value = { id: formId.value };

    condList.value = { id: uniqueId(), rel: "and", items: [] };
    if (activeData.value.metadata.deleteMeta!.condition) {
      condList.value = activeData.value.metadata.deleteMeta!.condition;
    }
  },
  { immediate: true }
);
</script>
<style lang="scss" scoped>
.mode-container {
  display: flex;
}
</style>
