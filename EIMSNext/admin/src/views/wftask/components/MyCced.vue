<template>
  <WfTaskLogs :filter="filter" />
</template>
<script setup lang="ts">
defineOptions({
  name: "MyApproved",
});

import WfTaskLogs from './WfTaskLogs.vue';

const filter = { result: 7 }

</script>