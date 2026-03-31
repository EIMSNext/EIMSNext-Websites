<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    class="line-svg"
    width="2"
    preserveAspectRatio="xMinYMin meet"
  >
    <path :d="'M1 0,L1 0'" fill="none" :style="lineStyle" />
  </svg>
</template>
<script lang="ts" setup>
import { computed } from "vue";

defineOptions({
  name: "SvgLine",
});

const lineStyle = computed(() => {
  return "stroke: var(--et-border-color-strong); stroke-width: 10;";
});
</script>
<style lang="scss" scoped>
.line-svg {
  border: 1px solid var(--et-border-color-strong);
  position: absolute;
  top: 0;
  left: calc(50% - 1px);
  height: 100%;
  width: var(--et-space-2);
  z-index: var(--et-z-base);
  vector-effect: non-scaling-stroke;
}
</style>
