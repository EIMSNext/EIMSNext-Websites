<template>
  <form-create-mobile
    v-model="innerValue"
    :rule="rule"
    :option="option"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  rule: unknown[];
  option: Record<string, unknown>;
  modelValue: Record<string, unknown>;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, unknown>];
}>();

const innerValue = ref<Record<string, unknown>>(props.modelValue || {});

watch(
  () => props.modelValue,
  (value) => {
    innerValue.value = value || {};
  },
  { deep: true }
);

watch(
  innerValue,
  (value) => {
    emit("update:modelValue", value);
  },
  { deep: true }
);

</script>
