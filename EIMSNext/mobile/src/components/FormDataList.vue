<template>
  <MobilePage :title="form?.name || t('admin.formListView.dataList')" @back="goBack">
    <template #right>
      <van-icon v-if="form && !loadError" name="plus" @click="goToAdd" />
    </template>

    <div class="data-page">
      <van-empty v-if="loadError" image="error" :description="t('admin.formData.dataNotAvailable')">
        <van-button size="small" @click="initialize">{{ t("common.retry") }}</van-button>
      </van-empty>

      <template v-else>
        <div class="table-toolbar mobile-card">
          <div class="toolbar-tip">{{ currentView?.name || t("admin.formListView.defaultView") }}</div>
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
      </template>
    </div>

    <template #footer>
      <div v-if="!loadError" class="pagination-wrap">
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
  MobileFormListViewType,
  SystemField,
  type FormData,
  type FormDef,
  type FormListView,
  type FormListViewMobileSettings,
  type FormListViewSettings,
} from "@eimsnext/models";
import MobilePage from "@/components/base/MobilePage.vue";
import { SortDirection, type IDynamicFilter } from "@eimsnext/services";
import { formDataServiceMobile, formServiceMobile, formListViewServiceMobile } from "@/services/mobileService";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const appId = route.params.appId as string;
const formId = route.params.formId as string;

const loading = ref(false);
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

const goBack = () => router.back();
const goToAdd = () => router.push(`/app/${appId}/form/${formId}/add`);
const goToDetail = (row: FormData) => router.push(`/app/${appId}/form/${formId}/${row.id}`);
const mobileType = computed(() => currentView.value?.mobileType || MobileFormListViewType.Table);

const loadForm = async () => {
  form.value = await formServiceMobile.get(formId);
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
      formDataServiceMobile.query(formId, skip, pageSize.value, filter, sort),
      formDataServiceMobile.count(formId, filter),
    ]);
    dataList.value = list;
    total.value = count;
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};

const initialize = async () => {
  loadError.value = false;
  try {
    await loadForm();
    await loadData();
  } catch {
    loadError.value = true;
  }
};

const formatCell = (row: FormData, field: string) => {
  if (field === SystemField.DataTitle) return row.dataTitle || "";
  const value = row.data?.[field];
  if (value === null || value === undefined) return "";
  const fieldDef = form.value?.content?.items?.find((item) => item.field === field);
  if (fieldDef?.type === FieldType.TimeStamp) return formatDate(value, fieldDef.props?.format);
  if (fieldDef?.type === FieldType.ImageUpload) return imageText(value);
  if (Array.isArray(value)) return value.map((item) => item?.label || item?.name || item).join(", ");
  if (typeof value === "object") return value.label || value.name || JSON.stringify(value);
  return String(value);
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

const buildFilter = () => {
  const base: IDynamicFilter = { field: "formId", type: "none", op: "eq", value: formId };
  if (!currentView.value?.defaultFilter) return base;
  try {
    const viewFilter = JSON.parse(currentView.value.defaultFilter);
    return { rel: "and", items: [base, toDynamicFilter(viewFilter)] };
  } catch {
    return base;
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

const toDynamicFilter = (filter: any): IDynamicFilter => {
  if (filter.items?.length) {
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

const formatDate = (value: any, _format?: string) => {
  const date = new Date(Number(value));
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
    background: var(--mobile-bg-page);
    color: var(--mobile-text-secondary);
    z-index: 1;
  }

  td {
    color: var(--mobile-text-primary);
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
