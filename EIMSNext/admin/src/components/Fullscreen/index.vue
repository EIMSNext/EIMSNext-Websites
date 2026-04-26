<template>
  <div @click="toggle">
    <et-icon :icon="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" size="18" />
  </div>
</template>

<script setup lang="ts">
const { isFullscreen, toggle } = useFullscreen();
</script>

<style lang="scss" scoped></style>
