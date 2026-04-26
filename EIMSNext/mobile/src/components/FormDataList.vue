<template>
  <MobilePage :title="form?.name || '数据列表'" @back="goBack">
    <template #right>
      <van-icon name="plus" @click="goToAdd" />
    </template>

    <div class="data-page">
      <div class="table-toolbar mobile-card">
        <div class="toolbar-tip">左右滑动查看完整字段</div>
      </div>

      <div class="data-table-wrapper mobile-card">
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
        <div v-if="!loading && dataList.length === 0" class="empty-tip">暂无数据</div>
      </div>
    </div>

    <template #footer>
      <div class="pagination-wrap">
        <van-pagination v-model="currentPage" :total-items="total" :items-per-page="pageSize" mode="simple" @change="loadData" />
      </div>
    </template>
  </MobilePage>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FormData, FormDef } from "@eimsnext/models";
import MobilePage from "@/components/base/MobilePage.vue";
import { formDataServiceMobile, formServiceMobile } from "@/services/mobileService";

const router = useRouter();
const route = useRoute();
const appId = route.params.appId as string;
const formId = route.params.formId as string;

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const form = ref<FormDef>();
const dataList = ref<FormData[]>([]);
const columns = ref<{ field: string; title: string; width: number }[]>([]);

const goBack = () => router.back();
const goToAdd = () => router.push(`/app/${appId}/form/${formId}/add`);
const goToDetail = (row: FormData) => router.push(`/app/${appId}/form/${formId}/${row.id}`);

const loadForm = async () => {
  form.value = await formServiceMobile.get(formId);
  columns.value = (form.value.content?.items || []).map((item) => ({
    field: item.field,
    title: item.title,
    width: 140,
  }));
};

const loadData = async () => {
  loading.value = true;
  const skip = (currentPage.value - 1) * pageSize.value;
  const [list, count] = await Promise.all([
    formDataServiceMobile.query(formId, skip, pageSize.value),
    formDataServiceMobile.count(formId),
  ]);
  dataList.value = list;
  total.value = count;
  loading.value = false;
};

const formatCell = (row: FormData, field: string) => {
  const value = row.data?.[field];
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map((item) => item?.label || item?.name || item).join(", ");
  if (typeof value === "object") return value.label || value.name || JSON.stringify(value);
  return String(value);
};

onMounted(() => {
  void Promise.all([loadForm(), loadData()]);
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

.pagination-wrap {
  padding: 10px 16px;
}
</style>
