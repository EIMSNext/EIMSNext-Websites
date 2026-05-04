<template>
  <template v-if="!flowContext.structureReadonly">
    <el-popover
      ref="popoverRef"
      :show-arrow="false"
      placement="right"
      width="200"
      trigger="click"
    >
      <el-button
        :disabled="!canPaste"
        icon="el-plus"
        class="popover-action-button"
        @click.stop="pasteNode"
      >
        {{ t("workflow.pasteNode") }}
      </el-button>
      <template v-if="flowContext.flowType == FlowType.Workflow">
        <el-button
          icon="el-plus"
          class="popover-action-button popover-action-button-spaced"
          @click.stop="addNode(FlowNodeType.Approve)"
        >
          {{ t("workflow.taskNode") }}
        </el-button>
        <el-button
          icon="el-plus"
          class="popover-action-button popover-action-button-spaced"
          @click.stop="addNode(FlowNodeType.CopyTo)"
        >
          {{ t("workflow.ccNode") }}
        </el-button>
        <el-button
          icon="el-copy-document"
          class="popover-action-button popover-action-button-spaced"
          @click.stop="addNode(FlowNodeType.Branch)"
        >
          {{ t("workflow.branchNode") }}
        </el-button>
      </template>
      <template v-if="flowContext.flowType == FlowType.Dataflow">
        <el-button
          icon="el-plus"
          class="popover-action-button popover-action-button-spaced"
          @click.stop="addNode(FlowNodeType.QueryOne)"
        >
          {{ t("workflow.queryOneNode") }}
        </el-button>
        <el-button
          icon="el-plus"
          class="popover-action-button popover-action-button-spaced"
          @click.stop="addNode(FlowNodeType.QueryMany)"
        >
          {{ t("workflow.queryManyNode") }}
        </el-button>
        <el-button
          icon="el-plus"
          class="popover-action-button popover-action-button-spaced"
          @click.stop="addNode(FlowNodeType.Insert)"
        >
          {{ t("workflow.insertDataNode") }}
        </el-button>
        <el-button
          icon="el-plus"
          class="popover-action-button popover-action-button-spaced"
          @click.stop="addNode(FlowNodeType.Update)"
        >
          {{ t("workflow.updateDataNode") }}
        </el-button>
        <el-button
          icon="el-plus"
          class="popover-action-button popover-action-button-spaced"
          @click.stop="addNode(FlowNodeType.Delete)"
        >
          {{ t("workflow.deleteDataNode") }}
        </el-button>
        <!-- <el-button
        icon="el-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.Print)"
      >
        {{ t("workflow.printNode") }}
      </el-button>
      <el-button
        icon="el-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.Plugin)"
      >
        {{ t("workflow.pluginNode") }}
      </el-button> -->
        <el-button
          icon="el-copy-document"
          class="popover-action-button popover-action-button-spaced"
          @click.stop="addNode(FlowNodeType.Branch2)"
        >
          {{ t("workflow.branch2Node") }}
        </el-button>
      </template>
      <template #reference>
        <div class="btn-add-node">
          <span class="round-btn gray">
            <i class="add-icon" />
          </span>
        </div>
      </template>
    </el-popover>
  </template>
</template>
<script lang="ts" setup>
import { computed, inject, ref } from "vue";
import {
  cloneFlowNode,
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  createFlowNode,
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

  let next = pNodeDatas.find((x) => x.id === curNodeData.nextId);

  newNodeData.prevId = curNodeData.id;
  newNodeData.nextId = next?.id;
  curNodeData.nextId = newNodeData.id;
  if (next) next.prevId = newNodeData.id;

  pNodeDatas.splice(index, 0, newNodeData);

  popoverRef.value.hide();
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
</style>
