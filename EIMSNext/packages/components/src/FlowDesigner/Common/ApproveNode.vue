<template>
  <FlowNode :p-node-datas="pNodeDatas" :node-data="nodeData" :contentFun="getContent" />
</template>

<script lang="ts" setup>
import { IFlowNodeData, IFlowNodeMetaData } from "./FlowData";
import FlowNode from "./FlowNode.vue";
import { useLocale } from "element-plus";
const { t } = useLocale()

defineOptions({
  name: "ApproveNode",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();

const getContent = (metadata: IFlowNodeMetaData): string => {
  if (metadata.approveMeta?.approvalCandidates
    && metadata.approveMeta?.approvalCandidates.length > 0
  ) {
    return metadata.approveMeta.approvalCandidates.map(x => x.candidateName).join(',')
  }

  return t("workflow.noApprover")
}
</script>
