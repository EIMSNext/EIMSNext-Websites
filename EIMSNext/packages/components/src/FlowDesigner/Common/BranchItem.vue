<template>
  <div class="branch-item" :class="{ 'log-executed': isExecuted, 'log-failed': isFailed }">
    <SvgLine :executed="isExecuted" :failed="isFailed" />
    <div class="branch-item-panel">
      <div class="branch-item-condition branch-item-condition-spacer" />
      <ConditionNode
        :branch-item-datas="pNodeDatas"
        :branch-item-data="nodeData"
        :p-node-datas="nodeData.childNodes!"
        :node-data="nodeData.conditionData!"
        :data-index="dataIndex"
      />
      <template v-for="item in nodeData.childNodes" :key="item.id">
        <ApproveNode
          v-if="item.nodeType == FlowNodeType.Approve"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <CopyToNode
          v-if="item.nodeType == FlowNodeType.CopyTo"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />

        <QueryOneNode
          v-if="item.nodeType == FlowNodeType.QueryOne"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <QueryManyNode
          v-if="item.nodeType == FlowNodeType.QueryMany"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <InsertNode
          v-if="item.nodeType == FlowNodeType.Insert"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <UpdateNode
          v-if="item.nodeType == FlowNodeType.Update"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <DeleteNode
          v-if="item.nodeType == FlowNodeType.Delete"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <PrintNode
          v-if="item.nodeType == FlowNodeType.Print"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <PluginNode
          v-if="item.nodeType == FlowNodeType.Plugin"
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
        <BranchNode
          v-if="
            item.nodeType == FlowNodeType.Branch ||
            item.nodeType == FlowNodeType.Branch2
          "
          :p-node-datas="nodeData.childNodes!"
          :node-data="item"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ConditionNode from "./ConditionNode.vue";
import ApproveNode from "./ApproveNode.vue";
import CopyToNode from "./CopyToNode.vue";
import QueryOneNode from "./QueryOneNode.vue";
import QueryManyNode from "./QueryManyNode.vue";
import InsertNode from "./InsertNode.vue";
import UpdateNode from "./UpdateNode.vue";
import DeleteNode from "./DeleteNode.vue";
import PrintNode from "./PrintNode.vue";
import PluginNode from "./PluginNode.vue";
import BranchNode from "./BranchNode.vue";
import { computed, inject } from "vue";
import { FlowNodeType, IFlowContext, IFlowNodeData } from "./FlowData";
import SvgLine from "./SvgLine.vue";

defineOptions({
  name: "BranchItem",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
  dataIndex: number;
}>();
const flowContext = inject<IFlowContext>("flowContext")!;
const isExecuted = computed(() => {
  if (!flowContext.logState) return false;
  if (flowContext.logState.isBranchExecuted?.(props.nodeData)) return true;
  return props.nodeData.childNodes?.some(hasExecutedNode) ?? false;
});
const isFailed = computed(() => {
  if (!flowContext.logState) return false;
  if (flowContext.logState.isBranchFailed?.(props.nodeData)) return true;
  return props.nodeData.childNodes?.some(hasFailedNode) ?? false;
});

const hasExecutedNode = (node: IFlowNodeData): boolean => {
  if (flowContext.logState?.executedNodeIds.has(node.id) || flowContext.logState?.failedNodeIds.has(node.id)) {
    return true;
  }

  return node.childNodes?.some(hasExecutedNode) ?? false;
};

const hasFailedNode = (node: IFlowNodeData): boolean => {
  if (flowContext.logState?.failedNodeIds.has(node.id)) {
    return true;
  }

  return node.childNodes?.some(hasFailedNode) ?? false;
};
</script>

<style scoped>
.branch-item-condition-spacer {
  min-height: var(--et-size-40);
}
</style>
