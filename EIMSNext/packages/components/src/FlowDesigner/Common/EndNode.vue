<template>
  <div class="flow-end-wrapper">
    <div class="flow-end-node">{{ t("workflow.endNode") }}</div>
    <el-icon class="arrow-down">
      <CaretBottom />
    </el-icon>
  </div>
</template>
<script lang="ts" setup>
import { IFlowNodeData } from "./FlowData";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "EndNode",
});
const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();
</script>
