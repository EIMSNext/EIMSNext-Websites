<template>
  <el-color-picker
    v-model="currentColor"
    :predefine="colorPresets"
    popper-class="theme-picker-dropdown"
  />
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(["update:modelValue"]);

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

const currentColor = ref(props.modelValue);

watch(currentColor, (newValue) => {
  emit("update:modelValue", newValue);
});
</script>

<style scoped>
:deep(.theme-picker-dropdown) {
  z-index: 99999 !important;
}
</style>
