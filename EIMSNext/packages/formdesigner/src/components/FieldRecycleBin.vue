<template>
  <el-drawer
    :model-value="modelValue"
    size="100%"
    direction="rtl"
    :append-to-body="false"
    :with-header="false"
    modal-class="_fc-field-recycle-overlay"
    class="_fc-field-recycle-drawer"
    @close="emit('update:modelValue', false)"
  >
    <div class="_fc-field-recycle">
      <header class="_fc-field-recycle-header">
        <strong>{{ t("designer.fieldRecycle.title") }}</strong>
        <el-button
          text
          circle
          :title="t('designer.fieldRecycle.close')"
          @click="emit('update:modelValue', false)"
        >
          <et-icon icon="el-Close" />
        </el-button>
      </header>

      <main class="_fc-field-recycle-main">
        <div class="_fc-field-recycle-panel">
          <div class="_fc-field-recycle-toolbar">
            <div class="_fc-field-recycle-batch">
              <template v-if="selectedRows.length">
                <el-button type="primary" plain :disabled="loading" @click="restoreSelected">
                  {{ t("designer.fieldRecycle.restore") }}
                </el-button>
                <el-button type="danger" plain :disabled="loading" @click="purgeSelected">
                  {{ t("designer.fieldRecycle.purge") }}
                </el-button>
              </template>
            </div>
            <el-button :disabled="loading || !logs.length" @click="emit('clear')">
              {{ t("designer.fieldRecycle.clear") }}
            </el-button>
          </div>

          <el-table
            ref="tableRef"
            :data="pageLogs"
            :row-key="rowKey"
            height="100%"
            class="_fc-field-recycle-table"
            :empty-text="t('designer.fieldRecycle.empty')"
            @selection-change="handleSelectionChange"
            @row-mouse-enter="hoveredId = $event.fieldId"
            @row-mouse-leave="hoveredId = ''"
          >
            <el-table-column type="selection" width="38" reserve-selection />
            <el-table-column :label="t('designer.fieldRecycle.fieldName')" min-width="270">
              <template #default="{ row }">
                <span class="_fc-field-recycle-name" :title="row.fieldLabel">{{ row.fieldLabel }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="t('designer.fieldRecycle.deletedBy')" min-width="180">
              <template #default="{ row }">{{ row.deletedBy?.label || "-" }}</template>
            </el-table-column>
            <el-table-column :label="t('designer.fieldRecycle.deletedTime')" min-width="220">
              <template #default="{ row }">{{ formatTime(row.deletedTime) }}</template>
            </el-table-column>
            <el-table-column width="90" align="right">
              <template #default="{ row }">
                <div class="_fc-field-recycle-row-actions" :class="{ visible: hoveredId === row.fieldId }">
                  <el-button
                    text
                    circle
                    type="primary"
                    :title="t('designer.fieldRecycle.restore')"
                    :disabled="loading"
                    @click.stop="emit('restore', [row])"
                  >
                    <et-icon icon="el-RefreshLeft" />
                  </el-button>
                  <el-button
                    text
                    circle
                    type="danger"
                    :title="t('designer.fieldRecycle.purge')"
                    :disabled="loading"
                    @click.stop="emit('purge', [row])"
                  >
                    <et-icon icon="el-Delete" />
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <footer class="_fc-field-recycle-footer">
            <el-pagination
              v-model:page-size="pageSize"
              :page-sizes="pageSizes"
              :total="logs.length"
              layout="sizes, total"
              small
              @size-change="handlePageSizeChange"
            />
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="logs.length"
              layout="prev, pager, next"
              small
              @current-change="syncSelection"
            />
          </footer>
        </div>
      </main>
    </div>
  </el-drawer>
</template>

<script setup>
import { EtIcon } from "@eimsnext/components";
import { computed, nextTick, ref, watch } from "vue";

const props = defineProps({
  modelValue: Boolean,
  logs: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
  t: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "restore", "purge", "clear"]);
const pageSizes = [20, 50, 100];
const pageSize = ref(pageSizes[0]);
const currentPage = ref(1);
const tableRef = ref();
const selectedIds = ref(new Set());
const hoveredId = ref("");
let syncing = false;

const pageLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return props.logs.slice(start, start + pageSize.value);
});
const selectedRows = computed(() => props.logs.filter((row) => selectedIds.value.has(row.fieldId)));
const rowKey = (row) => row.fieldId;

watch(
  () => props.logs,
  () => {
    const existing = new Set(props.logs.map((row) => row.fieldId));
    selectedIds.value = new Set([...selectedIds.value].filter((id) => existing.has(id)));
    const maxPage = Math.max(1, Math.ceil(props.logs.length / pageSize.value));
    currentPage.value = Math.min(currentPage.value, maxPage);
    syncSelection();
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) syncSelection();
  }
);

function handleSelectionChange(rows) {
  if (syncing) return;
  const next = new Set(selectedIds.value);
  pageLogs.value.forEach((row) => next.delete(row.fieldId));
  rows.forEach((row) => next.add(row.fieldId));
  selectedIds.value = next;
}

function syncSelection() {
  nextTick(() => {
    if (!tableRef.value) return;
    syncing = true;
    tableRef.value.clearSelection();
    pageLogs.value.forEach((row) => {
      if (selectedIds.value.has(row.fieldId)) tableRef.value.toggleRowSelection(row, true);
    });
    syncing = false;
  });
}

function restoreSelected() {
  emit("restore", selectedRows.value);
}

function purgeSelected() {
  emit("purge", selectedRows.value);
}

function handlePageSizeChange() {
  currentPage.value = 1;
  syncSelection();
}

function formatTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
</script>

<style>
._fc-field-recycle-overlay {
  position: absolute !important;
}

._fc-field-recycle-drawer {
  --el-drawer-padding-primary: 0;
}

._fc-field-recycle-drawer .el-drawer__body {
  padding: 0;
  overflow: hidden;
}

._fc-field-recycle {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color-page);
}

._fc-field-recycle-header {
  position: relative;
  display: flex;
  flex: 0 0 60px;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  font-size: 18px;
}

._fc-field-recycle-header .el-button {
  position: absolute;
  right: 20px;
}

._fc-field-recycle-main {
  flex: 1;
  min-height: 0;
  padding: 16px 0 28px;
}

._fc-field-recycle-panel {
  display: flex;
  flex-direction: column;
  width: min(960px, calc(100% - 48px));
  height: 100%;
  margin: 0 auto;
  background: var(--el-bg-color);
}

._fc-field-recycle-toolbar {
  display: flex;
  flex: 0 0 52px;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}

._fc-field-recycle-batch {
  display: flex;
  min-width: 180px;
}

._fc-field-recycle-table {
  flex: 1;
  min-height: 0;
}

._fc-field-recycle-table .el-table__header-wrapper th.el-table__cell {
  background: var(--el-fill-color-light);
}

._fc-field-recycle-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

._fc-field-recycle-row-actions {
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.15s ease;
}

._fc-field-recycle-row-actions.visible {
  opacity: 1;
}

._fc-field-recycle-row-actions .el-button + .el-button {
  margin-left: 0;
}

._fc-field-recycle-footer {
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-regular);
  font-size: 14px;
}
</style>
