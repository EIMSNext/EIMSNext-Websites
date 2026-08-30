<template>
  <el-popover
    v-model:visible="visible"
    trigger="click"
    placement="bottom-start"
    :width="280"
    popper-class="field-block-picker-popper"
  >
    <template #reference>
      <span class="field-picker-reference">
        <el-tooltip :content="tooltipContent" placement="top">
          <span class="field-picker-trigger-wrap">
            <el-button class="field-picker-trigger" :disabled="disabled">
              <el-icon class="field-picker-icon"><Plus /></el-icon>
            </el-button>
          </span>
        </el-tooltip>
      </span>
    </template>
    <div class="field-block-picker">
      <el-input v-model="keyword" :placeholder="$t('common.search')" clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div class="picker-list">
        <button
          v-for="item in filteredFields"
          :key="item.field"
          class="picker-item"
          type="button"
          @click="selectField(item)"
        >
          <span class="item-leading">
            <EtIcon
              :icon="fieldIcons[item.type] || 'fc-icon-input'"
              color="var(--et-text-secondary)"
              class="item-icon"
            />
            <span class="item-label">{{ item.label }}</span>
          </span>
          <span
            :class="['item-type', `item-type--${getFieldDataType(item)}`]"
            >{{ t(`eventFlow.fieldDataTypes.${getFieldDataType(item)}`) }}</span
          >
        </button>
        <div v-if="filteredFields.length === 0" class="picker-empty">
          {{ $t("comp.fieldBlockPicker.noFields") }}
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Search, Plus } from "@element-plus/icons-vue";
import { FieldType, FormDef } from "@eimsnext/models";
import { useI18n } from "vue-i18n";
import {
  buildFieldBlockFields,
  FieldBlockField,
} from "../FieldBlock/shared";
import { EtIcon } from "../icon";
import fieldIcons from "../fieldIcons";

const { t } = useI18n();

defineOptions({
  name: "FieldBlockPicker",
});

const props = withDefaults(
  defineProps<{
    formDef?: FormDef;
    fields?: FieldBlockField[];
    showSubFields?: boolean;
    showSystemFields?: boolean;
    disabled?: boolean;
    limitReached?: boolean;
    maxBlocks?: number;
  }>(),
  {
    fields: () => [],
    showSubFields: true,
    showSystemFields: true,
    disabled: false,
    limitReached: false,
    maxBlocks: 5,
  }
);

const emit = defineEmits<{
  select: [field: FieldBlockField];
}>();

const visible = ref(false);
const keyword = ref("");

const tooltipContent = computed(() =>
  props.limitReached ? t("comp.fieldBlockPicker.maxBlocks", { maxBlocks: props.maxBlocks }) : t("comp.fieldBlockPicker.addField")
);

const fieldItems = computed(() =>
  props.fields.length > 0
    ? props.fields
    : buildFieldBlockFields(props.formDef, {
        showSubFields: props.showSubFields,
        showSystemFields: props.showSystemFields,
        t,
      })
);

const filteredFields = computed(() => {
  const search = keyword.value.trim().toLowerCase();
  if (!search) return fieldItems.value;

  return fieldItems.value.filter((item) => {
    return (
      item.label.toLowerCase().includes(search) ||
      item.field.toLowerCase().includes(search)
    );
  });
});

function selectField(field: FieldBlockField) {
  emit("select", field);
}

function getFieldDataType(field: FieldBlockField) {
  if (
    field.isSubField ||
    [
      FieldType.TableForm,
      FieldType.CheckBox,
      FieldType.Select2,
      FieldType.Employee2,
      FieldType.Department2,
    ].includes(field.type)
  ) {
    return "array";
  }
  if (field.type === FieldType.Number) return "number";
  if (field.type === FieldType.TimeStamp) return "dateTime";
  return "text";
}

watch(
  () => props.limitReached,
  (limitReached) => {
    if (limitReached) {
      visible.value = false;
    }
  },
  { immediate: true }
);

watch(visible, (nextVisible) => {
  if (!nextVisible) {
    keyword.value = "";
  }
});
</script>

<style scoped lang="scss">
.field-picker-reference,
.field-picker-trigger-wrap {
  display: inline-flex;
}

.field-picker-trigger {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--et-border-color-light);
  border-radius: 0 var(--et-size-6) var(--et-size-6) 0;
  color: var(--et-color-primary);
  background: var(--et-bg-container);
  box-shadow: none;
}

.field-picker-trigger:hover,
.field-picker-trigger:focus-visible {
  background: var(--et-fill-color-light);
  color: var(--et-color-primary);
}

.field-picker-icon {
  font-size: 14px;
}

.field-picker-trigger:disabled {
  color: var(--et-text-placeholder);
  background: var(--et-bg-container);
}

.field-block-picker {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-10);
}

.field-block-picker :deep(.el-input__wrapper) {
  background: var(--et-bg-container);
}

.picker-list {
  max-height: 260px;
  overflow: auto;
  margin: 0 calc(var(--et-space-10) * -1) calc(var(--et-space-10) * -1);
}

.picker-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--et-space-5);
  border: none;
  border-top: 1px solid var(--et-border-color-light);
  background: var(--et-bg-container);
  color: var(--et-text-primary);
  cursor: pointer;
  gap: var(--et-space-5);
}

.picker-item:hover {
  background: var(--et-bg-page);
}

.item-leading {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: var(--et-space-5);
}

.item-icon {
  flex: 0 0 auto;
}

.item-label {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-type {
  flex-shrink: 0;
  font-size: var(--et-font-size-12);
  line-height: 18px;
  padding: 0 var(--et-space-5);
  border: 1px solid currentcolor;
  border-radius: var(--et-radius-10);
}

.item-type--text {
  color: #f08a37;
  background: color-mix(in srgb, #f08a37 10%, transparent);
}

.item-type--number {
  color: var(--et-color-primary);
  background: color-mix(in srgb, var(--et-color-primary) 10%, transparent);
}

.item-type--dateTime {
  color: var(--et-color-success);
  background: color-mix(in srgb, var(--et-color-success) 10%, transparent);
}

.item-type--array {
  color: #ec4899;
  background: color-mix(in srgb, #ec4899 10%, transparent);
}

.picker-empty {
  padding: var(--et-space-20) var(--et-space-10);
  color: var(--et-text-tertiary);
  text-align: center;
}
</style>
