<template>
  <div class="flow-node-wrapper">
    <el-popover
      ref="popoverRef"
      width="60"
      popper-class="node-action-popover"
      trigger="hover"
      placement="top-end"
      :show-arrow="false"
      :disabled="!allowCopy && !allowDelete"
    >
      <div class="node-actions">
        <div
          v-if="allowCopy"
          class="copy-btn"
          @click.stop="
            copyClick(nodeData.nodeType === FlowNodeType.Condition ? branchItemData! : nodeData)
          "
        >
          <el-icon><CopyDocument /></el-icon>
        </div>
        <div v-if="allowCopy && allowDelete" class="action-split" />
        <div v-if="allowDelete" class="delete-btn" @click.stop="delClick(nodeData)">
          <el-icon><Delete /></el-icon>
        </div>
      </div>
      <template #reference>
        <slot>
          <div class="flow-node" :class="[{ active: isActived }]" @click.stop="nodeClick(nodeData)">
            <div class="flow-node-title initiator">
              <el-icon class="node-icon" :color="iconColor">
                <component :is="iconName" />
              </el-icon>
              <span class="node-title-text">
                {{ nodeData.name }}
              </span>
            </div>
            <div class="flow-node-content">
              <div class="node-desc" v-html="nodeData.notes || nodeData.name" />
            </div>
          </div>
        </slot>
      </template>
    </el-popover>
    <AddNodeButton v-if="showAddButton" :p-node-datas="pNodeDatas" :node-data="nodeData" />

    <div class="flow-connector" />
    <el-icon v-if="!isStart" class="arrow-down"><CaretBottom /></el-icon>
  </div>
</template>

<script lang="ts" setup>
import AddNodeButton from "./AddNodeButton.vue";
import { IFlowNodeData, IFlowContext, FlowNodeType } from "./FlowData";

defineOptions({
  name: "FlowNode",
});

const props = withDefaults(
  defineProps<{
    pNodeDatas: IFlowNodeData[];
    nodeData: IFlowNodeData;
    iconName?: string;
    iconColor?: string;
    isStart?: boolean;
    showAddButton?: boolean;
    allowCopy?: boolean;
    allowDelete?: boolean;
    branchItemData?: IFlowNodeData;
    branchItemDatas?: IFlowNodeData[];
  }>(),
  {
    iconName: "Stamp",
    iconColor: "#4588ed",
    isStarted: false,
    showAddButton: true,
    allowCopy: true,
    allowDelete: true,
  }
);

const isActived = ref(false);
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const popoverRef = ref();

watch(
  flowContextRef,
  (newValue: IFlowContext) => {
    isActived.value = newValue.activeData.id === props.nodeData.id;
  },
  { immediate: true }
);

const copyClick = (data: IFlowNodeData) => {
  popoverRef.value.hide();

  if (flowContext) flowContextRef.clonedData = data;
};

const delClick = (data: IFlowNodeData) => {
  popoverRef.value.hide();

  switch (data.nodeType) {
    case FlowNodeType.Condition:
      {
        if (props.branchItemDatas && props.branchItemData) {
          let branchIndex = props.branchItemDatas.indexOf(props.branchItemData);
          const remain = props.branchItemDatas.splice(branchIndex + 1);
          props.branchItemDatas.splice(branchIndex);
          nextTick(() => {
            props.branchItemDatas!.push(...remain);
          });
        }
      }
      break;
    default:
      {
        let index = props.pNodeDatas.indexOf(data);
        let prev = props.pNodeDatas.find((x) => x.id === data.prevId);
        let next = props.pNodeDatas.find((x) => x.id === data.nextId);
        if (prev) prev.nextId = next?.id;
        if (next) next.prevId = prev?.id;

        props.pNodeDatas.splice(index, 1);
      }
      break;
  }
};

const emit = defineEmits(["nodeClick"]);
const nodeClick = (data: IFlowNodeData) => {
  if (flowContext) flowContextRef.activeData = data;

  emit("nodeClick", data);
};
</script>
