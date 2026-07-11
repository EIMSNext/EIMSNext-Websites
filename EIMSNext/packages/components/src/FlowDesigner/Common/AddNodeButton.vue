<template>
  <el-popover ref="popoverRef" :show-arrow="false" placement="right" width="240" trigger="click">
    <el-button :disabled="!canPaste" icon="el-plus" class="popover-action-button" @click.stop="pasteNode">
      {{ t("workflow.pasteNode") }}
    </el-button>

    <div v-for="g in visibleGroups" :key="g.category" class="node-group">
      <div class="node-group__title">{{ t(g.labelKey) }}</div>
      <div class="node-group__grid">
        <button
          v-for="n in g.nodes"
          :key="n.type"
          type="button"
          class="node-card"
          @click.stop="addNode(n.type)">
          <i :class="n.icon" class="node-card__icon" />
          <span class="node-card__label">{{ t(n.labelKey) }}</span>
        </button>
      </div>
    </div>

    <template #reference>
      <div class="btn-add-node">
        <span class="round-btn gray">
          <i class="add-icon" />
        </span>
      </div>
    </template>
  </el-popover>
</template>
<script lang="ts" setup>
import { computed, inject, ref } from "vue";
import {
  cloneFlowNode,
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  createFlowNode,
  syncFlowNodeOrder,
} from "./FlowData";
import { FlowType } from "@eimsnext/models";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "AddNodeButton",
});
const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();

interface NodeDef {
  type: FlowNodeType;
  labelKey: string;
  icon: string;
}
interface NodeGroup {
  category: string;
  labelKey: string;
  flowType: FlowType;
  nodes: NodeDef[];
}

const allGroups: NodeGroup[] = [
  {
    category: "data",
    labelKey: "workflow.category.dataProcessing",
    flowType: FlowType.Dataflow,
    nodes: [
      { type: FlowNodeType.Insert, labelKey: "workflow.insertDataNode", icon: "el-plus" },
      { type: FlowNodeType.Update, labelKey: "workflow.updateDataNode", icon: "el-edit" },
      { type: FlowNodeType.Delete, labelKey: "workflow.deleteDataNode", icon: "el-delete" },
    ],
  },
  {
    category: "control",
    labelKey: "workflow.category.logicControl",
    flowType: FlowType.Dataflow,
    nodes: [{ type: FlowNodeType.Branch2, labelKey: "workflow.branch2Node", icon: "el-copy-document" }],
  },
  {
    category: "query",
    labelKey: "workflow.category.dataQuery",
    flowType: FlowType.Dataflow,
    nodes: [
      { type: FlowNodeType.QueryOne, labelKey: "workflow.queryOneNode", icon: "el-search" },
      { type: FlowNodeType.QueryMany, labelKey: "workflow.queryManyNode", icon: "el-files" },
    ],
  },
  {
    category: "extension",
    labelKey: "workflow.category.extension",
    flowType: FlowType.Dataflow,
    nodes: [
      { type: FlowNodeType.Print, labelKey: "workflow.printNode", icon: "el-printer" },
      { type: FlowNodeType.Plugin, labelKey: "workflow.pluginNode", icon: "el-plug" },
    ],
  },
  {
    category: "approve",
    labelKey: "workflow.category.processApproval",
    flowType: FlowType.Workflow,
    nodes: [
      { type: FlowNodeType.Approve, labelKey: "workflow.taskNode", icon: "el-user" },
      { type: FlowNodeType.CopyTo, labelKey: "workflow.ccNode", icon: "el-promotion" },
    ],
  },
  {
    category: "wfControl",
    labelKey: "workflow.category.logicControl",
    flowType: FlowType.Workflow,
    nodes: [{ type: FlowNodeType.Branch, labelKey: "workflow.branchNode", icon: "el-copy-document" }],
  },
];

const popoverRef = ref();
const flowContext = inject<IFlowContext>("flowContext")!;
const canPaste = computed(() => {
  const { nodeType } = flowContext.clonedData;
  return (
    nodeType === FlowNodeType.Approve ||
    nodeType === FlowNodeType.Branch ||
    nodeType === FlowNodeType.CopyTo ||
    nodeType === FlowNodeType.QueryOne ||
    nodeType === FlowNodeType.QueryMany ||
    nodeType === FlowNodeType.Insert ||
    nodeType === FlowNodeType.Update ||
    nodeType === FlowNodeType.Delete ||
    nodeType === FlowNodeType.Print ||
    nodeType === FlowNodeType.Plugin
  );
});

const visibleGroups = computed(() => allGroups.filter((g) => g.flowType === flowContext.flowType));

const pasteNode = () => {
  if (flowContext.clonedData) {
    const newNodeData = cloneFlowNode(flowContext.clonedData);
    addNewNode(props.pNodeDatas, props.nodeData, newNodeData);
  }
};

const addNode = (nodeType: FlowNodeType) => {
  const newNodeData = createFlowNode(nodeType, t);
  addNewNode(props.pNodeDatas, props.nodeData, newNodeData);
};

function addNewNode(
  pNodeDatas: IFlowNodeData[],
  curNodeData: IFlowNodeData,
  newNodeData: IFlowNodeData
) {
  let index = 0;
  if (
    !(
      curNodeData.nodeType == FlowNodeType.Start ||
      curNodeData.nodeType == FlowNodeType.Condition ||
      curNodeData.nodeType == FlowNodeType.ConditionOther
    )
  ) {
    index = props.pNodeDatas.indexOf(props.nodeData) + 1;
  }

  pNodeDatas.splice(index, 0, newNodeData);
  syncFlowNodeOrder(flowContext.flowData, pNodeDatas);

  popoverRef.value.hide();
}
</script>

<style scoped>
.popover-action-button {
  width: 100%;
}

.node-group + .node-group {
  margin-top: var(--et-space-10, 10px);
}
.node-group__title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 0 0 6px 2px;
}
.node-group__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.node-card {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 10px;
  background: var(--et-bg-container, var(--el-bg-color));
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
}
.node-card:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.node-card__icon {
  font-size: 14px;
}
.node-card__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
