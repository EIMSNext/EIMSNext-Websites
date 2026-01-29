<template>
  <FlowNode :p-node-datas="pNodeDatas" :node-data="nodeData" :content-fun="getContent" />
</template>

<script lang="ts" setup>
import { IFlowNodeData, IFlowNodeMetaData } from "./FlowData";
import FlowNode from "./FlowNode.vue";
import { useLocale } from "element-plus";
const { t } = useLocale()

defineOptions({
  name: "CopyToNode",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();

const getContent = (metadata: IFlowNodeMetaData): string => {
  if (metadata.copytoMeta?.approvalCandidates
    && metadata.copytoMeta?.approvalCandidates.length > 0
  ) {
    return metadata.copytoMeta.approvalCandidates.map(x => x.candidateName).join(',')
  }

  return t("workflow.noCCMember")
}
</script>
