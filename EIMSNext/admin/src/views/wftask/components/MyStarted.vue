<template>
  <WfTaskLogs :filter="filter" />
</template>
<script setup lang="ts">
defineOptions({
  name: "MyApproved",
});

import WfTaskLogs from './WfTaskLogs.vue';

const filter = { nodeType: 1 }

</script>