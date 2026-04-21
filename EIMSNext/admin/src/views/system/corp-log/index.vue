<template>
  <div class="corp-log-container">
    <el-dialog v-model="showExportDialog" title="导出日志" width="520px">
      <el-form label-width="90px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportFormat">
            <el-radio :value="ExportFormat.Csv">CSV</el-radio>
            <el-radio :value="ExportFormat.Excel">Excel</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出列">
          <el-checkbox-group v-model="selectedExportColumnKeys" class="export-column-group">
            <el-checkbox
              v-for="column in currentExportColumns"
              :key="column.key"
              :value="column.key"
            >
              {{ column.header }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" :loading="exporting" @click="submitExport">确定</el-button>
      </template>
    </el-dialog>

    <el-card shadow="never" class="corp-log-card">
      <el-tabs v-model="activeTab" class="corp-log-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="登录日志" name="login" />
        <el-tab-pane label="操作日志" name="action" />
      </el-tabs>

      <div v-if="activeTab === 'login'" class="filter-panel">
        <div class="filter-grid login-grid">
          <div class="filter-item">
            <div class="filter-label">登录人</div>
            <el-input v-model="loginFilters.userName" clearable placeholder="请输入登录人" />
          </div>
          <div class="filter-item range-item">
            <div class="filter-label">登录时间</div>
            <el-date-picker v-model="loginFilters.dateRange" type="daterange" value-format="x" start-placeholder="开始日期"
              end-placeholder="结束日期" range-separator="~" clearable />
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="openExportDialog">导出</el-button>
          </div>
        </div>
      </div>

      <div v-else class="filter-panel">
        <div class="filter-grid action-grid">
          <div class="filter-item">
            <div class="filter-label">实体类型</div>
            <el-select v-model="actionFilters.entityType" clearable placeholder="全部">
              <el-option label="全部" value="" />
              <el-option v-for="item in entityTypeOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </div>
          <div class="filter-item">
            <div class="filter-label">操作类型</div>
            <el-select v-model="actionFilters.action" clearable placeholder="全部">
              <el-option label="全部" value="" />
              <el-option v-for="item in actionOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </div>
          <div class="filter-item">
            <div class="filter-label">操作人</div>
            <el-input v-model="actionFilters.operatorName" clearable placeholder="请输入操作人" />
          </div>
          <div class="filter-item range-item action-range-item">
            <div class="filter-label">操作时间</div>
            <el-date-picker v-model="actionFilters.dateRange" type="daterange" value-format="x" start-placeholder="开始日期"
              end-placeholder="结束日期" range-separator="~" clearable />
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="openExportDialog">导出</el-button>
          </div>
        </div>
      </div>

      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="tableData"
          show-overflow-tooltip
          height="100%"
          class="corp-log-table"
        >
          <template v-if="activeTab === 'login'">
            <el-table-column label="登录人" min-width="160">
              <template #default="scope">
                {{ scope.row.createBy?.label || scope.row.userName || "-" }}
              </template>
            </el-table-column>
            <el-table-column label="登录时间" min-width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="登录标识" min-width="180">
              <template #default="scope">
                {{ scope.row.loginId || "-" }}
              </template>
            </el-table-column>
            <el-table-column label="失败原因" min-width="160">
              <template #default="scope">
                {{ scope.row.failReason || "-" }}
              </template>
            </el-table-column>
            <el-table-column label="IP" min-width="140" prop="clientIp" />
          </template>

          <template v-else>
            <el-table-column label="操作人" min-width="160">
              <template #default="scope">
                {{ scope.row.createBy?.label || "-" }}
              </template>
            </el-table-column>
            <el-table-column label="操作时间" min-width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作类型" min-width="160" prop="action" />
            <el-table-column label="实体类型" min-width="160" prop="entityType" />
            <el-table-column label="操作详情" min-width="320" prop="detail" />
            <el-table-column label="IP" min-width="140" prop="clientIp" />
          </template>
        </el-table>
      </div>

      <div class="pagination-container">
        <pagination :total="totalRef" :pageSize="pageSize" @change="pageChanged" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { dateFormat } from "@/utils/common";
import type { ODataQuery } from "@/utils/query";
import {
  AuditLog,
  AuditLogExportRequest,
  AuditLogin,
  AuditLoginExportRequest,
  ExportColumn,
  ExportColumnType,
  ExportFormat,
  ExportResponse,
} from "@eimsnext/models";
import { auditLogService, auditLoginService } from "@eimsnext/services";
import buildQuery from "odata-query";

defineOptions({
  name: "CorpLog",
  inheritAttrs: false,
});

type TabType = "login" | "action";
type DateRange = [string, string] | [];

const activeTab = ref<TabType>("login");
const loading = ref(false);
const totalRef = ref(0);
const pageNum = ref(1);
const pageSize = ref(20);
const loginData = ref<AuditLogin[]>([]);
const actionData = ref<AuditLog[]>([]);
const actionOptions = ref<string[]>([]);
const entityTypeOptions = ref<string[]>([]);
const showExportDialog = ref(false);
const exporting = ref(false);
const exportFormat = ref<ExportFormat>(ExportFormat.Csv);
const selectedExportColumnKeys = ref<string[]>([]);

const loginExportColumns: ExportColumn[] = [
  { key: "userName", header: "登录人", type: ExportColumnType.String },
  { key: "createTime", header: "登录时间", type: ExportColumnType.Date },
  { key: "loginId", header: "登录标识", type: ExportColumnType.String },
  { key: "failReason", header: "失败原因", type: ExportColumnType.String },
  { key: "clientIp", header: "IP", type: ExportColumnType.String },
];

const actionExportColumns: ExportColumn[] = [
  { key: "operatorName", header: "操作人", type: ExportColumnType.String },
  { key: "createTime", header: "操作时间", type: ExportColumnType.Date },
  { key: "action", header: "操作类型", type: ExportColumnType.String },
  { key: "entityType", header: "实体类型", type: ExportColumnType.String },
  { key: "detail", header: "操作详情", type: ExportColumnType.String },
  { key: "clientIp", header: "IP", type: ExportColumnType.String },
];

const loginFilters = reactive({
  userName: "",
  dateRange: [] as DateRange,
});

const actionFilters = reactive({
  entityType: "",
  action: "",
  operatorName: "",
  dateRange: [] as DateRange,
});

const tableData = computed(() => {
  return activeTab.value === "login" ? loginData.value : actionData.value;
});

const currentExportColumns = computed(() => {
  return activeTab.value === "login" ? loginExportColumns : actionExportColumns;
});

const queryParams = computed<ODataQuery<any>>(() => {
  const skip = (pageNum.value - 1) * pageSize.value;

  return {
    filter: activeTab.value === "login" ? buildLoginFilter() : buildActionFilter(),
    orderBy: "createTime desc",
    skip,
    top: pageSize.value,
  };
});

function buildLoginFilter() {
  const filters: any[] = [];

  if (loginFilters.userName) {
    filters.push({ userName: { contains: loginFilters.userName } });
  }

  const [start, end] = loginFilters.dateRange;
  if (start) {
    filters.push({ createTime: { ge: Number(start) } });
  }
  if (end) {
    filters.push({ createTime: { le: Number(end) } });
  }

  return mergeFilters(filters);
}

function buildActionFilter() {
  const filters: any[] = [];

  if (actionFilters.entityType) {
    filters.push({ entityType: { eq: actionFilters.entityType } });
  }
  if (actionFilters.action) {
    filters.push({ action: { eq: actionFilters.action } });
  }
  if (actionFilters.operatorName) {
    filters.push({ "createBy/label": { contains: actionFilters.operatorName } });
  }

  const [start, end] = actionFilters.dateRange;
  if (start) {
    filters.push({ createTime: { ge: Number(start) } });
  }
  if (end) {
    filters.push({ createTime: { le: Number(end) } });
  }

  return mergeFilters(filters);
}

function mergeFilters(filters: any[]) {
  if (filters.length === 0) {
    return undefined;
  }

  if (filters.length === 1) {
    return filters[0];
  }

  return { and: filters };
}

const handleTabChange = async () => {
  pageNum.value = 1;
  totalRef.value = 0;

  if (activeTab.value === "action" && actionOptions.value.length === 0) {
    await loadActionOptions();
  }

  await handleQuery();
};

const handleSearch = async () => {
  pageNum.value = 1;
  await handleQuery();
};

const handleReset = async () => {
  if (activeTab.value === "login") {
    loginFilters.userName = "";
    loginFilters.dateRange = [];
  } else {
    actionFilters.entityType = "";
    actionFilters.action = "";
    actionFilters.operatorName = "";
    actionFilters.dateRange = [];
  }

  pageNum.value = 1;
  await handleQuery();
};

const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;
  loadData();
};

