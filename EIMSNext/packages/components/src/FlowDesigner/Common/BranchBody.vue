<template>
  <div class="branch-body">
    <el-popover
      v-if="!flowContext.structureReadonly"
      :show-arrow="false"
      placement="right"
      width="200"
      trigger="click"
    >
      <el-button
        icon="el-plus"
        class="popover-action-button"
        @click.stop="addBranchItem"
      >
        {{ t("workflow.addBranch") }}
      </el-button>
      <el-button
        :disabled="!canPaste"
        icon="el-copy-document"
        class="popover-action-button popover-action-button-spaced"
        @click.stop="pasteBranchItem"
      >
        {{ t("workflow.pasteBranch") }}
      </el-button>
      <template #reference>
        <div class="branch-head branch-head-visible">
          <i class="add-icon" />
        </div>
      </template>
    </el-popover>

    <div class="branch-list">
      <BranchItem
        v-for="(item, index) in nodeData.childNodes"
        :p-node-datas="nodeData.childNodes!"
        :node-data="item"
        :data-index="index"
      />
    </div>
    <div class="branch-foot" :class="{ 'log-executed': isExecuted, 'log-failed': isFailed }">
      <AddNodeButton
        v-if="!flowContext.structureReadonly"
        :p-node-datas="pNodeDatas"
        :node-data="nodeData"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick } from "vue";
import AddNodeButton from "./AddNodeButton.vue";
import BranchItem from "./BranchItem.vue";
import {
  cloneFlowNode,
  createFlowNode,
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
} from "./FlowData";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "BranchBody",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();
const flowContext = inject<IFlowContext>("flowContext")!;
const canPaste = computed(() => flowContext.clonedData.nodeType === FlowNodeType.BranchItem);
const isExecuted = computed(() => {
  if (!flowContext.logState) return false;
  if (flowContext.logState.isNodeExecuted?.(props.nodeData)) return true;
  return props.nodeData.childNodes?.some(hasExecutedNode) ?? false;
});
const isFailed = computed(() => {
  if (!flowContext.logState) return false;
  if (flowContext.logState.isNodeFailed?.(props.nodeData)) return true;
  return props.nodeData.childNodes?.some(hasFailedNode) ?? false;
});

const addBranchItem = () => {
  const newBranchItem = createFlowNode(FlowNodeType.BranchItem, t);
  addNewNode(props.nodeData.childNodes!, newBranchItem);
};
const pasteBranchItem = () => {
  if (flowContext.clonedData) {
    const newBranchItem = cloneFlowNode(flowContext.clonedData);
    addNewNode(props.nodeData.childNodes!, newBranchItem);
  }
};
function addNewNode(pNodeDatas: IFlowNodeData[], newBranchItem: IFlowNodeData) {
  const childNodes = pNodeDatas;
  const lastIndex = childNodes.length - 1;
  const lastBranchItem = childNodes[lastIndex];
  childNodes.splice(lastIndex, 1);
  nextTick(() => {
    childNodes.push(newBranchItem, lastBranchItem);
    newBranchItem.prevId = props.nodeData.id;
  });
}

function hasExecutedNode(node: IFlowNodeData): boolean {
  if (flowContext.logState?.executedNodeIds.has(node.id) || flowContext.logState?.failedNodeIds.has(node.id)) {
    return true;
  }

  return node.childNodes?.some(hasExecutedNode) ?? false;
}

function hasFailedNode(node: IFlowNodeData): boolean {
  if (flowContext.logState?.failedNodeIds.has(node.id)) {
    return true;
  }

  return node.childNodes?.some(hasFailedNode) ?? false;
}
</script>

<style scoped>
.popover-action-button {
  width: 100%;
}

.popover-action-button-spaced {
  margin-left: var(--et-space-0) !important;
  margin-top: var(--et-space-10);
}

.branch-head-visible {
  opacity: 1;
}
</style>
