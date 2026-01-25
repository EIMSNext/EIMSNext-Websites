<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('dataflow.deleteFrom')" :required="true"></MetaItemHeader>
    <div class="mode-container">
      <el-select v-model="mode" size="default" style="width: 300px; margin-right: 5px" @change="modeChanged">
        <el-option :label="t('dataflow.recordInForm')" :value="UpdateMode.Form" />
        <el-option :label="t('dataflow.recordInNode')" :value="UpdateMode.Node" />
      </el-select>
      <FormSelect v-if="mode == UpdateMode.Form" v-model="formItem" :appId="appId" @change="formChanged"></FormSelect>
      <el-select v-if="mode == UpdateMode.Node" v-model="activeData.metadata.deleteMeta!.nodeId" size="default"
        :placeholder="t('dataflow.selectNode')" @change="nodeChanged">
        <el-option v-for="node in nodes" :key="node.nodeId" :label="node.nodeName" :value="node.nodeId" />
      </el-select>
    </div>
    <MetaItemHeader class="mt-[8px]" :label="t('dataflow.dataCondition')" :required="true"></MetaItemHeader>
    <ConditionList v-model="condList" :formId="formId" :nodeId="nodeId" :nodes="nodes"
      :fieldBuildRule="FieldBuildRule.SingleResultOnly" @change="onCondition"></ConditionList>
  </template>
</template>
<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  UpdateMode,
  createFlowNode,
} from "../Common/FlowData";
import { useLocale } from "element-plus";
import { getPrevNodes } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { uniqueId } from "@eimsnext/utils";
import { IConditionList } from "@/ConditionList/type";
import { IFormItem } from "@/FormSelect/type";
import { INodeForm, FieldBuildRule } from "@/NodeFieldList/type";
const { t } = useLocale();

defineOptions({
  name: "DeleteNodeMeta",
});

const ready = ref(false);
const nodeId = ref("");
const formId = ref("");

// const formStore = useFormStore();
// const formDef = ref<FormDef>();
const mode = ref(UpdateMode.Form);

const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));

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
    var node = nodes.value.find(
      (x) => x.nodeId == activeData.value.metadata.deleteMeta!.nodeId
    );
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

const init = () => {
  nextTick(async () => {
    activeData.value = flowContextRef.activeData;
    nodes.value = await getPrevNodes(flowContextRef.flowData, activeData.value);

    mode.value = activeData.value.metadata.deleteMeta!.deleteMode;
    nodeId.value = activeData.value.id;
    formId.value = activeData.value.metadata.deleteMeta!.formId;
    formItem.value = { id: formId.value };

    condList.value = { id: uniqueId(), rel: "and", items: [] };
    if (activeData.value.metadata.deleteMeta!.condition) {
      condList.value = activeData.value.metadata.deleteMeta!.condition;
    }
    ready.value = true;
  });
};

init();

// watch(
//   flowContextRef,
//   async (newValue: IFlowContext) => {
//     // console.log("activeData", newValue.activeData);
//     activeData.value = newValue.activeData;
//     nodes.value = await getPrevNodes(newValue.flowData, activeData.value);

//     mode.value = activeData.value.metadata.deleteMeta!.deleteMode;
//     nodeId.value = activeData.value.id;
//     formId.value = activeData.value.metadata.deleteMeta!.formId;
//     formItem.value = { id: formId.value };

//     condList.value = { id: uniqueId(), rel: "and", items: [] };
//     if (activeData.value.metadata.deleteMeta!.condition) {
//       condList.value = activeData.value.metadata.deleteMeta!.condition;
//     }
//   },
//   { immediate: true }
// );
</script>
<style lang="scss" scoped>
.mode-container {
  display: flex;
}
</style>