const handleQuery = async () => {
  loading.value = true;

  try {
    await Promise.all([loadCount(), loadData()]);
  } finally {
    loading.value = false;
  }
};

const loadCount = async () => {
  const query = buildQuery({ filter: queryParams.value.filter });

  totalRef.value =
    activeTab.value === "login"
      ? await auditLoginService.count(query)
      : await auditLogService.count(query);
};

const loadData = async () => {
  loading.value = true;

  try {
    const query = buildQuery(queryParams.value);

    if (activeTab.value === "login") {
      loginData.value = await auditLoginService.query<AuditLogin>(query);
    } else {
      actionData.value = await auditLogService.query<AuditLog>(query);
    }
  } finally {
    loading.value = false;
  }
};

const loadActionOptions = async () => {
  const query = buildQuery({ top: 200, orderBy: "createTime desc" });
  const items = await auditLogService.query<AuditLog>(query);

  actionOptions.value = [...new Set(items.map((item) => item.action).filter(Boolean))] as string[];
  entityTypeOptions.value = [
    ...new Set(items.map((item) => item.entityType).filter(Boolean)),
  ] as string[];
};

const formatDateTime = (value?: number) => {
  return dateFormat(value, "YYYY-MM-DD HH:mm:ss") || "-";
};

const openExportDialog = () => {
  selectedExportColumnKeys.value = currentExportColumns.value.map((item) => item.key);
  exportFormat.value = ExportFormat.Csv;
  showExportDialog.value = true;
};

