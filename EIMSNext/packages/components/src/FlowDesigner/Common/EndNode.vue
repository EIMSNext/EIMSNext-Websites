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

<style scoped>
.flow-end-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-end-node {
  min-width: var(--et-size-80);
  padding: var(--et-space-8) var(--et-space-16);
  color: var(--et-color-danger);
  background: var(--et-bg-container);
  border: 1px solid color-mix(in srgb, var(--et-color-danger) 35%, transparent);
  border-radius: var(--et-radius-100);
  box-shadow: var(--et-shadow-sm);
}

.arrow-down {
  margin-top: var(--et-space-8);
  color: var(--et-color-danger);
}

:global(html.dark) .flow-end-node {
  background: color-mix(in srgb, var(--et-bg-container) 85%, var(--et-color-danger) 15%);
}

:global(html.dark) .arrow-down {
  color: color-mix(in srgb, var(--et-color-danger) 80%, #ffffff 20%);
}
</style>
