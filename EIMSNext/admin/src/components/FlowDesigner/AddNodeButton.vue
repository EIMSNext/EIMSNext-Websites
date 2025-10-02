<template>
  <el-popover ref="popoverRef" :show-arrow="false" placement="right" width="200" trigger="click">
    <el-button
      :disabled="!canPaste"
      icon="el-icon-plus"
      style="width: 100%"
      @click.stop="pasteNode"
    >
      {{ t("粘贴节点") }}
    </el-button>
    <template v-if="flowContext.flowType == FlowType.Workflow">
      <el-button
        icon="el-icon-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.Approve)"
      >
        {{ t("普通审批") }}
      </el-button>
      <el-button
        icon="el-icon-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.CopyTo)"
      >
        {{ t("审批抄送") }}
      </el-button>
      <el-button
        icon="el-icon-copy-document"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.Branch)"
      >
        {{ t("并行分支") }}
      </el-button>
    </template>
    <template v-if="flowContext.flowType == FlowType.Dataflow">
      <el-button
        icon="el-icon-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.QueryOne)"
      >
        {{ t("查询单条数据") }}
      </el-button>
      <el-button
        icon="el-icon-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.QueryMany)"
      >
        {{ t("查询多条数据") }}
      </el-button>
      <el-button
        icon="el-icon-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.Insert)"
      >
        {{ t("新增数据") }}
      </el-button>
      <el-button
        icon="el-icon-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.Update)"
      >
        {{ t("修改数据") }}
      </el-button>
      <el-button
        icon="el-icon-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.Delete)"
      >
        {{ t("删除数据") }}
      </el-button>
      <!-- <el-button
        icon="el-icon-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.Print)"
      >
        {{ t("打印数据") }}
      </el-button>
      <el-button
        icon="el-icon-plus"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.Plugin)"
      >
        {{ t("执行插件") }}
      </el-button> -->
      <el-button
        icon="el-icon-copy-document"
        style="width: 100%; margin-left: 0; margin-top: 10px"
        @click.stop="addNode(FlowNodeType.Branch2)"
      >
        {{ t("条件分支") }}
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
<script lang="ts" setup>
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
const canPaste = ref(false);
const flowContext = inject<IFlowContext>("flowContext")!;
const flowContextRef = reactive<IFlowContext>(flowContext);

watch(
  flowContextRef,
  (newValue: IFlowContext) => {
    if (
      newValue.clonedData.nodeType === FlowNodeType.Approve ||
      newValue.clonedData.nodeType === FlowNodeType.Branch ||
      newValue.clonedData.nodeType === FlowNodeType.CopyTo ||
      newValue.clonedData.nodeType === FlowNodeType.QueryOne ||
      newValue.clonedData.nodeType === FlowNodeType.QueryMany ||
      newValue.clonedData.nodeType === FlowNodeType.Insert ||
      newValue.clonedData.nodeType === FlowNodeType.Update ||
      newValue.clonedData.nodeType === FlowNodeType.Delete ||
      newValue.clonedData.nodeType === FlowNodeType.Print ||
      newValue.clonedData.nodeType === FlowNodeType.Plugin
    ) {
      canPaste.value = true;
    } else {
      canPaste.value = false;
    }
  },
  { immediate: true }
);

const pasteNode = () => {
  if (flowContext && flowContext.clonedData) {
    const newNodeData = cloneFlowNode(flowContext.clonedData);
    addNewNode(props.pNodeDatas, props.nodeData, newNodeData);
  }
};

const addNode = (nodeType: FlowNodeType) => {
  const newNodeData = createFlowNode(nodeType);
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
