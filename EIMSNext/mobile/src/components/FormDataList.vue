<template>
  <MobilePage :title="form?.name || t('admin.formListView.dataList')" @back="goBack">
    <template #right>
      <van-icon v-if="form && !loadError && canAdd" name="plus" @click="goToAdd" />
    </template>

    <div class="data-page">
      <van-empty v-if="loadError" image="error" :description="t('admin.formData.dataNotAvailable')">
        <van-button size="small" @click="initialize">{{ t("common.retry") }}</van-button>
      </van-empty>

      <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
        <div v-if="loading && dataList.length === 0" class="empty-tip">{{ t("common.loading") }}</div>
        <div class="table-toolbar mobile-card">
          <div class="toolbar-tip">{{ currentView?.name || t("admin.formListView.defaultView") }}</div>
          <van-dropdown-menu v-if="permissionGroups.length" class="auth-group-menu">
            <van-dropdown-item v-model="currentFormDataPermissionGroupId" :options="permissionGroupOptions" @change="onFormDataPermissionGroupChange" />
          </van-dropdown-menu>
        </div>

        <div v-if="mobileType === MobileFormListViewType.Table" class="data-table-wrapper mobile-card">
          <div class="table-scroll-area">
            <table class="data-table">
              <thead>
                <tr>
                  <th v-for="col in columns" :key="col.field" :style="{ minWidth: `${col.width}px` }">
                    {{ col.title }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in dataList" :key="row.id" @click="goToDetail(row)">
                  <td v-for="col in columns" :key="col.field" :style="{ minWidth: `${col.width}px` }">
                    {{ formatCell(row, col.field) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!loading && dataList.length === 0" class="empty-tip">{{ t("common.noData") }}</div>
        </div>

        <div v-else class="mobile-card-list">
          <div v-for="row in dataList" :key="row.id" class="mobile-data-card mobile-card" @click="goToDetail(row)">
            <div class="card-title">{{ cardTitle(row) }}</div>
            <div class="card-fields" :class="`cols-${mobileSettings.fieldColumns || 1}`">
              <div v-for="col in columns" :key="col.field" class="card-field">
                <span class="field-label">{{ col.title }}</span>
                <span class="field-value">{{ formatCell(row, col.field) || "--" }}</span>
              </div>
            </div>
          </div>
          <div v-if="!loading && dataList.length === 0" class="empty-tip mobile-card">{{ t("common.noData") }}</div>
        </div>
      </van-pull-refresh>
    </div>

    <template v-if="!loadError && total > pageSize" #footer>
      <div class="pagination-wrap">
        <van-pagination v-model="currentPage" :total-items="total" :items-per-page="pageSize" mode="simple" @change="loadData" />
      </div>
    </template>
  </MobilePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  FieldType,
  FormDataPermissions,
  MobileFormListViewType,
  SystemField,
  type FormData,
  type FormDef,
  type FormListView,
  type FormListViewMobileSettings,
  type FormListViewSettings,
  type FormDataPermissionGroup,
} from "@eimsnext/models";
import MobilePage from "@/components/base/MobilePage.vue";
import { SortDirection, type IDynamicFilter } from "@eimsnext/services";
import { FlagEnum } from "@eimsnext/utils";
import { createNonDraftFilter, formDataPermissionGroupServiceMobile, formDataServiceMobile, formServiceMobile, formListViewServiceMobile } from "@/services/mobileService";
import { formatDateValue } from "@/utils/format";
import { markErrorHandled } from "@/utils/httpFeedback";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const appId = route.params.appId as string;
const formId = route.params.formId as string;

const loading = ref(false);
const refreshing = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const form = ref<FormDef>();
const views = ref<FormListView[]>([]);
const currentView = ref<FormListView>();
const dataList = ref<FormData[]>([]);
const columns = ref<{ field: string; title: string; width: number }[]>([]);
const mobileSettings = ref<FormListViewMobileSettings>({ fieldColumns: 1 });
const loadError = ref(false);
const permissionGroups = ref<FormDataPermissionGroup[]>([]);
const currentFormDataPermissionGroupId = ref("");
const currentFormDataPermissionGroup = computed(() => permissionGroups.value.find((group) => group.id === currentFormDataPermissionGroupId.value));
const permissionGroupOptions = computed(() => permissionGroups.value.map((group) => ({ text: group.name, value: group.id })));
const canAdd = computed(() => !currentFormDataPermissionGroup.value || FlagEnum.has(currentFormDataPermissionGroup.value.formDataPermissions, FormDataPermissions.AddNew));

const goBack = () => router.back();
const permissionGroupQuery = () => currentFormDataPermissionGroupId.value ? { permissionGroupId: currentFormDataPermissionGroupId.value } : undefined;
const goToAdd = () => router.push({ path: `/app/${appId}/form/${formId}/add`, query: permissionGroupQuery() });
const goToDetail = (row: FormData) => router.push({ path: `/app/${appId}/form/${formId}/${row.id}`, query: permissionGroupQuery() });
const onFormDataPermissionGroupChange = async () => {
  currentPage.value = 1;
  await loadData();
};
const mobileType = computed(() => currentView.value?.mobileType || MobileFormListViewType.Table);

const loadForm = async () => {
  form.value = await formServiceMobile.get(formId);
  permissionGroups.value = await formDataPermissionGroupServiceMobile.getAssigned(formId);
  currentFormDataPermissionGroupId.value = permissionGroups.value[0]?.id || "";
  views.value = await formListViewServiceMobile.query(formId);
  currentView.value = views.value[0];
  const settings = parseSettings(currentView.value?.settings);
  mobileSettings.value = settings.mobile || { fieldColumns: 1 };
  const configuredFields = mobileSettings.value.displayFields || [];
  columns.value = (configuredFields.length > 0 ? configuredFields : (form.value.content?.items || []).map((item) => ({
    field: item.field,
    title: item.title,
    label: item.title,
    type: item.type,
  }))).map((item) => ({
    field: item.field,
    title: "title" in item ? item.title : item.label,
    width: 140,
  }));
};

const loadData = async () => {
  loading.value = true;
  try {
    const skip = (currentPage.value - 1) * pageSize.value;
    const filter = buildFilter();
    const sort = buildSort();
    const [list, count] = await Promise.all([
      formDataServiceMobile.query(formId, skip, pageSize.value, filter, sort, currentFormDataPermissionGroupId.value || undefined),
      formDataServiceMobile.count(formId, filter, currentFormDataPermissionGroupId.value || undefined),
    ]);
    dataList.value = list;
    total.value = count;
  } catch (error) {
    markErrorHandled(error);
    loadError.value = true;
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

const onRefresh = () => {
  currentPage.value = 1;
  void loadData();
};

const initialize = async () => {
  loadError.value = false;
  try {
    await loadForm();
    await loadData();
  } catch (error) {
    markErrorHandled(error);
    loadError.value = true;
  }
};

const normalizeValue = (value: any): any => {
  if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
    return value.map((item) => (Array.isArray(item) && item.length > 0 ? item[0] : item));
  }
  return value;
};

// 与 PC admin/src/views/form/listViewUtils.ts::formatFormValue 对齐：
// 下拉/单选/多选/人员/部门按 options 或对象 label 解析，日期尊重字段配置格式
const formatOption = (fieldDef: any, item: any): string => {
  if (item === undefined || item === null || item === "") return "";
  if (typeof item === "object") {
    if (item.label || item.name) return String(item.label || item.name);
    item = item.value;
  }
  const options = fieldDef?.props?.options;
  const option = options?.find((candidate: any) => String(candidate.value) === String(item));
  return option?.label ?? String(item);
};

const formatCell = (row: FormData, field: string) => {
  if (field === SystemField.DataTitle) return row.dataTitle || "";
  const value = row.data?.[field];
  if (value === null || value === undefined || value === "") return "";
  const fieldDef = form.value?.content?.items?.find((item) => item.field === field);
  const normalized = normalizeValue(value);
  const type = fieldDef?.type;
  const options = fieldDef?.props?.options;

  // 地址：province + city + district + detail 直接拼接（与打印一致）
  if (type === FieldType.Address) {
    if (normalized && typeof normalized === "object" && !Array.isArray(normalized)) {
      const addr = normalized as Record<string, any>;
      return ["province", "city", "district", "detail"].map((key) => String(addr[key] ?? "").trim()).join("");
    }
    if (Array.isArray(normalized)) return normalized.map((item: any) => String(item ?? "").trim()).filter(Boolean).join("");
    return String(normalized);
  }
  if (type === FieldType.TimeStamp) return formatDateValue(value, fieldDef?.props?.format);
  if (type === FieldType.ImageUpload) return imageText(value);
  // 数据关联（dataselect）：数组项形如 { label, name, value }
  if (type === FieldType.DataSelect && Array.isArray(normalized)) {
    return normalized
      .map((item: any) => {
        if (!item || typeof item !== "object") return String(item ?? "");
        const label = item.label || item.name || "";
        const itemValue = item.value ?? "";
        return label ? `${label}: ${itemValue}` : String(itemValue);
      })
      .filter(Boolean)
      .join("; ");
  }
  if (
    type === FieldType.Radio ||
    type === FieldType.CheckBox ||
    type === FieldType.Select1 ||
    type === FieldType.Select2 ||
    type === FieldType.Employee1 ||
    type === FieldType.Employee2 ||
    type === FieldType.Department1 ||
    type === FieldType.Department2
  ) {
    if (Array.isArray(normalized)) return normalized.map((item) => formatOption(fieldDef, item)).filter(Boolean).join(", ");
    return formatOption(fieldDef, normalized);
  }
  if (Array.isArray(normalized)) {
    return normalized
      .map((item) => (Array.isArray(item) ? item.map((sub) => formatOption(fieldDef, sub)).join(", ") : formatOption({ props: { options } }, item)))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof normalized === "object") {
    return normalized.label || normalized.name || normalized.value || JSON.stringify(normalized);
  }
  return String(normalized);
};

const cardTitle = (row: FormData) => {
  const titleField = mobileSettings.value.titleField || SystemField.DataTitle;
  return titleField === SystemField.DataTitle ? row.dataTitle || "-" : formatCell(row, titleField) || "-";
};

const parseSettings = (value?: string): FormListViewSettings => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

// 与 PC 列表一致：始终排除草稿数据
const buildFilter = () => {
  const nonDraft = createNonDraftFilter(formId);
  if (!currentView.value?.defaultFilter) return nonDraft;
  try {
    const viewFilter = JSON.parse(currentView.value.defaultFilter);
    return { rel: "and", items: [...(nonDraft.items || []), toDynamicFilter(viewFilter)] };
  } catch {
    return nonDraft;
  }
};

const buildSort = () => {
  if (!currentView.value?.defaultSort) return [{ field: "createTime", type: "timestamp", dir: SortDirection.Desc }];
  try {
    const sort = JSON.parse(currentView.value.defaultSort);
    return (sort.items || []).map((item: any) => ({
      field: isSystemField(item.field.field) ? item.field.field : `data.${item.field.field}`,
      type: item.field.type,
      dir: item.sort,
    }));
  } catch {
    return [{ field: "createTime", type: "timestamp", dir: SortDirection.Desc }];
  }
};

const isSystemField = (field: string) => Object.values(SystemField).includes(field as SystemField);

const toDynamicFilter = (filter: any): IDynamicFilter => {  if (filter.items?.length) {
    return { rel: filter.rel || "and", items: filter.items.map(toDynamicFilter) };
  }
  if (!filter.field?.field) return {};
  return {
    field: isSystemField(filter.field.field) ? filter.field.field : `data.${filter.field.field}`,
    type: filter.field.type,
    op: filter.op,
    value: filter.value?.value,
  };
};

const imageText = (value: any) => {
  if (Array.isArray(value)) return t("admin.formListView.imageCount", { count: value.length });
  return value ? t("admin.formListView.imageCount", { count: 1 }) : "";
};

onMounted(() => {
  void initialize();
});
</script>

<style scoped lang="scss">
.data-page {
  padding: 12px;
}

.table-toolbar {
  margin-bottom: 12px;
}

.toolbar-tip {
  color: var(--mobile-text-secondary);
  font-size: 12px;
}

.data-table-wrapper {
  overflow: hidden;
  padding: 0;
}

.table-scroll-area {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border-bottom: 1px solid var(--mobile-border-color);
    padding: 12px 10px;
    text-align: left;
    white-space: nowrap;
    font-size: 13px;
  }

  th {
    position: sticky;
    top: 0;
    background: var(--mobile-bg-card);
    color: var(--mobile-text-secondary);
    z-index: 1;
  }

  td {
    color: var(--mobile-text-primary);
  }

  tbody tr {
    cursor: pointer;

    &:active {
      background: var(--mobile-bg-page);
    }
  }
}

.empty-tip {
  padding: 36px 0;
  text-align: center;
  color: var(--mobile-text-tertiary);
}

.mobile-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-data-card {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--mobile-border-color);
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}

.card-title {
  color: var(--mobile-text-primary);
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
}

.card-fields {
  display: grid;
  gap: 8px 12px;

  &.cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &.cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.card-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-label {
  color: var(--mobile-text-tertiary);
  font-size: 12px;
}

.field-value {
  color: var(--mobile-text-primary);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-wrap {
  padding: 10px 16px;
}
</style>
