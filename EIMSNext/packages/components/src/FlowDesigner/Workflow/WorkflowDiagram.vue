<template>
  <FlowDiagram :flow-data="flowData"></FlowDiagram>
</template>
<script lang="ts" setup>
import { IFlowData } from "../Common/FlowData";
import FlowDiagram from "../Common/FlowDiagram.vue";

defineOptions({
  name: "WorkflowDiagram",
});
const props = defineProps<{
  flowData: IFlowData;
}>();
</script>
<style lang="scss"></style>
