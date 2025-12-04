<template>
  <ConditionList v-if="ready" v-model="condList" :formId="flowContext!.formId" :nodeId="nodeId" :nodes="nodes"
    :condType="ConditionType.Node" @change="onInput"></ConditionList>
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
import { ConditionType, IConditionList,INodeForm } from "@eimsnext/components";
import { uniqueId } from "@eimsnext/utils";
import { getPrevNodes } from "./type";
const { t } = useLocale();

defineOptions({
  name: "DfConditionNodeMeta",
});

const ready = ref(false)
const nodeId = ref("");
const nodes = ref<INodeForm[]>([]);

const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None));

const onInput = (list: IConditionList) => {
  activeData.value.metadata.conditionMeta!.condition = list;
};

const init = () => {
  nextTick(async () => {

    activeData.value = flowContextRef.activeData;
    nodeId.value = activeData.value.id;
    nodes.value = await getPrevNodes(flowContextRef.flowData, activeData.value);

    console.log("df cond nodes", flowContextRef, nodes.value);

    condList.value = { id: uniqueId(), rel: "and", items: [] };
    if (activeData.value.metadata.conditionMeta!.condition) {
      condList.value = activeData.value.metadata.conditionMeta!.condition;
    }

    ready.value = true
  })
}

init()

// watch(
//   flowContextRef,
//   async (newValue: IFlowContext) => {
//     activeData.value = newValue.activeData;
//     nodeId.value = activeData.value.id;
//     nodes.value = await getPrevNodes(newValue.flowData, activeData.value);

//     console.log("df cond nodes", newValue, nodes.value);

//     condList.value = { id: uniqueId(), rel: "and", items: [] };
//     if (activeData.value.metadata.conditionMeta!.condition) {
//       condList.value = activeData.value.metadata.conditionMeta!.condition;
//     }
//   },
//   { immediate: true }
// );
</script>
