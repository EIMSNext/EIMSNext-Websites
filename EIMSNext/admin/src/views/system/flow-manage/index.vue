<template>
  <div class="flow-manage-container">
    <el-dialog v-model="showApproverDialog" :title="$t('admin.flowManage.changeApprover')" width="520px" destroy-on-close>
      <member-select-dialog
        v-model="showMemberDialog"
        :tags="selectedApproverTags"
        :member-options="memberOptions"
        destroy-on-close
        @ok="handleMemberSelected"
      />
      <div class="dialog-body">
        <selected-tags
          v-model="selectedApproverTags"
          :editable="true"
          :multiple="false"
          :empty-text="$t('admin.flowManage.selectApprover')"
          @editTag="showMemberDialog = true"
        />
        <el-input v-model="changeComment" type="textarea" :rows="4" :placeholder="$t('admin.flowManage.changeComment')" />
      </div>
      <template #footer>
        <el-button @click="closeApproverDialog">{{ $t("common.cancel") }}</el-button>
        <el-button type="primary" :loading="actionLoading" @click="submitChangeApprover">{{ $t("common.ok") }}</el-button>
      </template>
    </el-dialog>

    <el-card shadow="never" class="flow-manage-card">
      <div class="toolbar-row">
        <div class="toolbar-actions">
          <el-button :disabled="checkedRows.length === 0 || actionLoading" @click="handleTerminate">
            <et-icon icon="circle-close" />
            {{ $t("admin.flowManage.terminate") }}
          </el-button>
          <el-button :disabled="checkedRows.length === 0 || actionLoading" @click="openApproverDialog">
            <et-icon icon="edit-pen" />
            {{ $t("admin.flowManage.changeApprover") }}
          </el-button>
        </div>
        <div class="toolbar-search">
          <el-input
            v-model="keyword"
            clearable
            :placeholder="$t('admin.flowManage.searchPlaceholder')"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <et-icon icon="el-search" />
              </el-button>
            </template>
          </el-input>
        </div>
      </div>

      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="tableData"
          height="100%"
          class="flow-manage-table"
          show-overflow-tooltip
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="52" reserve-selection :selectable="() => true" />
          <el-table-column :label="$t('admin.status')" min-width="100">
            <template #default>
              <span class="status-running">{{ $t("admin.flowManage.inProgress") }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('admin.flowManage.dataId')" min-width="180" prop="dataId" />
          <el-table-column :label="$t('admin.flowManage.formName')" min-width="180" prop="formName" />
          <el-table-column :label="$t('admin.flowManage.applicant')" min-width="120">
            <template #default="scope">{{ scope.row.starter?.label || "-" }}</template>
          </el-table-column>
          <el-table-column :label="$t('admin.flowManage.currentApprover')" min-width="140" prop="currentApproverName" />
          <el-table-column :label="$t('admin.flowManage.department')" min-width="180" prop="departmentName" />
          <el-table-column :label="$t('admin.flowManage.currentNode')" min-width="160" prop="approveNodeName" />
          <el-table-column :label="$t('admin.flowManage.nodeArrivalTime')" min-width="180">
            <template #default="scope">{{ formatDateTime(scope.row.approveNodeStartTime) }}</template>
          </el-table-column>
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
import { FlowManageTodoItem } from "@eimsnext/models";
import { workflowService } from "@eimsnext/services";
import { DataItemType, ISelectedTag, MemberSelectDialog, MemberTabs, SelectedTags } from "@eimsnext/components";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "FlowManage",
  inheritAttrs: false,
});

const loading = ref(false);
const actionLoading = ref(false);
const keyword = ref("");
const pageNum = ref(1);
const pageSize = ref(20);
const totalRef = ref(0);
const tableData = ref<FlowManageTodoItem[]>([]);
const checkedRows = ref<FlowManageTodoItem[]>([]);
const showApproverDialog = ref(false);
const showMemberDialog = ref(false);
const selectedApproverTags = ref<ISelectedTag[]>([]);
const changeComment = ref("");

const memberOptions = computed(() => ({
  multiple: false,
  showTabs: MemberTabs.Employee,
}));