const submitExport = async () => {
  const columns = currentExportColumns.value.filter((item) =>
    selectedExportColumnKeys.value.includes(item.key)
  );

  if (columns.length === 0) {
    ElMessage.warning("请至少选择一列");
    return;
  }

  exporting.value = true;

  try {
    let result: ExportResponse;

    if (activeTab.value === "login") {
      const [startTime, endTime] = loginFilters.dateRange;
      const request: AuditLoginExportRequest = {
        format: exportFormat.value,
        columns,
        userName: loginFilters.userName || undefined,
        startTime: startTime ? Number(startTime) : undefined,
        endTime: endTime ? Number(endTime) : undefined,
      };
      result = await auditLoginService.export(request);
    } else {
      const [startTime, endTime] = actionFilters.dateRange;
      const request: AuditLogExportRequest = {
        format: exportFormat.value,
        columns,
        entityType: actionFilters.entityType || undefined,
        action: actionFilters.action || undefined,
        operatorName: actionFilters.operatorName || undefined,
        startTime: startTime ? Number(startTime) : undefined,
        endTime: endTime ? Number(endTime) : undefined,
      };
      result = await auditLogService.export(request);
    }

    showExportDialog.value = false;
    ElMessage.success(
      result.message ||
      (result.isDuplicate ? "已存在相同导出任务，稍后请在消息中心或导出历史查看" : "已创建导出任务")
    );
  } finally {
    exporting.value = false;
  }
};

onMounted(async () => {
  await handleQuery();
});
</script>

<style scoped lang="scss">
.corp-log-container {
  background: var(--et-bg-page);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.corp-log-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }
}

.corp-log-tabs {
  flex-shrink: 0;

  :deep(.el-tabs__header) {
    margin-bottom: var(--et-space-16);
  }

  :deep(.el-tabs__item.is-active) {
    color: var(--et-color-primary);
    font-weight: 600;
  }
}

.filter-panel {
  background: var(--et-bg-page);
  border-radius: var(--et-radius-8);
  flex-shrink: 0;
  margin-bottom: var(--et-space-16);
  padding: var(--et-space-16);
}

.filter-grid {
  align-items: end;
  display: grid;
  gap: var(--et-space-16);
}

.login-grid {
  grid-template-columns: minmax(240px, 300px) minmax(320px, 360px) 1fr;
}

.action-grid {
  grid-template-columns: minmax(180px, 240px) minmax(180px, 240px) minmax(220px, 1fr);
}

.filter-item {
  min-width: 0;
}

.range-item {
  :deep(.el-date-editor) {
    width: 100%;
  }
}

.action-range-item {
  grid-column: span 2;
}

.filter-label {
  color: var(--et-text-primary);
  line-height: var(--et-line-height-22);
  margin-bottom: var(--et-space-8);
}

.filter-actions {
  align-items: end;
  display: flex;
  gap: var(--et-space-12);
  justify-content: flex-end;
}

.export-column-group {
  display: grid;
  gap: var(--et-space-8);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
}

.table-container {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.corp-log-table {
  flex: 1;
  min-height: 0;
}

.corp-log-card :deep(.el-table),
.corp-log-card :deep(.el-table__inner-wrapper) {
  height: 100%;
}

.pagination-container {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  margin-top: var(--et-space-8);
}

@media (max-width: 1200px) {

  .login-grid,
  .action-grid {
    grid-template-columns: 1fr;
  }

  .action-range-item {
    grid-column: span 1;
  }

  .filter-actions {
    justify-content: flex-start;
  }
}
</style>
