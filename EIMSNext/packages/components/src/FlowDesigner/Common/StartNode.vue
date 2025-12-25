<template>
  <FlowNode
    :p-node-datas="pNodeDatas"
    :node-data="nodeData"
    icon-name="UserFilled"
    :is-start="true"
    :allow-copy="false"
    :allow-delete="false"
  />
</template>

<script lang="ts" setup>
import { IFlowNodeData } from "./FlowData";
import FlowNode from "./FlowNode.vue";

defineOptions({
  name: "StartNode",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();
</script>
