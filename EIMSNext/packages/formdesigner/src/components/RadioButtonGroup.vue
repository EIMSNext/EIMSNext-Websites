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
  width: 100%;
}

._fd-radio-button-group .el-radio-button {
  flex: 1;
}

._fd-radio-button-group .el-radio-button__inner {
  width: 100%;
  padding: 4px;
  line-height: 24px;
}
</style>
