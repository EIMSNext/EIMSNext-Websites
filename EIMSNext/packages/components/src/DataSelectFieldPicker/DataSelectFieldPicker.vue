<template>
  <div class="et-select-data-field-picker">
    <div v-if="showTrigger" class="picker-trigger" @click="expanded = !expanded">
      <div class="picker-trigger-text">
        <slot name="trigger">
          <span>{{ triggerText }}</span>
        </slot>
      </div>
      <el-icon class="picker-trigger-icon">
        <ArrowDown v-if="!expanded" />
        <ArrowUp v-else />
      </el-icon>
    </div>
    <div v-show="expanded" class="picker-panel">
      <div class="picker-search">
        <el-input v-model="keyword" clearable :placeholder="searchPlaceholder">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div v-if="multiple && showSelectAll" class="picker-select-all" @click="toggleAll">
        <el-checkbox :model-value="allChecked" :indeterminate="indeterminate" @click.stop="toggleAll" />
        <span>全选</span>
      </div>
      <div class="picker-list">
        <div
          v-for="field in filteredFields"
          :key="field.field"
          class="picker-item"
          :class="{ selected: isSelected(field.field) }"
          @click="toggleField(field)"
        >
          <div class="picker-item-main">
            <el-checkbox
              v-if="multiple"
              :model-value="isSelected(field.field)"
              @click.stop="toggleField(field)"
            />
            <el-radio
              v-else
              :model-value="isSelected(field.field)"
              :label="field.field"
              @click.stop="toggleField(field)"
            >
              <span />
            </el-radio>
            <span class="picker-item-label">{{ field.label }}</span>
          </div>
        </div>
        <div v-if="filteredFields.length === 0" class="picker-empty">暂无字段</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ArrowDown, ArrowUp, Search } from "@element-plus/icons-vue";
import type { IDataSelectField } from "../DataSelect";

defineOptions({
  name: "DataSelectFieldPicker",
});

const props = withDefaults(
  defineProps<{
    modelValue: IDataSelectField[];
    fields: IDataSelectField[];
    multiple?: boolean;
    searchPlaceholder?: string;
    showSelectAll?: boolean;
    showTrigger?: boolean;
    triggerText?: string;
    defaultExpanded?: boolean;
  }>(),
  {
    modelValue: () => [],
    fields: () => [],
    multiple: true,
    searchPlaceholder: "搜索字段",
    showSelectAll: true,
    showTrigger: false,
    triggerText: "选择字段",
    defaultExpanded: true,
  },
);

const emit = defineEmits(["update:modelValue", "change"]);

const keyword = ref("");
const expanded = ref(props.defaultExpanded);

watch(
  () => props.defaultExpanded,
  (value) => {
    expanded.value = value;
  },
);

const filteredFields = computed(() => {
  const tokens = keyword.value
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length) {
    return props.fields;
  }

  return props.fields.filter((field) =>
    tokens.every((token) => field.label.includes(token) || field.field.includes(token)),
  );
});

const selectedMap = computed(() => {
  const map = new Map<string, IDataSelectField>();
  props.modelValue.forEach((item) => {
    map.set(item.field, item);
  });
  return map;
});

const isSelected = (field: string) => selectedMap.value.has(field);

const allChecked = computed(() => {
  return !!filteredFields.value.length && filteredFields.value.every((field) => isSelected(field.field));
});

const indeterminate = computed(() => {
  const count = filteredFields.value.filter((field) => isSelected(field.field)).length;
  return count > 0 && count < filteredFields.value.length;
});

const updateValue = (value: IDataSelectField[]) => {
  emit("update:modelValue", value);
  emit("change", value);
};

const toggleField = (field: IDataSelectField) => {
  if (!props.multiple) {
    updateValue(isSelected(field.field) ? [] : [field]);
    return;
  }

  if (isSelected(field.field)) {
    updateValue(props.modelValue.filter((item) => item.field !== field.field));
    return;
  }

  updateValue([...props.modelValue, field]);
};

const toggleAll = () => {
  if (allChecked.value) {
    const filteredSet = new Set(filteredFields.value.map((item) => item.field));
    updateValue(props.modelValue.filter((item) => !filteredSet.has(item.field)));
    return;
  }

  const merged = [...props.modelValue];
  filteredFields.value.forEach((field) => {
    if (!merged.find((item) => item.field === field.field)) {
      merged.push(field);
    }
  });
  updateValue(merged);
};
</script>

<style scoped lang="scss">
.et-select-data-field-picker {
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;

  .picker-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .picker-trigger-text {
    color: var(--el-text-color-primary);
    font-size: 14px;
  }

  .picker-panel {
    background: #fff;
  }

  .picker-search {
    padding: 12px 12px 8px;
  }

  .picker-select-all,
  .picker-item {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 0 14px;
    cursor: pointer;
  }

  .picker-select-all {
    gap: 8px;
    color: #3eb6b3;
  }

  .picker-list {
    max-height: 280px;
    overflow: auto;
    padding-bottom: 8px;
  }

  .picker-item {
    &:hover {
      background: var(--el-fill-color-light);
    }

    &.selected {
      background: #f2f7f7;
    }
  }

  .picker-item-main {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .picker-item-label {
    color: var(--el-text-color-primary);
    font-size: 14px;
    line-height: 20px;
  }

  .picker-empty {
    padding: 24px 12px;
    text-align: center;
    color: var(--el-text-color-secondary);
  }
}
</style>
