<template>
  <FlowNode :p-node-datas="pNodeDatas" :node-data="nodeData" :show-add-button="false" class="branch-header">
    <div class="flow-node branch-header-node">
      <et-icon class="icon-branch-header" icon="branch-node" size="24px" />
    </div>
  </FlowNode>
</template>

<script lang="ts" setup>
import { IFlowNodeData } from "./FlowData";
import FlowNode from "./FlowNode.vue";

defineOptions({
  name: "BranchHeader",
});

const props = defineProps<{
  pNodeDatas: IFlowNodeData[];
  nodeData: IFlowNodeData;
}>();
</script>
<style lang="scss" scoped>
.branch-header {
  padding-top: var(--et-space-4);
  height: var(--et-size-80);
}

.branch-header-node {
  transform: rotateZ(45deg) !important;
  width: var(--et-size-36) !important;
  height: var(--et-size-36) !important;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 16px 16px 5px !important
}
</style>
