<template>
  <div class="_fd-tf-col" :style="colStyle">
    <div class="_fd-tf-title">
      <span v-if="required" class="_fd-tf-required">*</span>{{ label || "" }}
    </div>
    <div class="_fd-tf-con" @click.stop @mousedown.stop>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { is } from "@eimsnext/form-render-core";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TableFormColumnView",
  props: {
    label: String,
    width: [Number, String],
    color: String,
    required: Boolean,
  },
  computed: {
    colStyle() {
      const w = this.width;
      const style = {
        width: is.Number(w) ? `${w}px` : !w || w === "auto" ? "160px" : w,
      };
      if (this.color) {
        style.color = this.color;
      }
      return style;
    },
  },
  data() {
    return {};
  },
});
</script>

<style>
._fd-tf-col ._fd-tf-con .el-form-item {
  margin-bottom: 1px !important;
}

._fd-tf-col {
  display: flex;
  flex-direction: column;
  width: 180px;
  flex-shrink: 0;
  min-height: 90px;
  border-right: 1px solid var(--fc-line-color-3);
  background: var(--fc-bg-color-1);
}

._fd-tf-con .el-form-item__label,
._fd-tf-con .van-field__label {
  display: none !important;
}

._fd-tf-con {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 48px;
  padding: 8px 10px;
  box-sizing: border-box;
  user-select: none;
}

._fd-tf-con > * {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
}

._fd-tf-con > .el-col,
._fd-tf-con > [class*="el-col-"],
._fd-tf-con > .fc-form-col {
  flex: 0 0 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

._fd-tf-con .el-form-item__content {
  display: flex;
  margin-left: 0px !important;
  width: 100% !important;
}

._fd-tf-con > * {
  width: 100%;
}

._fd-tf-title {
  display: flex;
  height: 36px;
  width: 100% !important;
  border-bottom: 1px solid #ebeef5;
  align-items: center;
  margin-bottom: 0px;
  padding: 0 12px;
  background: var(--fc-bg-color-2);
  font-weight: 500;
}

._fd-tf-required {
  color: #f56c6c;
  margin-right: 4px;
}

._fd-tf-con ._fc-l-item {
  display: flex;
  width: 100%;
  margin-top: 4px;
  flex-shrink: 0;
}

._fd-tf-con ._fc-l-item > * {
  display: none !important;
}

</style>