const formatDateTime = (value?: number) => dateFormat(value, "YYYY-MM-DD HH:mm:ss") || "-";

const handleQuery = async () => {
  loading.value = true;
  try {
    const result = await workflowService.queryManageTodos({
      keyword: keyword.value.trim(),
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    });
    tableData.value = result.items || [];
    totalRef.value = result.total || 0;
    checkedRows.value = checkedRows.value.filter((checked) =>
      tableData.value.some(
        (item) => item.wfInstanceId === checked.wfInstanceId && item.approveNodeId === checked.approveNodeId
      )
    );
  } finally {
    loading.value = false;
  }
};

const handleSearch = async () => {
  pageNum.value = 1;
  await handleQuery();
};

const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;
  handleQuery();
};

const handleSelectionChange = (rows: FlowManageTodoItem[]) => {
  checkedRows.value = rows;
};

const handleTerminate = async () => {
  if (checkedRows.value.length === 0) {
    return;
  }

  await ElMessageBox.confirm(t("admin.flowManage.confirmTerminate", { count: checkedRows.value.length }), t("admin.flowManage.terminate"), {
    type: "warning",
    confirmButtonText: t("common.ok"),
    cancelButtonText: t("common.cancel"),
  });

  actionLoading.value = true;
  try {
    await Promise.all(
      checkedRows.value.map((row) =>
        workflowService.terminate({
          wfInstanceId: row.wfInstanceId,
          dataId: row.dataId,
        })
      )
    );
    ElMessage.success(t("admin.flowManage.terminateSuccess"));
    checkedRows.value = [];
    await handleQuery();
  } finally {
    actionLoading.value = false;
  }
};

const openApproverDialog = () => {
  if (checkedRows.value.length === 0) {
    return;
  }

  selectedApproverTags.value = [];
  changeComment.value = "";
  showApproverDialog.value = true;
  showMemberDialog.value = true;
};

const closeApproverDialog = () => {
  showApproverDialog.value = false;
  showMemberDialog.value = false;
  selectedApproverTags.value = [];
  changeComment.value = "";
};

const handleMemberSelected = (tags: ISelectedTag[]) => {
  selectedApproverTags.value = tags.filter((tag) => tag.type === DataItemType.Employee).slice(0, 1);
  showMemberDialog.value = false;
};

const submitChangeApprover = async () => {
  if (checkedRows.value.length === 0) {
    return;
  }

  const targetEmployeeId = selectedApproverTags.value[0]?.id;
  if (!targetEmployeeId) {
    ElMessage.warning(t("admin.flowManage.selectNewApprover"));
    return;
  }

  actionLoading.value = true;
  try {
    await Promise.all(
      checkedRows.value.map((row) =>
        workflowService.changeApprover({
          wfInstanceId: row.wfInstanceId,
          dataId: row.dataId,
          wfNodeId: row.approveNodeId,
          targetEmployeeId,
          comment: changeComment.value.trim(),
        })
      )
    );
    ElMessage.success(t("admin.flowManage.approverUpdated"));
    closeApproverDialog();
    checkedRows.value = [];
    await handleQuery();
  } finally {
    actionLoading.value = false;
  }
};

onMounted(() => {
  handleQuery();
});
</script>

<style scoped lang="scss">
.flow-manage-container {
  background: var(--et-bg-page);
  box-sizing: border-box;
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.flow-manage-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;

  :deep(.el-card__body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--et-space-16);
    min-height: 0;
  }
}

.toolbar-row {
  align-items: center;
  display: flex;
  gap: var(--et-space-16);
  justify-content: space-between;
}

.toolbar-actions {
  display: flex;
  gap: var(--et-space-12);
}

.toolbar-search {
  max-width: 320px;
  width: 100%;
}

.table-container {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.flow-manage-table {
  flex: 1;
  min-height: 0;
}

.flow-manage-card :deep(.el-table),
.flow-manage-card :deep(.el-table__inner-wrapper) {
  height: 100%;
}

.status-running {
  color: var(--et-color-primary);
  font-weight: 600;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-16);
}

@media (max-width: 960px) {
  .toolbar-row {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions {
    flex-wrap: wrap;
  }

  .toolbar-search {
    max-width: none;
  }
}
</style>
