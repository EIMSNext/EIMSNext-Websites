<template>
  <div class="branch-body">
    <el-popover
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
    <div class="branch-foot">
      <AddNodeButton :p-node-datas="pNodeDatas" :node-data="nodeData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
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
const canPaste = ref(false);
const flowContext = inject<IFlowContext>("flowContext")!;
const flowContextRef = reactive<IFlowContext>(flowContext);
// const popoverRef = ref();

watch(
  flowContextRef,
  (newValue: IFlowContext) => {
    if (newValue.clonedData.nodeType === FlowNodeType.BranchItem) {
      canPaste.value = true;
    } else {
      canPaste.value = false;
    }
  },
  { immediate: true },
);

const addBranchItem = () => {
  const newBranchItem = createFlowNode(FlowNodeType.BranchItem, t);
  addNewNode(props.nodeData.childNodes!, newBranchItem);
};
const pasteBranchItem = () => {
  if (flowContext && flowContext.clonedData) {
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
  });
}
</script>

<style scoped>
.popover-action-button {
  width: 100%;
}

.popover-action-button-spaced {
  margin-left: var(--et-space-0);
  margin-top: var(--et-space-10);
}

.branch-head-visible {
  opacity: 1;
}
</style>
