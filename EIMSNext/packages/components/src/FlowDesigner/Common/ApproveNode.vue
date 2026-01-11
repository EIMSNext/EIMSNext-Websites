<template>
  <FlowNode :p-node-datas="pNodeDatas" :node-data="nodeData" :contentFun="getContent" />
</template>

<script lang="ts" setup>
import { IFlowNodeData, IFlowNodeMetaData } from "./FlowData";
import FlowNode from "./FlowNode.vue";

defineOptions({
  name: "ApproveNode",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();

const getContent = (metadata: IFlowNodeMetaData): string => {
  if (props.nodeData.metadata.approveMeta?.approvalCandidates) {
    return props.nodeData.metadata.approveMeta.approvalCandidates.map(x => x.candidateName).join(',')
  }

  return ""
}
</script>
