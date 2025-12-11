<template>
  <div class="branch-body">
    <el-popover :show-arrow="false" placement="right" width="200" trigger="click">
      <el-button icon="el-icon-plus" style="width: 100%" @click.stop="addBranchItem">
        {{ t("添加分支") }}
      </el-button>
      <el-button
        :disabled="!canPaste"
        icon="el-icon-copy-document"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="pasteBranchItem"
      >
        {{ t("粘贴分支") }}
      </el-button>
      <template #reference>
        <div class="branch-head" :style="'opacity:1'">
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
  { immediate: true }
);

const addBranchItem = () => {
  const newBranchItem = createFlowNode(FlowNodeType.BranchItem);
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
