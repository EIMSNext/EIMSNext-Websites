<template>
  <ConditionList v-if="ready" v-model="condList" :formId="flowContext!.formId" @change="onInput"></ConditionList>
</template>
<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  IFlowNodeMetaData,
  createFlowNode,
} from "../Common/FlowData";
import { useLocale } from "element-plus";
import { uniqueId } from "@eimsnext/utils";
import { IConditionList } from "@/ConditionList/type";
const { t } = useLocale();

defineOptions({
  name: "WfConditionNodeMeta",
});

const ready = ref(false)
const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));

const onInput = (list: IConditionList) => {
  activeData.value.metadata.conditionMeta!.condition = list;
};

const init = () => {
  nextTick(async () => {
    activeData.value = flowContextRef.activeData;
    condList.value = activeData.value.metadata.conditionMeta!.condition!;

    ready.value = true
  })
}

init()

// watch(
//   flowContextRef,
//   (newValue: IFlowContext) => {
//     activeData.value = newValue.activeData;
//     condList.value = activeData.value.metadata.conditionMeta!.condition!;
//   },
//   { immediate: true }
// );
</script>
