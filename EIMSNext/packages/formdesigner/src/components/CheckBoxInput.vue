<template>
  <div class="_fd-checkbox-input" :class="{ disabled: !!disabled }">
    <el-checkbox v-model="checked">{{ title }}</el-checkbox>
  </div>
</template>
<script>
import { is } from "@eimsnext/form-render-core";
import { defineComponent } from "vue";

export default defineComponent({
  name: "CheckBoxInput",
  props: {
    modelValue: [String, Boolean, Number],
    title: String,
    disabled: Boolean,
  },
  emits: ["update:modelValue"],
  watch: {
    checked() {
      this.update();
    },
    modelValue(n) {
      const flag = is.String(n);
      this.checked = n === undefined ? false : flag ? true : !!n;
    },
  },
  data() {
    const flag = is.String(this.modelValue);
    return {
      checked:
        this.modelValue === undefined ? false : flag ? true : !!this.modelValue,
    };
  },
  methods: {
    update() {
      if (!this.disabled) this.$emit("update:modelValue", this.checked);
    },
  },
});
</script>

<style>
._fd-checkbox-input {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--fc-text-color-2);
}

._fd-checkbox-input.disabled {
  color: var(--fc-text-color-3);
  cursor: not-allowed;
}
</style>
