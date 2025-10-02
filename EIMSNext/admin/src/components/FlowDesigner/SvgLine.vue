<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    class="line-svg"
    width="2"
    preserveAspectRatio="xMinYMin meet"
  >
    <path :d="'M1 0,L1 0'" fill="#000000" :style="lineStyle" />
  </svg>
</template>
<script lang="ts" setup>
defineOptions({
  name: "SvgLine",
});

const lineStyle = computed(() => {
  return "stroke: #bbb; stroke-width: 10;";
});
</script>
<style lang="scss" scoped>
.line-svg {
  border: 1px solid #bbb;
  position: absolute;
  top: 0;
  left: calc(50% - 1px);
  height: 100%;
  width: 2px;
  z-index: 1;
  vector-effect: non-scaling-stroke;
}
</style>
