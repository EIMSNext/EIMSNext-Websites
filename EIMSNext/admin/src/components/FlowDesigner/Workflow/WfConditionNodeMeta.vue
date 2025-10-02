<template>
  <ConditionList v-model="condList" :formId="flowContext!.formId" @change="onInput"></ConditionList>
</template>
<script lang="ts" setup>
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  IFlowNodeMetaData,
  createFlowNode,
} from "../FlowData";
import { useLocale } from "element-plus";
import { IConditionList } from "../../ConditionList/type";
import ConditionList from "../../ConditionList/index.vue";
import { uniqueId } from "@eimsnext/utils";
const { t } = useLocale();

defineOptions({
  name: "WfConditionNodeMeta",
});

const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None));

const onInput = (list: IConditionList) => {
  activeData.value.metadata.conditionMeta!.condition = list;
};

watch(
  flowContextRef,
  (newValue: IFlowContext) => {
    activeData.value = newValue.activeData;
    condList.value = activeData.value.metadata.conditionMeta!.condition!;
  },
  { immediate: true }
);
</script>
