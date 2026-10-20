<template>
  <form-create-mobile
    v-model="innerValue"
    :rule="rule"
    :option="option"
    :preview="preview"
  />
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";

const props = defineProps<{
  rule: unknown[];
  option: Record<string, unknown>;
  modelValue: Record<string, unknown>;
  preview?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, unknown>];
  settled: [];
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

// form-create 生成/刷新完成后的通知：生成期会把控件初始值（如数字控件默认 1）写入 model，
// 父组件须在此时之后取脏检查基线，否则初始值被误判为用户修改
const notifySettled = async () => {
  await nextTick();
  await nextTick();
  emit("settled");
};

onMounted(notifySettled);

// preview 切换（进入/退出编辑态）触发 form-create 整表刷新，刷新后同样需要重新取基线
watch(() => props.preview, notifySettled);

</script>