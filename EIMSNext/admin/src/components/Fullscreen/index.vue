<template>
  <div @click="toggle">
    <et-icon :icon="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
  </div>
</template>

<script setup lang="ts">
const { isFullscreen, toggle } = useFullscreen();
</script>

<style lang="scss" scoped></style>
