<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left" @click="goBack">
        <van-icon name="arrow-left" />
      </div>
      <div class="header-title">{{ form?.name || '数据列表' }}</div>
      <div class="header-right">
        <van-icon name="plus" @click="goToAdd" />
      </div>
    </div>
    <div class="page-main">
      <div class="data-table-wrapper" ref="tableWrapper">
        <div class="table-scroll-area">
          <table class="data-table">
            <thead>
              <tr>
                <th
                  v-for="col in columns"
                  :key="col.field"
                  :style="{ minWidth: (col.width || 100) + 'px' }"
                >
                  {{ col.title }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in dataList"
                :key="row.id || index"
                @click="goToDetail(row)"
              >
                <td
                  v-for="col in columns"
                  :key="col.field"
                  :style="{ minWidth: (col.width || 100) + 'px' }"
                >
                  {{ formatCell(row, col.field) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <van-loading v-if="loading" class="table-loading" />
        <div v-if="!loading && dataList.length === 0" class="empty-tip">
          暂无数据
        </div>
      </div>
    </div>
    <div class="page-footer">
      <van-pagination
        v-model="currentPage"
        :total-items="total"
        :items-per-page="pageSize"
        @change="onPageChange"
        mode="simple"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormDef, FormData } from '@eimsnext/models'
import { formServiceMobile, formDataServiceMobile } from '@/services/mobileService'

const router = useRouter()
const route = useRoute()
const appId = route.params.appId as string
const formId = route.params.formId as string

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const form = ref<FormDef>()
const dataList = ref<FormData[]>([])
const columns = ref<{ field: string; title: string; width?: number }[]>([])

const goBack = () => {
  router.back()
}

const goToAdd = () => {
  router.push(`/app/${appId}/form/${formId}/add`)
}

const goToDetail = (row: FormData) => {
  router.push(`/app/${appId}/form/${formId}/${row.id}`)
}

const loadForm = async () => {
  form.value = await formServiceMobile.get(formId)
  buildColumns()
}

const buildColumns = () => {
  if (!form.value?.content?.items) return
  columns.value = form.value.content.items.map((item) => ({
    field: item.field,
    title: item.title,
    width: 100
  }))
}

const loadData = async () => {
  loading.value = true
  const skip = (currentPage.value - 1) * pageSize.value
  dataList.value = await formDataServiceMobile.query(formId, skip, pageSize.value)
  total.value = dataList.value.length
  loading.value = false
}

const formatCell = (row: any, field: string) => {
  const value = row[field]
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    return value.label || value.name || ''
  }
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'object' ? v.label || v.name : v)).join(', ')
  }
  return String(value)
}

const onPageChange = () => {
  loadData()
}

onMounted(() => {
  loadForm()
  loadData()
})
</script>

<style lang="scss" scoped>
.data-table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  height: 100%;
  position: relative;
}

.table-scroll-area {
  min-width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #ebedf0;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
  }

  th {
    background-color: #f7f8fa;
    font-weight: 500;
    color: #646566;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tbody tr {
    cursor: pointer;
    &:active {
      background-color: #f5f5f5;
    }
  }

  td {
    color: #323233;
  }
}

.table-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.empty-tip {
  padding: 40px 0;
  text-align: center;
  color: #969799;
}

.page-footer {
  padding: 8px 16px;
  background-color: #fff;
}
</style>