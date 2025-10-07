<template>
  <WfApprovalLogs :filter="filter" />
</template>
<script setup lang="ts">
defineOptions({
  name: "MyApproved",
});

import WfApprovalLogs from './WfApprovalLogs.vue';

const filter = { nodeType: 7 }

</script>