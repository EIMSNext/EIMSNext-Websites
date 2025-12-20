<template>
  <FlowNode :p-node-datas="pNodeDatas" :node-data="nodeData" />
</template>

<script lang="ts" setup>
import { IFlowNodeData } from "./FlowData";
import FlowNode from "./FlowNode.vue";

defineOptions({
  name: "QueryOneNode",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();
</script>
