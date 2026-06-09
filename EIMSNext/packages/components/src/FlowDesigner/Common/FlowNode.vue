<template>
  <div
    class="flow-node-wrapper"
    :class="{
      dragging: isDragging,
      'drag-over': isDragOver,
      'drag-over-before': isDragOver && dragOverPosition === 'before',
      'drag-over-after': isDragOver && dragOverPosition === 'after',
    }"
    :draggable="canDrag"
    @dragstart="dragStart"
    @dragover="dragOver"
    @dragleave="dragLeave"
    @drop="dropNode"
    @dragend="dragEnd"
  >
    <el-popover ref="popoverRef" width="60" popper-class="node-action-popover" trigger="hover" placement="top-end"
      :show-arrow="false" :disabled="flowContext.structureReadonly || (!allowCopy && !allowDelete)">
      <div class="node-actions">
        <div v-if="allowCopy && !flowContext.structureReadonly" class="copy-btn" @click.stop="
          copyClick(
            nodeData.nodeType === FlowNodeType.Condition
              ? branchItemData!
              : nodeData,
          )
          ">
          <et-icon icon="el-CopyDocument" />
        </div>
        <div v-if="allowCopy && allowDelete && !flowContext.structureReadonly" class="action-split" />
        <div v-if="allowDelete && !flowContext.structureReadonly" class="delete-btn" @click.stop="delClick(nodeData)">
          <et-icon icon="el-Delete" />
        </div>
      </div>
      <template #reference>
        <slot>
          <div class="flow-node" :class="[{ active: isActived }]" @click.stop="nodeClick(nodeData)">
            <div class="flow-node-title initiator">
              <et-icon :icon="'el-' + iconName" class="node-icon" :color="iconColor" />
              <span class="node-title-text">
                {{ nodeData.name }}
              </span>
            </div>
            <div class="flow-node-content">
              <div class="node-desc" v-html="content" />
            </div>
          </div>
        </slot>
      </template>
    </el-popover>
    <AddNodeButton v-if="showAddButton && !flowContext.structureReadonly" :p-node-datas="pNodeDatas" :node-data="nodeData" />
    <div class="flow-connector" />
    <et-icon v-if="!isStart" icon="el-CaretBottom" class="arrow-down" />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, ref } from "vue";
import AddNodeButton from "./AddNodeButton.vue";
import {
  IFlowNodeData,
  IFlowContext,
  FlowNodeType,
  IFlowNodeMetaData,
  cleanupInvalidDataflowDependencies,
  moveFlowNode,
  syncFlowNodeOrder,
} from "./FlowData";
import { FlowType } from "@eimsnext/models";

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
    contentFun?: (metadata: IFlowNodeMetaData) => string;
  }>(),
  {
    iconName: "Stamp",
    iconColor: "var(--et-color-secondary)",
    isStarted: false,
    showAddButton: true,
    allowCopy: true,
    allowDelete: true,
  },
);

const flowContext = inject<IFlowContext>("flowContext")!;
const popoverRef = ref();
const isDragging = ref(false);
const isDragOver = ref(false);
const dragOverPosition = ref<"before" | "after">("before");
const isActived = computed(() => flowContext.activeData.id === props.nodeData.id);
const canDrag = computed(
  () =>
    !flowContext.structureReadonly &&
    props.allowDelete &&
    props.nodeData.nodeType !== FlowNodeType.Condition &&
    props.nodeData.nodeType !== FlowNodeType.ConditionOther
);
const canDrop = computed(() => !flowContext.structureReadonly);
const isDropTarget = computed(
  () =>
    props.pNodeDatas.includes(props.nodeData) ||
    props.nodeData.nodeType === FlowNodeType.Start ||
    props.nodeData.nodeType === FlowNodeType.Condition ||
    props.nodeData.nodeType === FlowNodeType.ConditionOther
);
const content = computed(() => {
  if (props.contentFun) return props.contentFun(props.nodeData.metadata);

  return props.nodeData.notes || props.nodeData.name;
});

const copyClick = (data: IFlowNodeData) => {
  popoverRef.value.hide();

  flowContext.clonedData = data;
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
        props.pNodeDatas.splice(index, 1);
        syncFlowNodeOrder(flowContext.flowData, props.pNodeDatas);
      }
      break;
  }
};

const emit = defineEmits(["nodeClick"]);
const nodeClick = (data: IFlowNodeData) => {
  flowContext.activeData = data;

  emit("nodeClick", data);
};

const dragStart = (event: DragEvent) => {
  if (!canDrag.value) {
    event.preventDefault();
    return;
  }

  flowContext.draggingData = {
    nodeData: props.nodeData,
    pNodeDatas: props.pNodeDatas,
  };
  isDragging.value = true;
  event.dataTransfer?.setData("text/plain", props.nodeData.id);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
  }
};

const dragOver = (event: DragEvent) => {
  const draggingData = flowContext.draggingData;
  if (
    !canDrop.value ||
    !isDropTarget.value ||
    !draggingData ||
    draggingData.nodeData === props.nodeData
  ) {
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
  if (
    props.nodeData.nodeType === FlowNodeType.Start ||
    props.nodeData.nodeType === FlowNodeType.Condition ||
    props.nodeData.nodeType === FlowNodeType.ConditionOther
  ) {
    dragOverPosition.value = "after";
  } else {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    dragOverPosition.value = event.clientY > rect.top + rect.height / 2 ? "after" : "before";
  }
  isDragOver.value = true;
};

const dragLeave = () => {
  isDragOver.value = false;
};

const dropNode = (event: DragEvent) => {
  const draggingData = flowContext.draggingData;
  isDragOver.value = false;
  if (
    !canDrop.value ||
    !isDropTarget.value ||
    !draggingData ||
    draggingData.nodeData === props.nodeData
  ) {
    return;
  }

  event.preventDefault();

  const moved = moveFlowNode(
    flowContext.flowData,
    draggingData.nodeData,
    draggingData.pNodeDatas,
    props.pNodeDatas,
    props.nodeData,
    dragOverPosition.value
  );
  if (moved && flowContext.flowType === FlowType.Dataflow) {
    cleanupInvalidDataflowDependencies(flowContext.flowData);
  }
};

const dragEnd = () => {
  isDragging.value = false;
  isDragOver.value = false;
  dragOverPosition.value = "before";
  flowContext.draggingData = undefined;
};
</script>
