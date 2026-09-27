<template>
  <div class="flow-end-wrapper" :class="{ 'log-executed': isExecuted, 'log-failed': isFailed }" @click.stop="nodeClick">
    <div class="flow-end-node" :class="{ success: isExecuted && !isFailed, error: isFailed }">{{ t("workflow.endNode") }}</div>
    <el-icon class="arrow-down">
      <CaretBottom />
    </el-icon>
  </div>
</template>
<script lang="ts" setup>
import { computed, inject } from "vue";
import { IFlowContext, IFlowNodeData } from "./FlowData";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "EndNode",
});
const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();
const flowContext = inject<IFlowContext>("flowContext")!;
const isExecuted = computed(() => flowContext.logState?.executedNodeIds.has(props.nodeData.id) ?? false);
const isFailed = computed(() => flowContext.logState?.failedNodeIds.has(props.nodeData.id) ?? false);
const nodeClick = () => {
  flowContext.activeData = props.nodeData;
  flowContext.logState?.onNodeClick?.(props.nodeData);
};
</script>
