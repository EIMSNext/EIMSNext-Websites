<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    class="line-svg"
    :class="{ executed: props.executed && !props.failed, failed: props.failed }"
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

const props = withDefaults(
  defineProps<{
    executed?: boolean;
    failed?: boolean;
  }>(),
  {
    executed: false,
    failed: false,
  },
);

const lineStyle = computed(() => {
  const color = props.failed
    ? "var(--et-color-danger)"
    : props.executed
      ? "var(--et-color-success)"
      : "var(--et-border-color-strong)";
  return `stroke: ${color}; stroke-width: 10;`;
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
  z-index: -1;
  vector-effect: non-scaling-stroke;

  &.executed {
    border-color: var(--et-color-success);
  }

  &.failed {
    border-color: var(--et-color-danger);
  }
}
</style>
