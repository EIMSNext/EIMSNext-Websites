<template>
  <el-color-picker
    :model-value="modelValue"
    :predefine="colorPresets"
    popper-class="theme-picker-dropdown"
    @update:model-value="onUpdate"
  />
</template>

<script lang="ts" setup>
defineProps({
  modelValue: String,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// 定义颜色预设
const colorPresets = [
  "#4080FF",
  "#ff4500",
  "#ff8c00",
  "#90ee90",
  "#00ced1",
  "#1e90ff",
  "#c71585",
  "#ff7840",
  "#6d5dfc",
  "#16a34a",
];

// 受控组件：只透传用户操作，不回写内部状态。
// 这样生效色（如登录后加载的企业主题色）变化时能正确回显，
// 且不会因为回显而误判为“用户自定义”。
const onUpdate = (value: string | null) => {
  emit("update:modelValue", value ?? "");
};
</script>

<style scoped>
:deep(.theme-picker-dropdown) {
  z-index: 99999 !important;
}
</style>
