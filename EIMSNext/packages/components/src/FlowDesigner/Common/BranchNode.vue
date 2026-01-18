<template>
  <div style="margin-top: 5px">
    <BranchHeader :p-node-datas="pNodeDatas" :node-data="nodeData" />
    <BranchBody :p-node-datas="pNodeDatas" :node-data="nodeData" />
  </div>
</template>

<script lang="ts" setup>
import BranchBody from "./BranchBody.vue";
import BranchHeader from "./BranchHeader.vue";
import { IFlowNodeData } from "./FlowData";

defineOptions({
  name: "BranchNode",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();
</script>
