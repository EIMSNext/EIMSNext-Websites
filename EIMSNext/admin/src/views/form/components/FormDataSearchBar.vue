<template>
  <div class="form-data-search-bar">
    <el-input
      v-model="keywordProxy"
      class="search-input"
      clearable
      :disabled="disabled"
      :placeholder="placeholderText"
      @keyup.enter="emitSearch"
      @clear="emitSearch"
    >
      <template #prefix>
        <et-icon icon="el-search" />
      </template>
      <template #suffix>
        <el-popover
          v-model:visible="pickerVisible"
          placement="bottom-end"
          :width="280"
          trigger="click"
          popper-class="form-data-search-popover"
          :teleported="true"
        >
          <template #reference>
            <button
              type="button"
              class="field-select-trigger"
              :disabled="disabled"
              :aria-label="t('admin.formList.searchSpecificFields')"
            >
              <et-icon :icon="pickerVisible ? 'el-arrow-up' : 'el-arrow-down'" size="14px" />
            </button>
          </template>
          <div class="search-popover">
            <el-input
              v-model="fieldKeyword"
              class="field-search-input"
              clearable
              :placeholder="t('admin.formList.searchFieldPlaceholder')"
            >
              <template #prefix>
                <et-icon icon="el-search" />
              </template>
            </el-input>
            <el-scrollbar max-height="280px" class="search-field-list">
              <div
                v-for="field in filteredPickerFields"
                :key="field.field"
                class="search-field-item"
                :class="{
                  selected: isSelected(field.field),
                  disabled: isSelectionDisabled(field.field),
                }"
                @click="toggleField(field)"
              >
                <el-checkbox
                  :model-value="isSelected(field.field)"
                  :disabled="isSelectionDisabled(field.field)"
                  @click.stop
                  @change="toggleField(field)"
                />
                <span class="search-field-label" :title="field.label">{{ field.label }}</span>
              </div>
              <div v-if="filteredPickerFields.length === 0" class="search-field-empty">
                {{ t("common.noData") }}
              </div>
            </el-scrollbar>
            <div class="selection-count">{{ props.selectedFields.length }} / {{ MAX_SEARCH_FIELD_COUNT }}</div>
          </div>
        </el-popover>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { IFormFieldDef } from "@eimsnext/components";
import { FieldType } from "@eimsnext/models";
import { MAX_SEARCH_FIELD_COUNT } from "../searchUtils";

type SearchPickerField = {
  field: string;
  label: string;
  type: FieldType;
};

const props = withDefaults(defineProps<{
  keyword: string;
  selectedFields: string[];
  fields: IFormFieldDef[];
  disabled?: boolean;
}>(), {
  disabled: false,
});

const emit = defineEmits<{
  "update:keyword": [value: string];
  "update:selectedFields": [value: string[]];
  search: [];
}>();

const { t } = useI18n();
const pickerVisible = ref(false);
const fieldKeyword = ref("");

const keywordProxy = computed({
  get: () => props.keyword,
  set: (value: string) => emit("update:keyword", value),
});

const pickerFields = computed<SearchPickerField[]>(() =>
  props.fields.map((field) => ({
    field: field.field,
    label: field.label,
    type: field.type,
  })),
);

const selectedFieldSet = computed(() => new Set(props.selectedFields));
const filteredPickerFields = computed(() => {
  const keyword = fieldKeyword.value.trim().toLocaleLowerCase();
  if (!keyword) return pickerFields.value;
  return pickerFields.value.filter((field) =>
    field.label.toLocaleLowerCase().includes(keyword),
  );
});

const placeholderText = computed(() =>
  props.disabled ? t("admin.formList.noSearchableField") : t("admin.formList.searchPlaceholder"),
);

const isSelected = (field: string) => selectedFieldSet.value.has(field);
const isSelectionDisabled = (field: string) =>
  !isSelected(field) && props.selectedFields.length >= MAX_SEARCH_FIELD_COUNT;

const toggleField = (field: SearchPickerField) => {
  if (isSelected(field.field)) {
    removeField(field.field);
    return;
  }
  if (isSelectionDisabled(field.field)) return;
  emit("update:selectedFields", [...props.selectedFields, field.field]);
};

const removeField = (field: string) => {
  emit("update:selectedFields", props.selectedFields.filter((item) => item !== field));
};

const emitSearch = () => {
  if (props.disabled) return;
  emit("search");
};
</script>

<style scoped lang="scss">
.form-data-search-bar {
  display: flex;
  align-items: center;
  flex: 0 0 200px;
  width: 200px;
}

.search-input {
  width: 100%;
}

.field-select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--et-size-24);
  height: var(--et-size-24);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--et-text-secondary);
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
}

.search-popover {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-8);
}

.field-search-input {
  width: 100%;
}

.search-field-list {
  margin: 0 calc(var(--et-space-4) * -1);
}

.search-field-item {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
  min-height: 32px;
  padding: 0 var(--et-space-8);
  overflow: hidden;
  border-radius: var(--et-radius-4);
  cursor: pointer;

  &:hover,
  &.selected {
    background: var(--et-fill-color-light);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.search-field-label {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--et-text-primary);
  line-height: 32px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-field-empty {
  padding: var(--et-space-16) var(--et-space-8);
  color: var(--et-text-secondary);
  text-align: center;
}

.selection-count {
  text-align: right;
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
}
</style>
