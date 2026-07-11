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
      <template #append>
        <el-popover
          placement="bottom-end"
          :width="320"
          trigger="click"
          popper-class="form-data-search-popover"
          :teleported="false"
        >
          <template #reference>
            <el-button text class="field-select-trigger" :disabled="disabled">
              {{ triggerLabel }}
              <et-icon icon="el-arrow-down" />
            </el-button>
          </template>
          <div class="search-popover">
            <div class="search-mode-row">
              <el-radio-group v-model="searchMode">
                <el-radio-button :value="SearchMode.All">{{ t("admin.formList.searchAllFields") }}</el-radio-button>
                <el-radio-button :value="SearchMode.Selected">{{ t("admin.formList.searchSpecificFields") }}</el-radio-button>
              </el-radio-group>
            </div>
            <div v-if="searchMode === SearchMode.Selected" class="search-field-picker">
              <DataSelectFieldPicker
                :model-value="selectedFieldDefs"
                :fields="pickerFields"
                :multiple="true"
                :show-trigger="false"
                :default-expanded="true"
                :search-placeholder="t('admin.formList.searchFieldPlaceholder')"
                @update:model-value="handleFieldUpdate"
              />
            </div>
            <div v-else class="search-all-tip">
              {{ t("admin.formList.searchAllFieldsTip", { count: fields.length }) }}
            </div>
            <div class="search-actions">
              <el-button size="small" @click="resetFields">{{ t("common.reset") }}</el-button>
              <el-button type="primary" size="small" @click="emitSearch">{{ t("common.search") }}</el-button>
            </div>
          </div>
        </el-popover>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { DataSelectFieldPicker, type IFormFieldDef } from "@eimsnext/components";
import { FieldType } from "@eimsnext/models";

enum SearchMode {
  All = "all",
  Selected = "selected",
}

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

const searchMode = ref(props.selectedFields.length > 0 ? SearchMode.Selected : SearchMode.All);

watch(
  () => props.selectedFields,
  (fields) => {
    searchMode.value = fields.length > 0 ? SearchMode.Selected : SearchMode.All;
  },
);

const selectedFieldDefs = computed<SearchPickerField[]>(() => {
  const selected = new Set(props.selectedFields);
  return pickerFields.value.filter((field) => selected.has(field.field));
});

const placeholderText = computed(() =>
  props.disabled ? t("admin.formList.noSearchableField") : t("admin.formList.searchPlaceholder"),
);

const triggerLabel = computed(() => {
  if (searchMode.value === SearchMode.All) return t("admin.formList.searchAllFields");
  if (props.selectedFields.length === 0) return t("admin.formList.searchSpecificFields");
  return t("admin.formList.searchFieldCount", { count: props.selectedFields.length });
});

const handleFieldUpdate = (fields: SearchPickerField[]) => {
  emit("update:selectedFields", fields.map((field) => field.field));
};

const resetFields = () => {
  searchMode.value = SearchMode.All;
  emit("update:selectedFields", []);
};

watch(searchMode, (mode) => {
  if (mode === SearchMode.All && props.selectedFields.length > 0) {
    emit("update:selectedFields", []);
  }
});

const emitSearch = () => {
  if (props.disabled) return;
  emit("search");
};
</script>

<style scoped lang="scss">
.form-data-search-bar {
  display: flex;
  align-items: center;
  width: min(100%, 420px);
}

.search-input {
  width: 100%;
}

.field-select-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--et-space-4);
  color: var(--et-text-secondary);
}

.search-popover {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-12);
}

.search-mode-row {
  display: flex;
  justify-content: space-between;
}

.search-field-picker {
  border: 1px solid var(--et-border-color-light);
  border-radius: var(--et-radius-6);
  overflow: hidden;
}

.search-all-tip {
  padding: var(--et-space-12);
  border-radius: var(--et-radius-6);
  background: var(--et-bg-page);
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--et-space-8);
}

:global(html.dark) .search-all-tip {
  background: var(--et-bg-muted);
}
</style>
