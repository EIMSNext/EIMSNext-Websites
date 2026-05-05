<template>
  <div class="_fd-table-form">
    <div class="_fd-tf-wrap" v-if="$slots.default">
      <slot></slot>
    </div>
    <div class="_fc-child-empty" v-else></div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "TableFormView",
  data() {
    return {};
  },
});
</script>

<style>
._fd-table-form {
  min-height: 92px;
  width: 100%;
  border: 1px solid var(--fc-line-color-3);
  background: var(--fc-bg-color-1);
  border-radius: 6px;
  overflow: hidden;
}

._fc-child-empty {
  min-height: 92px;
}

._fd-tf-wrap {
  display: flex;
  overflow: auto;
  min-height: 92px;
  padding: 0;
  box-sizing: border-box;
  background: var(--fc-bg-color-1);
}

._fd-tf-wrap > ._fd-tableform-drag {
  display: inline-flex;
  align-items: stretch;
  align-content: flex-start;
  flex-wrap: nowrap !important;
  min-width: 100%;
  min-height: 90px;
  width: max-content;
}

._fd-tf-wrap > ._fd-tableform-drag.drag-holder {
  position: relative;
  min-width: 100%;
  min-height: 90px;
  width: 100%;
}

._fd-tf-wrap > ._fd-tableform-drag.drag-holder::after {
  inset: 0;
}

._fd-tf-wrap > ._fd-tableform-drag > ._fd-drag-item {
  display: flex;
  width: auto;
  flex: 0 0 auto;
  max-width: none;
  padding-left: 0;
  padding-right: 0;
  margin: 0;
  border: 1px solid var(--fc-bg-color-2);
}

._fd-tf-wrap
  > ._fd-tableform-drag
  > ._fd-drag-item:has(> ._fd-drag-tool > .el-col, > .el-col) {
  flex: 0 0 auto;
  max-width: none;
}

._fd-tf-wrap > ._fd-tableform-drag > ._fd-drag-item > ._fd-drag-tool > .el-col,
._fd-tf-wrap > ._fd-tableform-drag > ._fd-drag-item > .el-col {
  flex: 0 0 auto;
  max-width: none;
}

._fd-tf-wrap > ._fd-tableform-drag > ._fd-drag-item > ._fd-drag-tool {
  display: flex;
  padding: 0;
  margin: 0;
  background: transparent;
  border-radius: 0;
  max-width: calc(100% - 1px);
}

._fd-tf-wrap > ._fd-tableform-drag > ._fd-drag-item > ._fd-drag-tool:hover,
._fd-tf-wrap > ._fd-tableform-drag > ._fd-drag-item > ._fd-drag-tool.active {
  background: transparent;
}

._fd-tf-wrap > ._fd-drag-tool {
  flex-shrink: 0;
  display: flex;
  margin: 0;
  height: auto;
}

._fd-tf-wrap._fd-drop-hover {
  outline: 1px dashed var(--fc-style-color-1);
  background: var(--fc-style-bg-color-1);
}

._fd-tf-wrap .ghost {
  opacity: 0.55;
}
</style>
