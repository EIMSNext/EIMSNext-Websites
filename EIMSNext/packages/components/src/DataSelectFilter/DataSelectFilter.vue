<template>
  <div class="et-data-select-filter" v-click-outside="onClickOutside">
    <ConditionList
      v-model="innerValue"
      :form-id="formId"
      :max-level="1"
      :field-build-setting="fieldBuildSetting"
      :value-build-setting="fieldBuildSetting"
    />
    <div class="filter-actions">
      <el-button type="primary" @click="onConfirm">筛选</el-button>
      <el-button @click="onReset">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ClickOutside as vClickOutside } from "element-plus";
import { FieldBuildRule, type IFieldBuildSetting } from "../NodeFieldList/type";
import { type IConditionList } from "../ConditionList/type";
import type { IFormFieldDef } from "../FieldSelect/type";

defineOptions({
  name: "DataSelectFilter",
});

const props = defineProps<{
  modelValue: IConditionList;
  formId: string;
  fields?: IFormFieldDef[];
}>();

const emit = defineEmits(["update:modelValue", "ok", "cancel"]);

const createEmptyFilter = (): IConditionList => ({
  id: "",
  rel: "and",
  items: [],
});

const innerValue = ref<IConditionList>(props.modelValue || createEmptyFilter());

watch(
  () => props.modelValue,
  (value) => {
    innerValue.value = value || createEmptyFilter();
  },
  { immediate: true, deep: true },
);

const fieldBuildSetting = computed<IFieldBuildSetting>(() => ({
  version: props.fields?.length || 0,
  rule: FieldBuildRule.All,
  matchType: false,
  fields: props.fields || [],
} as IFieldBuildSetting & { fields: IFormFieldDef[] }));

const onConfirm = () => {
  emit("update:modelValue", innerValue.value);
  emit("ok", innerValue.value);
};

const onReset = () => {
  const empty = createEmptyFilter();
  innerValue.value = empty;
  emit("update:modelValue", empty);
  emit("ok", empty);
};

const onClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const excludedClasses = ["et-data-select-filter", "el-select__popper", "el-dropdown__popper", "el-picker__popper"];
  if (excludedClasses.some((cls) => target.closest(`.${cls}`))) {
    return;
  }
  emit("cancel");
};
</script>

<style scoped lang="scss">
.et-data-select-filter {
  width: 500px;
  color: var(--et-text-primary);
  background: var(--et-bg-container);

  :deep(.el-card),
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-textarea__inner) {
    background: var(--et-bg-container);
    color: var(--et-text-primary);
  }

  :deep(.el-textarea__inner),
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    box-shadow: 0 0 0 1px var(--et-border-color-light) inset;
  }
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;

  :deep(.el-button:not(.el-button--primary)) {
    color: var(--et-text-primary);
    background: var(--et-bg-container);
    border-color: var(--et-border-color-light);
  }

  :deep(.el-button:not(.el-button--primary):hover) {
    color: var(--et-text-primary);
    background: var(--et-fill-color-light);
    border-color: var(--et-border-color-light);
  }

  :deep(.el-button--primary) {
    color: var(--et-text-on-primary);
    background: var(--et-color-primary);
    border-color: var(--et-color-primary);
  }

  :deep(.el-button--primary:hover) {
    color: var(--et-text-on-primary);
    background: var(--et-color-primary-hover);
    border-color: var(--et-color-primary-hover);
  }
}
</style>
