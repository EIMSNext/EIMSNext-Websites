<template>
  <div class="et-select-data-panel">
    <el-popover
      :visible="showFilter"
      :virtual-ref="filterBtnRef"
      virtual-triggering
      :show-arrow="false"
      :offset="0"
      placement="bottom-end"
      width="500"
      :teleported="false"
      trigger="click"
      :destroy-on-close="true"
    >
      <DataSelectFilter
        v-model="innerFilter"
        :form-id="formId"
        :fields="filterFields"
        @ok="emitFilter"
        @cancel="showFilter = false"
      />
    </el-popover>
    <div class="panel-toolbar">
      <div class="panel-toolbar-title">
        <slot name="title"></slot>
      </div>
      <div class="panel-toolbar-actions">
        <el-input v-model="keyword" clearable placeholder="搜索数据" class="panel-search">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button ref="filterBtnRef" text class="panel-filter" @click="showFilter = !showFilter">
          <el-icon><Filter /></el-icon>
          <span>筛选</span>
        </el-button>
      </div>
    </div>

    <div class="panel-table-wrap">
      <el-table
        v-loading="loading"
        :data="filteredRows"
        class="panel-table"
        height="100%"
        empty-text="暂无数据"
        @row-click="selectRow"
      >
        <el-table-column width="68" align="center">
          <template #default="scope">
            <el-radio :model-value="selectedRowKey" :value="rowKey(scope.row)" @change="selectRow(scope.row)" @click.stop="">
              <span />
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column
          v-for="field in fields"
          :key="field.field"
          :label="field.label"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="scope">
            <span>{{ getCellValue(scope.row, field.field) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="showPagination" class="panel-pagination">
      <el-pagination
        v-model:current-page="innerPage"
        v-model:page-size="innerPageSize"
        background
        layout="sizes, total, prev, pager, next"
        :page-sizes="[10, 20, 50]"
        :total="total"
        @current-change="emitPageChange"
        @size-change="emitPageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Search, Filter } from "@element-plus/icons-vue";
import type { IDataSelectField } from "../DataSelect";
import { formatDataSelectValue, resolveDataSelectValue } from "../DataSelect";
import { DataSelectFilter } from "../DataSelectFilter";
import type { IConditionList } from "../ConditionList/type";
import type { IFormFieldDef } from "../FieldSelect/type";

defineOptions({
  name: "DataSelectTablePanel",
});

const props = withDefaults(
  defineProps<{
    fields: IDataSelectField[];
    rows: Record<string, any>[];
    modelValue?: Record<string, any> | null;
    loading?: boolean;
    total?: number;
    page?: number;
    pageSize?: number;
    formId?: string;
    filter?: IConditionList;
    showPagination?: boolean;
    rowKeyField?: string;
  }>(),
  {
    fields: () => [],
    rows: () => [],
    modelValue: null,
    loading: false,
    total: 0,
    page: 1,
    pageSize: 20,
    formId: "",
    filter: () => ({ id: "", rel: "and", items: [] }),
    showPagination: true,
    rowKeyField: "id",
  },
);

const emit = defineEmits([
  "update:modelValue",
  "change",
  "pageChange",
  "pageSizeChange",
  "filter",
]);

const keyword = ref("");
const innerPage = ref(props.page);
const innerPageSize = ref(props.pageSize);
const filterBtnRef = ref();
const showFilter = ref(false);
const innerFilter = ref<IConditionList>(props.filter);

watch(
  () => props.page,
  (value) => {
    innerPage.value = value;
  },
);

watch(
  () => props.pageSize,
  (value) => {
    innerPageSize.value = value;
  },
);

watch(
  () => props.filter,
  (value) => {
    innerFilter.value = value;
  },
  { immediate: true, deep: true },
);

const filteredRows = computed(() => {
  const tokens = keyword.value
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length) {
    return props.rows;
  }

  return props.rows.filter((row) => {
    const joined = props.fields
      .map((field) => getCellValue(row, field.field))
      .join(" ");
    return tokens.every((token) => joined.includes(token));
  });
});

const rowKey = (row: Record<string, any>) => row?.[props.rowKeyField] ?? JSON.stringify(row);

const selectedRowKey = computed(() => {
  if (!props.modelValue) {
    return undefined;
  }
  return rowKey(props.modelValue);
});

const filterFields = computed<IFormFieldDef[]>(() => {
  return props.fields.map((field) => ({
    formId: props.formId,
    field: field.field,
    label: field.label,
    type: field.type,
    format: field.format,
    options: field.options,
    isSubField: field.field.includes(">"),
  }));
});

const selectRow = (row: Record<string, any>) => {
  emit("update:modelValue", row);
  emit("change", row);
};

const getCellValue = (row: Record<string, any>, field: string) => {
  const fieldDef = props.fields.find((item) => item.field === field);
  return formatDataSelectValue(resolveDataSelectValue(row, field), fieldDef) || "";
};

const emitPageChange = (page: number) => {
  emit("pageChange", page);
};

const emitPageSizeChange = (size: number) => {
  emit("pageSizeChange", size);
};

const emitFilter = (filter: IConditionList) => {
  emit("filter", filter);
  showFilter.value = false;
};
</script>

<style scoped lang="scss">
.et-select-data-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--et-border-color-light);
  border-radius: 18px;
  background: var(--et-bg-container);
  overflow: hidden;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--et-border-color-light);
  background: var(--et-bg-container);
}

.panel-toolbar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--et-text-primary);
}

.panel-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-search {
  width: 320px;
}

.panel-filter {
  color: var(--et-text-primary);
}

.panel-table-wrap {
  flex: 1;
  min-height: 0;
  padding: 0 20px 12px;
}

.panel-table {
  height: 100%;
}

.panel-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px 20px;
  border-top: 1px solid var(--et-border-color-light);
  background: var(--et-bg-container);
}

:deep(.panel-table .el-table__header-wrapper th.el-table__cell) {
  background: var(--et-fill-color-light);
}

:deep(.panel-table .el-radio) {
  margin-right: 0;
}

:deep(.panel-table .el-radio__label) {
  display: none;
}
</style>
