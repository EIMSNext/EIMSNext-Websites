<template>
  <el-drawer
    :model-value="modelValue"
    class="draft-drawer"
    direction="rtl"
    size="420px"
    destroy-on-close
    :append-to-body="true"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="draft-header">
        <div>
          <div class="draft-title">{{ title }}</div>
          <div class="draft-desc">{{ description }}</div>
        </div>
        <div class="draft-header-actions">
          <el-button @click="refresh">{{ t("common.refresh") }}</el-button>
        </div>
      </div>
    </template>

    <div class="draft-body">
      <template v-if="rows.length > 0">
        <div
          v-for="row in rows"
          :key="row.id"
          class="draft-card"
          @click="emit('select', row)"
        >
          <div class="draft-card-head">
            <div class="draft-card-title">{{ row.dataTitle || t("admin.formListView.unnamedData") }}</div>
            <el-button v-if="canDelete" link type="danger" @click.stop="emit('delete', row)">{{ t("common.delete") }}</el-button>
          </div>
          <div class="draft-card-content">
            <div
              v-for="item in previewItems(row)"
              :key="item.label"
              class="draft-card-field"
            >
              <span class="draft-card-label">{{ item.label }}:</span>
              <span class="draft-card-value">{{ item.value || "-" }}</span>
            </div>
          </div>
          <div class="draft-card-time">{{ formatDate(row.createTime) }}</div>
        </div>
      </template>
      <div v-else class="draft-empty">
        <div class="draft-empty-title">{{ emptyTitle }}</div>
        <div class="draft-empty-desc">{{ emptyDesc }}</div>
      </div>
    </div>

    <div class="draft-pagination">
      <SimplePagination
        :current-page="page"
        :page-size="pageSize"
        :has-next="hasNext"
        @change="pageChange"
      />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import { FormData, FormDef, IFieldPerm } from "@eimsnext/models";
import SimplePagination from "@/components/SimplePagination/index.vue";

type PreviewItem = {
  label: string;
  value: string;
};

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDesc: string;
  rows: FormData[];
  page: number;
  pageSize: number;
  hasNext: boolean;
  formDef: FormDef;
  fieldPerms?: IFieldPerm[];
  canDelete?: boolean;
}>(), {
  canDelete: true,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "refresh"): void;
  (e: "page-change", page: number, pageSize: number): void;
  (e: "select", row: FormData): void;
  (e: "delete", row: FormData): void;
}>();

const { t } = useI18n();

const refresh = () => emit("refresh");
const pageChange = (page: number, size: number) => emit("page-change", page, size);

const formatDate = (value?: number) => {
  if (!value) return "-";
  return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
};

const previewItems = (row: FormData): PreviewItem[] => {
  const values = row.data || {};
  const result: PreviewItem[] = [];

  for (const field of props.formDef.content?.items || []) {
    if (result.length >= 3) break;
    if (props.fieldPerms !== undefined &&
      !props.fieldPerms.some((permission) => permission.id === field.field && permission.visible)) continue;
    const value = values[field.field];
    if (value === null || value === undefined || value === "") continue;

    result.push({
      label: field.title,
      value: formatValue(value),
    });
  }

  return result;
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === "object" && "label" in item) {
          return String((item as { label?: string }).label || "");
        }
        return String(item ?? "");
      })
      .filter(Boolean)
      .join(", ");
  }
  if (value && typeof value === "object") {
    if ("label" in value) {
      return String((value as { label?: string }).label || "");
    }
    return JSON.stringify(value);
  }
  return String(value);
};
</script>

<style scoped lang="scss">
.draft-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--et-space-12);
}

.draft-title {
  color: var(--et-text-primary);
  font-size: 18px;
  font-weight: 700;
}

.draft-desc {
  margin-top: 4px;
  color: var(--et-text-secondary);
  font-size: 13px;
}

.draft-body {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
}

.draft-card {
  padding: 16px;
  border: 1px solid var(--et-border-color-light);
  border-radius: 12px;
  background: var(--et-bg-container);
  cursor: pointer;
}

.draft-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.draft-card-title {
  color: var(--et-text-primary);
  font-size: 16px;
  font-weight: 700;
}

.draft-card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.draft-card-field {
  color: var(--et-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.draft-card-label {
  margin-right: 4px;
}

.draft-card-value {
  color: var(--et-text-primary);
}

.draft-card-time {
  margin-top: 12px;
  color: var(--et-text-tertiary);
  font-size: 12px;
}

.draft-empty {
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.draft-empty-title {
  color: var(--et-text-primary);
  font-size: 18px;
  font-weight: 700;
}

.draft-empty-desc {
  margin-top: 8px;
  color: var(--et-text-secondary);
  font-size: 13px;
}

.draft-pagination {
  padding-top: 12px;
}

:deep(.draft-drawer > .el-drawer) {
  max-width: 100%;
}

:deep(.draft-drawer .el-drawer__body) {
  display: flex;
  min-height: 0;
  flex-direction: column;
  padding: 0 20px 20px;
}
</style>
