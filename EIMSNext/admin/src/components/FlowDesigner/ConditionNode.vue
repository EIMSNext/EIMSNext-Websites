<template>
  <FlowNode
    :branch-item-datas="branchItemDatas"
    :branch-item-data="branchItemData"
    :p-node-datas="pNodeDatas"
    :node-data="nodeData"
    :allow-copy="nodeData.nodeType !== FlowNodeType.ConditionOther"
    :allow-delete="nodeData.nodeType !== FlowNodeType.ConditionOther"
  />
</template>

<script lang="ts" setup>
import FlowNode from "./FlowNode.vue";
import { FlowNodeType, IFlowNodeData } from "./FlowData";

defineOptions({
  name: "ConditionNode",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
  dataIndex: number;
  branchItemData: IFlowNodeData;
  branchItemDatas: IFlowNodeData[];
}>();
</script>
