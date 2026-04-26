<template>
  <div v-if="ready">
    <component
      :is="'form-create-mobile'"
      v-model="innerValue"
      :rule="rule"
      :option="option"
    />
  </div>
  <div v-else class="renderer-loading">加载表单中...</div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, watch } from "vue";

const props = defineProps<{
  rule: unknown[];
  option: Record<string, unknown>;
  modelValue: Record<string, unknown>;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, unknown>];
}>();

const ready = ref(false);
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

onMounted(async () => {
  const [{ default: FormCreateMobile }, { default: install }] = await Promise.all([
    import("@eimsnext/form-render-vant"),
    import("@eimsnext/form-render-vant/auto-import"),
  ]);

  const instance = getCurrentInstance();
  const app = instance?.appContext.app;

  if (app) {
    FormCreateMobile.use(install);
    app.use(FormCreateMobile);
  }

  ready.value = true;
});
</script>

<style scoped lang="scss">
.renderer-loading {
  padding: 24px 0;
  text-align: center;
  color: var(--mobile-text-tertiary);
  font-size: 12px;
}
</style>
