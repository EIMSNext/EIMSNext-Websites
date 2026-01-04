<template>
  <FlowNode :p-node-datas="pNodeDatas" :node-data="nodeData" :content-fun="getContent" />
</template>

<script lang="ts" setup>
import { IFlowNodeData, IFlowNodeMetaData } from "./FlowData";
import FlowNode from "./FlowNode.vue";

defineOptions({
  name: "CopyToNode",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();

const getContent = (metadata: IFlowNodeMetaData): string => {
  if (props.nodeData.metadata.copytoMeta?.approvalCandidates) {
    return props.nodeData.metadata.copytoMeta.approvalCandidates.map(x => x.candidateName).join(',')
  }

  return ""
}
</script>
