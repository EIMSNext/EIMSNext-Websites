<template>
  <FlowNode :branch-item-datas="branchItemDatas" :branch-item-data="branchItemData" :p-node-datas="pNodeDatas"
    :node-data="nodeData" :allow-copy="nodeData.nodeType !== FlowNodeType.ConditionOther"
    :allow-delete="nodeData.nodeType !== FlowNodeType.ConditionOther" :contentFun="getContent" />
</template>

<script lang="ts" setup>
import FlowNode from "./FlowNode.vue";
import { FlowNodeType, IFlowNodeData, IFlowNodeMetaData } from "./FlowData";
import { useLocale } from "element-plus";
import { toLabel } from "@/ConditionList/type";
const { t } = useLocale()

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

const getContent = (metadata: IFlowNodeMetaData): string => {
  if (props.nodeData.nodeType === FlowNodeType.ConditionOther)
    return t("workflow.othersNoMatched")
  else if (metadata.conditionMeta?.condition) {
    return toLabel(metadata.conditionMeta?.condition, t) || t("common.notset");
  }
  else
    return t("common.notset")
}

</script>
