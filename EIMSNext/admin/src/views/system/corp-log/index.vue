<template>
  <div class="corp-log-container">
    <el-dialog v-model="showExportDialog" :title="$t('admin.corpLog.exportDialogTitle')" width="520px">
      <el-form label-width="90px">
        <el-form-item :label="$t('admin.exportFormat')">
          <el-radio-group v-model="exportFormat">
            <el-radio :value="ExportFormat.Csv">CSV</el-radio>
            <el-radio :value="ExportFormat.Excel">Excel</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('admin.exportColumns')">
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
        <el-button @click="showExportDialog = false">{{ $t("common.cancel") }}</el-button>
        <el-button type="primary" :loading="exporting" :disabled="exporting" @click="submitExport">{{ $t("common.confirm") }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" :title="$t('admin.corpLog.detail')" width="720px" class="log-detail-dialog">
      <div class="log-detail-meta">
        <span>{{ formatAction(detailRow?.action) }}</span>
        <span>{{ formatEntityType(detailRow?.entityType) }}</span>
        <span>{{ formatDateTime(detailRow?.createTime) }}</span>
        <span>{{ detailRow?.createBy?.label || "-" }}</span>
        <span>{{ detailRow?.clientIp || "-" }}</span>
      </div>

      <template v-if="detailChanges && detailChanges.length > 0">
        <div v-for="(item, index) in detailChanges" :key="index" class="change-row">
          <div class="change-field">{{ item.label || item.field }}</div>
          <div class="change-values">
            <span class="change-old">{{ isBatchSetting ? "—" : formatChangeValue(item.old, item.type) }}</span>
            <span class="change-arrow">→</span>
            <span class="change-new">{{ formatChangeValue(item.new, item.type) }}</span>
          </div>
        </div>
      </template>
      <pre v-else-if="detailLegacy" class="log-condition">{{ detailLegacy }}</pre>
      <div v-else class="log-empty">{{ $t("admin.corpLog.batchNoChanges") }}</div>

      <template v-if="detailRow?.dataFilter">
        <div class="log-section-title">{{ $t("admin.corpLog.operationCondition") }}</div>
        <pre class="log-condition">{{ detailRow.dataFilter }}</pre>
      </template>
    </el-dialog>

    <el-card shadow="never" class="corp-log-card">
      <el-tabs v-model="activeTab" class="corp-log-tabs" @tab-change="handleTabChange">
        <el-tab-pane :label="$t('admin.corpLog.loginTab')" name="login" />
        <el-tab-pane :label="$t('admin.corpLog.actionTab')" name="action" />
      </el-tabs>

      <div v-if="activeTab === 'login'" class="filter-panel">
        <div class="filter-grid login-grid">
          <div class="filter-item">
            <div class="filter-label">{{ $t("admin.corpLog.loginUser") }}</div>
            <el-input v-model="loginFilters.userName" clearable :placeholder="$t('admin.corpLog.loginUserPlaceholder')" />
          </div>
          <div class="filter-item range-item">
            <div class="filter-label">{{ $t("admin.corpLog.loginTime") }}</div>
            <el-date-picker v-model="loginFilters.dateRange" type="daterange" value-format="x" :start-placeholder="$t('common.date.start')"
              :end-placeholder="$t('common.date.end')" range-separator="~" clearable />
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch">{{ $t("common.search") }}</el-button>
            <el-button @click="handleReset">{{ $t("common.reset") }}</el-button>
            <el-button @click="openExportDialog">{{ $t("common.export") }}</el-button>
          </div>
        </div>
      </div>

      <div v-else class="filter-panel">
        <div class="filter-grid action-grid">
          <div class="filter-item">
            <div class="filter-label">{{ $t("admin.corpLog.entityType") }}</div>
            <el-select v-model="actionFilters.entityType" clearable :placeholder="$t('common.all')">
              <el-option :label="$t('common.all')" value="" />
              <el-option v-for="item in entityTypeOptions" :key="item" :label="formatEntityType(item)" :value="item" />
            </el-select>
          </div>
          <div class="filter-item">
            <div class="filter-label">{{ $t("admin.corpLog.actionType") }}</div>
            <el-select v-model="actionFilters.action" clearable :placeholder="$t('common.all')">
              <el-option :label="$t('common.all')" value="" />
              <el-option v-for="item in actionOptions" :key="item" :label="formatAction(item)" :value="item" />
            </el-select>
          </div>
          <div class="filter-item">
            <div class="filter-label">{{ $t("admin.corpLog.operator") }}</div>
            <el-input v-model="actionFilters.operatorName" clearable :placeholder="$t('admin.corpLog.operatorPlaceholder')" />
          </div>
          <div class="filter-item range-item">
            <div class="filter-label">{{ $t("admin.corpLog.operationTime") }}</div>
            <el-date-picker v-model="actionFilters.dateRange" type="daterange" value-format="x" :start-placeholder="$t('common.date.start')"
              :end-placeholder="$t('common.date.end')" range-separator="~" clearable />
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch">{{ $t("common.search") }}</el-button>
            <el-button @click="handleReset">{{ $t("common.reset") }}</el-button>
            <el-button @click="openExportDialog">{{ $t("common.export") }}</el-button>
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
            <el-table-column :label="$t('admin.corpLog.loginUser')" min-width="160">
              <template #default="scope">
                {{ scope.row.createBy?.label || scope.row.userName || "-" }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.corpLog.loginTime')" min-width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.corpLog.loginId')" min-width="180">
              <template #default="scope">
                {{ scope.row.loginId || "-" }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.corpLog.failReason')" min-width="160">
              <template #default="scope">
                {{ scope.row.failReason || "-" }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.corpLog.result')" min-width="90">
              <template #default="scope">
                {{ scope.row.success ? $t("common.success") : $t("admin.corpLog.failed") }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.corpLog.grantType')" min-width="120" prop="grantType" />
            <el-table-column :label="$t('admin.corpLog.userId')" min-width="160" prop="userId" />
            <el-table-column :label="$t('admin.corpLog.clientId')" min-width="160" prop="clientId" />
            <el-table-column :label="$t('admin.corpLog.ip')" min-width="140" prop="clientIp" />
          </template>

          <template v-else>
            <el-table-column :label="$t('admin.corpLog.operator')" min-width="160">
              <template #default="scope">
                {{ scope.row.createBy?.label || "-" }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.corpLog.operationTime')" min-width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.corpLog.actionType')" min-width="110">
              <template #default="scope">
                <el-tag :type="actionTagType(scope.row.action)" size="small" effect="light" class="log-tag">
                  {{ formatAction(scope.row.action) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.corpLog.entityType')" min-width="140">
              <template #default="scope">{{ formatEntityType(scope.row.entityType) }}</template>
            </el-table-column>
            <el-table-column :label="$t('admin.corpLog.detail')" min-width="320">
              <template #default="scope">
                <div class="detail-cell">
                  <span class="detail-summary">{{ detailSummary(scope.row) }}</span>
                  <el-button link type="primary" size="small" @click="openDetail(scope.row)">
                    {{ $t("admin.misc.viewDetails") }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('admin.corpLog.ip')" min-width="140" prop="clientIp" />
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
  IdentityLoginAudit,
  IdentityLoginAuditExportRequest,
  ExportColumn,
  ExportColumnType,
  ExportFormat,
  ExportResponse,
} from "@eimsnext/models";
import { auditLogService, identityLoginAuditService } from "@eimsnext/services";
import buildQuery from "odata-query";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "CorpLog",
  inheritAttrs: false,
});

type TabType = "login" | "action";
type DateRange = [string, string] | [];
type TagType = "success" | "warning" | "danger" | "info";

interface AuditLogChange {
  field?: string;
  type?: string;
  label?: string;
  old?: unknown;
  new?: unknown;
}

type AuditLogRow = AuditLog & { dataFilter?: string };

const actionLabelKeys: Record<string, string> = {
  "1": "admin.formData.changeAdded", "2": "admin.formData.changeModified",
  "3": "admin.formData.changeDeleted", "4": "admin.corpLog.actionPhysicalDelete",
  insert: "admin.formData.changeAdded", update: "admin.formData.changeModified",
  delete: "admin.formData.changeDeleted", physicaldelete: "admin.corpLog.actionPhysicalDelete",
};
const entityTypeOptions = [
  "FormData", "FormDef", "AppDef", "Wf_Definition",
  "Wf_Task", "PrintDef", "WorkbenchRecentVisit",
  "WorkbenchConfig", "DashboardDef", "DashboardItemDef",
  "ExportLog", "Corporate", "CorporateSetting",
  "CorpOnboardingRequest",
];
const entityTypeKeySet = new Set(entityTypeOptions);

const activeTab = ref<TabType>("login");
const loading = ref(false);
const totalRef = ref(0);
const pageNum = ref(1);
const pageSize = ref(20);
const loginData = ref<IdentityLoginAudit[]>([]);
const actionData = ref<AuditLogRow[]>([]);
const actionOptions = ["1", "2", "3", "4"];
const showExportDialog = ref(false);
const exporting = ref(false);
const exportFormat = ref<ExportFormat>(ExportFormat.Csv);
const selectedExportColumnKeys = ref<string[]>([]);
const showDetailDialog = ref(false);
const detailRow = ref<AuditLogRow | null>(null);

const loginExportColumns = computed<ExportColumn[]>(() => [
  { key: "userName", header: t("admin.corpLog.loginUser"), type: ExportColumnType.String },
  { key: "createTime", header: t("admin.corpLog.loginTime"), type: ExportColumnType.Date },
  { key: "loginId", header: t("admin.corpLog.loginId"), type: ExportColumnType.String },
  { key: "failReason", header: t("admin.corpLog.failReason"), type: ExportColumnType.String },
  { key: "success", header: t("admin.corpLog.result"), type: ExportColumnType.String },
  { key: "grantType", header: t("admin.corpLog.grantType"), type: ExportColumnType.String },
  { key: "userId", header: t("admin.corpLog.userId"), type: ExportColumnType.String },
  { key: "clientId", header: t("admin.corpLog.clientId"), type: ExportColumnType.String },
  { key: "clientIp", header: t("admin.corpLog.ip"), type: ExportColumnType.String },
]);

const actionExportColumns = computed<ExportColumn[]>(() => [
  { key: "operatorName", header: t("admin.corpLog.operator"), type: ExportColumnType.String },
  { key: "createTime", header: t("admin.corpLog.operationTime"), type: ExportColumnType.Date },
  { key: "action", header: t("admin.corpLog.actionType"), type: ExportColumnType.String },
  { key: "entityType", header: t("admin.corpLog.entityType"), type: ExportColumnType.String },
  { key: "detail", header: t("admin.corpLog.detail"), type: ExportColumnType.String },
  { key: "dataFilter", header: t("admin.corpLog.operationCondition"), type: ExportColumnType.String },
  { key: "clientIp", header: t("admin.corpLog.ip"), type: ExportColumnType.String },
]);

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
  return activeTab.value === "login" ? loginExportColumns.value : actionExportColumns.value;
});

const queryParams = computed<ODataQuery<any>>(() => {
  const skip = (pageNum.value - 1) * pageSize.value;

  return {
    filter: activeTab.value === "login" ? buildLoginFilter() : buildActionFilter(),
    orderBy: "createTime desc",
    skip,
    top: pageSize.value,
    // Detail 可能超长（历史最大 118K 字符），只取展示所需列
    select:
      activeTab.value === "login"
        ? "id,userName,loginId,failReason,clientIp,createTime,createBy,success,grantType,userId,clientId"
        : "id,action,entityType,detail,dataFilter,createBy,clientIp,createTime",
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
      ? await identityLoginAuditService.count(query)
      : await auditLogService.count(query);
};

const loadData = async () => {
  loading.value = true;

  try {
    const query = buildQuery(queryParams.value);

    if (activeTab.value === "login") {
      loginData.value = await identityLoginAuditService.query<IdentityLoginAudit>(query);
    } else {
      actionData.value = await auditLogService.query<AuditLogRow>(query);
    }
  } finally {
    loading.value = false;
  }
};

const detailChanges = computed<AuditLogChange[] | null>(() => parseChanges(detailRow.value?.detail));
const detailLegacy = computed(() => {
  const text = detailRow.value?.detail?.trim() || "";
  return detailChanges.value === null && text ? text : "";
});

// 批量 ExecuteUpdate 只记录被设置的字段（old 恒 null）；用 action + old 全空判定，
// 避免把「新增」误判为批量，也不依赖 DataFilter 是否存在。
function isBatchSettingRow(row: AuditLogRow, changes: AuditLogChange[] | null) {
  const action = String(row.action ?? "").toLowerCase();
  return (
    (action === "2" || action === "update") &&
    !!changes &&
    changes.length > 0 &&
    changes.every((item) => item.old === null || item.old === undefined)
  );
}

const isBatchSetting = computed(() =>
  detailRow.value ? isBatchSettingRow(detailRow.value, detailChanges.value) : false
);

function parseChanges(detail?: string): AuditLogChange[] | null {
  const text = detail?.trim();
  if (!text || !text.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return null;
    if (parsed.length === 0) return [];
    return parsed.every(
      (item) => item && typeof item === "object" && ("label" in item || "field" in item)
    )
      ? (parsed as AuditLogChange[])
      : null;
  } catch {
    return null;
  }
}

function formatAction(action?: string) {
  if (!action) return "-";
  const key = actionLabelKeys[String(action).toLowerCase()];
  return key ? t(key) : String(action);
}

function actionTagType(action?: string): TagType {
  switch (String(action ?? "").toLowerCase()) {
    case "1":
    case "insert":
      return "success";
    case "2":
    case "update":
      return "warning";
    case "3":
    case "delete":
    case "4":
    case "physicaldelete":
      return "danger";
    default:
      return "info";
  }
}

function formatEntityType(entityType?: string) {
  if (!entityType) return "-";
  return entityTypeKeySet.has(entityType) ? t(`admin.corpLog.entityTypes.${entityType}`) : entityType;
}

function formatChangeValue(value: unknown, type?: string) {
  if (value === null || value === undefined || value === "") return t("admin.corpLog.emptyValue");
  if (type === "datetime" && typeof value === "number") {
    return dateFormat(value, "YYYY-MM-DD HH:mm:ss") || String(value);
  }
  if (type === "switch" || typeof value === "boolean") return value ? t("common.yes") : t("common.no");
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  return text.length > 300 ? `${text.slice(0, 300)}…` : text;
}

function detailSummary(row: AuditLogRow) {
  const changes = parseChanges(row.detail);
  if (changes === null) return (row.detail || "").slice(0, 60) || "-";
  if (changes.length === 0) return row.dataFilter ? t("admin.corpLog.batchConditionHint") : t("admin.corpLog.noChanges");
  // 删除/物理删除显示被删前的值，其余动作显示新值（清空的字段如实显示 (空)）
  const isDelete = ["3", "4", "delete", "physicaldelete"].includes(String(row.action ?? "").toLowerCase());
  const head = changes
    .slice(0, 2)
    .map((item) => `${item.label || item.field}: ${formatChangeValue(isDelete ? item.old : item.new, item.type)}`)
    .join(t("admin.corpLog.listSeparator"));
  const summary = changes.length > 2
    ? `${head} ${t("admin.corpLog.moreItems", { count: changes.length - 2 })}`
    : head;
  return isBatchSettingRow(row, changes) ? t("admin.corpLog.batchSetting", { summary }) : summary;
}

function openDetail(row: AuditLogRow) {
  detailRow.value = row;
  showDetailDialog.value = true;
}

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
    ElMessage.warning(t("admin.selectColumn"));
    return;
  }

  exporting.value = true;

  try {
    let result: ExportResponse;

    if (activeTab.value === "login") {
      const [startTime, endTime] = loginFilters.dateRange;
      const request: IdentityLoginAuditExportRequest = {
        format: exportFormat.value,
        columns,
        userName: loginFilters.userName || undefined,
        startTime: startTime ? Number(startTime) : undefined,
        endTime: endTime ? Number(endTime) : undefined,
      };
      result = await identityLoginAuditService.export(request);
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
      (result.isDuplicate ? t("admin.corpLog.messages.duplicateExport") : t("admin.corpLog.messages.exportCreated"))
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
  grid-template-columns: minmax(150px, 190px) minmax(150px, 190px) minmax(200px, 1fr) minmax(300px, 360px) 1fr;
}

.filter-item {
  min-width: 0;
}

.range-item {
  :deep(.el-date-editor) {
    width: 100%;
  }
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

.log-tag {
  border-radius: 6px;
}

.detail-cell {
  align-items: center;
  display: flex;
  gap: var(--et-space-8);
  min-width: 0;
}

.detail-summary {
  color: var(--et-text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-detail-meta {
  color: var(--et-text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: var(--et-space-16);
  margin-bottom: var(--et-space-16);
}

.change-row {
  border-bottom: 1px solid var(--et-bg-page);
  display: flex;
  gap: var(--et-space-16);
  padding: var(--et-space-8) 0;
}

.change-field {
  color: var(--et-text-primary);
  flex: 0 0 140px;
  font-weight: 600;
  word-break: break-all;
}

.change-values {
  align-items: center;
  display: flex;
  flex: 1;
  gap: var(--et-space-8);
  min-width: 0;
  word-break: break-all;
}

.change-old {
  color: var(--et-text-secondary);
  text-decoration: line-through;
}

.change-new {
  color: var(--et-color-primary);
}

.change-arrow {
  color: var(--et-text-secondary);
  flex-shrink: 0;
}

.log-section-title {
  color: var(--et-text-primary);
  font-weight: 600;
  margin: var(--et-space-16) 0 var(--et-space-8);
}

.log-condition {
  background: var(--et-bg-page);
  border-radius: var(--et-radius-8);
  color: var(--et-text-primary);
  font-family: inherit;
  margin: 0;
  max-height: 200px;
  overflow: auto;
  padding: var(--et-space-12);
  white-space: pre-wrap;
  word-break: break-all;
}

.log-empty {
  color: var(--et-text-secondary);
  padding: var(--et-space-16) 0;
}

@media (max-width: 1200px) {

  .login-grid,
  .action-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: flex-start;
  }
}
</style>

