<template>
  <el-radio-group
    :model-value="modelValue"
    class="_fd-radio-button-group"
    @update:model-value="onInput"
  >
    <el-radio-button
      v-for="item in options"
      :key="item.value"
      :value="item.value"
    >
      {{ item.label }}
    </el-radio-button>
  </el-radio-group>
</template>

<script>
import { defineComponent } from "vue";

// 配置面板专用的分段单选：只回传选项的 value。
// 不能用别名 radio（=fc-radio）：它按“存储选项对象”的约定回传整个选项，
// 面板字段需要的是标量值。
export default defineComponent({
  name: "RadioButtonGroup",
  props: {
    modelValue: [String, Number, Boolean],
    options: Array,
  },
  emits: ["update:modelValue", "change"],
  methods: {
    onInput(value) {
      this.$emit("update:modelValue", value);
      this.$emit("change", value);
    },
  },
});
</script>

<style>
._fd-radio-button-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* 窄面板里一行放不下 4 个选项，改为独立按钮的 2×2 网格 */
._fd-radio-button-group .el-radio-button__inner {
  width: 100%;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px !important;
  box-shadow: none !important;
  padding: 5px 4px;
  line-height: 20px;
}

._fd-radio-button-group .el-radio-button.is-active .el-radio-button__inner {
  color: var(--el-color-primary);
}
</style>
