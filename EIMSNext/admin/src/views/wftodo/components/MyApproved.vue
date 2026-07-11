<template>
  <WfApprovalLogs :filter="filter" />
</template>
<script setup lang="ts">
defineOptions({
  name: "MyApproved",
});

import WfApprovalLogs from './WfApprovalLogs.vue';

const filter = {
  nodeType: { ne: 1 },
  result: { ne: 7 },
}

</script>
