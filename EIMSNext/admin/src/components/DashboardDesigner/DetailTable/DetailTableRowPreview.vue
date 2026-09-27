<template>
  <el-dialog
    :model-value="modelValue"
    width="860px"
    append-to-body
    class="detail-table-preview-dialog"
    @close="close"
  >
    <template #header>
      <div class="dialog-header">
        <div class="dialog-title">{{ title }}</div>
        <div class="dialog-nav" v-if="records.length > 0">
          <el-button link :disabled="currentIndex <= 0" @click="changeIndex(currentIndex - 1)">
            <et-icon icon="el-arrowLeft" />
          </el-button>
          <span>{{ currentIndex + 1 }}/{{ records.length }}</span>
          <el-button link :disabled="currentIndex >= records.length - 1" @click="changeIndex(currentIndex + 1)">
            <et-icon icon="el-arrowRight" />
          </el-button>
        </div>
      </div>
    </template>

    <div v-if="currentRecord && displayFields.length > 0" class="preview-grid">
      <div v-for="field in displayFields" :key="field.field" class="preview-field">
        <div class="field-label">{{ field.label }}</div>
        <div class="field-value">{{ getDisplayValue(currentRecord, field) || "-" }}</div>
      </div>
    </div>
    <el-empty v-else :description="t('admin.dashboardDetailTableDesigner.noDisplayFields')" />

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" text @click="openRawData">{{ t("admin.dashboardDetailTableDesigner.viewRawData") }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { IFormFieldDef, findFieldDef, formatFormValue } from "@eimsnext/components";
import { FlowStatus, FormData, FormDef, SystemField, isSystemField } from "@eimsnext/models";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "DetailTableRowPreview",
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    formDef?: FormDef;
    records: FormData[];
    displayFields: IFormFieldDef[];
    currentIndex: number;
  }>(),
  {
    records: () => [],
    displayFields: () => [],
    currentIndex: 0,
  },
);

const emit = defineEmits(["update:modelValue", "change-index", "open-raw"]);

const currentRecord = computed(() => props.records[props.currentIndex]);

const flowStatusMap: Record<number, string> = {
  [FlowStatus.Draft]: "draft",
  [FlowStatus.Approving]: "approving",
  [FlowStatus.Approved]: "approved",
  [FlowStatus.Rejected]: "rejected",
  [FlowStatus.Suspended]: "suspended",
  [FlowStatus.Discarded]: "discarded",
};

const close = () => {
  emit("update:modelValue", false);
};

const changeIndex = (index: number) => {
  emit("change-index", index);
};

const openRawData = () => {
  if (!currentRecord.value) {
    return;
  }
  emit("open-raw", currentRecord.value);
};

const getFieldValue = (record: FormData, field: IFormFieldDef) => {
  if (isSystemField(field.field)) {
    return (record as any)[field.field];
  }

  if (field.isSubField) {
    const [parentField, childField] = field.field.split(">");
    const rows = record.data?.[parentField];
    if (!Array.isArray(rows)) {
      return undefined;
    }

    return rows.map((row: any) => row?.[childField]).filter((item) => item !== undefined && item !== null && item !== "");
  }

  return record.data?.[field.field];
};

const getDisplayValue = (record: FormData, field: IFormFieldDef) => {
  const value = getFieldValue(record, field);
  if (field.field === SystemField.FlowStatus) {
    const key = flowStatusMap[Number(value)];
    return key ? t(`common.flowStatus.${key}`) : String(value ?? "");
  }

  const fieldDef = props.formDef ? findFieldDef(props.formDef, field.field, t) : undefined;
  return formatFormValue(value, fieldDef || { type: field.type, format: field.format });
};
</script>

<style scoped lang="scss">
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--et-space-16);
}

.dialog-title {
  font-size: var(--et-font-size-18);
  font-weight: 700;
  color: var(--et-text-primary);
}

.dialog-nav {
  display: inline-flex;
  align-items: center;
  gap: var(--et-space-8);
  color: var(--et-text-secondary);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--et-space-20) var(--et-space-24);
  min-height: 320px;
  align-content: start;
}

.preview-field {
  min-width: 0;
}

.field-label {
  margin-bottom: var(--et-space-8);
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-14);
  font-weight: 600;
}

.field-value {
  min-height: 40px;
  padding: var(--et-space-10) var(--et-space-12);
  background: var(--el-fill-color-light);
  color: var(--et-text-primary);
  word-break: break-word;
}

.dialog-footer {
  display: flex;
  justify-content: center;
}
</style>
