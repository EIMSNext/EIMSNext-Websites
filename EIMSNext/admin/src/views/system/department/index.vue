<!-- 用户管理 -->
<template>
  <div class="dept-manager-container">
    <div class="main-row">
      <!-- 部门树 -->
      <div class="dept-tree-col">
        <div class="org-menu">{{ $t("admin.department.title") }}</div>
        <div class="menu-items">
          <el-radio-group v-model="empStatus" @change="handleStatusChanged">
            <el-radio :label="0">{{ $t("admin.department.active") }}</el-radio>
            <el-radio :label="1">{{ $t("admin.department.resigned") }}</el-radio>
            <el-radio v-if="showPendingApproval" :label="2">{{ $t("admin.department.pending") }}</el-radio>
          </el-radio-group>
        </div>
        <div class="org-menu">{{ $t("admin.department.deptTitle") }}</div>
        <div class="dept-tree-wrapper">
          <dept-tree :editable="true" @node-click="handleDeptChanged" />
        </div>
      </div>
      <!-- 用户列表 -->
      <div class="emp-list-col">
        <el-card shadow="never" class="emp-list-card">
          <et-toolbar
            class="form-list-toolbar"
            :left-group="leftBars"
            :right-group="rightBars"
            @command="toolbarHandler"
          ></et-toolbar>
          <div class="table-container">
            <el-table
              ref="tableRef"
              v-loading="loading"
              :data="dataRef"
              class="data-table-full"
              show-overflow-tooltip
              :tooltip-formatter="tableToolFormatter"
              :row-class-name="rowClassName"
              @selection-change="selectionChanged"
              @row-click="edit"
            >
              <el-table-column type="selection" width="40" />
            <el-table-column :label="$t('admin.department.name')" width="150" prop="empName" />
            <el-table-column :label="$t('admin.department.code')" width="150" prop="code" />
            <el-table-column :label="$t('admin.workPhone')" width="150" prop="workPhone" />
            <el-table-column :label="$t('admin.workEmail')" width="150" prop="workEmail" />
            <el-table-column v-if="isPendingMode" :label="$t('common.edit')" fixed="right" width="160">
              <template #default="scope">
                <el-button link type="primary" @click.stop="reviewSingle(scope.row, true)">{{ $t("admin.department.approve") }}</el-button>
                <el-button link type="danger" @click.stop="reviewSingle(scope.row, false)">{{ $t("admin.department.reject") }}</el-button>
              </template>
            </el-table-column>
              <!-- <el-table-column label="操作" fixed="right" width="150">
                <template #default="scope">
                  <el-button v-hasPerm="{ needPerm: DataPerms.Edit }" type="primary" icon="edit" link size="small"> 编辑
                  </el-button>
                  <el-button v-hasPerm="{ needPerm: DataPerms.Remove }" type="danger" icon="delete" link size="small"> 删除
                  </el-button>
                </template>
</el-table-column> -->
            </el-table>
          </div>
          <div class="pagination-container">
            <pagination :total="totalRef" :pageSize="pageSize" @change="pageChanged" />
          </div>
        </el-card>
      </div>
      <div v-if="isPendingMode" class="pending-detail-col">
        <el-card shadow="never" class="pending-detail-card">
          <template v-if="selectedEmp">
            <div class="detail-title">{{ $t("admin.department.joinApplication") }}</div>
            <div class="detail-item">
              <span class="detail-label">{{ $t("admin.empName") }}</span>
              <span>{{ selectedEmp.empName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t("admin.empCode") }}</span>
              <span>{{ selectedEmp.code || "-" }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t("admin.department.phone") }}</span>
              <span>{{ selectedEmp.workPhone || "-" }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t("admin.department.email") }}</span>
              <span>{{ selectedEmp.workEmail || "-" }}</span>
            </div>
          </template>
          <el-empty v-else :description="$t('admin.department.selectPending')" />
        </el-card>
      </div>
    </div>
    <AddEditEmp
      v-if="showAddEditDialog"
      :edit="editMode"
      :emp="selectedEmp"
      @cancel="showAddEditDialog = false"
      @ok="handleSaved"
    />
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
      <DataFilter
        :model-value="condList"
        formId="employee"
        @ok="setFilter"
        @cancel="showFilter = false"
      ></DataFilter>
    </el-popover>
    <el-popover
      :visible="showSort"
      :virtual-ref="sortBtnRef"
      virtual-triggering
      :show-arrow="false"
      :offset="0"
      placement="bottom-end"
      width="500"
      :teleported="false"
      trigger="click"
      :destroy-on-close="true"
    >
      <DataSort
        :model-value="sortList"
        formId="employee"
        @ok="setSort"
        @cancel="showSort = false"
      ></DataSort>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ODataQuery } from "@/utils/query";
import { DataPerms, Department, Employee, FieldType, PlatformType } from "@eimsnext/models";
import {
  SortDirection,
  employeeService,
} from "@eimsnext/services";
import buildQuery from "odata-query";
import {
  ToolbarItem,
  IConditionList,
  toODataQuery,
  IFieldSortList,
  EtConfirm,
  ConfirmResult,
} from "@eimsnext/components";
import { useContextStore } from "@eimsnext/store";
import { ElMessage, TableInstance, TableTooltipData } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "DeptManager",
  inheritAttrs: false,
});

const tableRef = ref<TableInstance>();
const selectedEmp = ref<Employee>();
const showAddEditDialog = ref(false);
const editMode = ref(false);
const showDeleteConfirmDialog = ref(false);
const showFilter = ref(false);
const condList = ref<IConditionList>({ id: "", rel: "and" });
const showSort = ref(false);
const sortList = ref<IFieldSortList>({
  items: [
    {
      field: { formId: "employee", field: "empName", label: t("admin.department.name"), type: FieldType.Input },
      sort: SortDirection.Asc,
    },
  ],
});

const filterBtnRef = ref();
const sortBtnRef = ref();
const checkedDatas = ref<any[]>([]);
const pageNum = ref(1);
const pageSize = ref(20);

const contextStore = useContextStore();
const isPendingMode = computed(() => empStatus.value === 2);
const showPendingApproval = computed(() => contextStore.corpPlat === PlatformType.Public);

const leftBars = ref<ToolbarItem[]>([
  {
    type: "button",
    config: {
      text: t("common.addNew"),
      type: "success",
      command: "add",
      visible: true,
      icon: "el-plus",
      onCommand: () => {
        editMode.value = false;
        showAddEditDialog.value = true;
      },
    },
  },
  {
    type: "button",
    config: {
      text: t("common.delete"),
      type: "danger",
      command: "delete",
      visible: true,
      icon: "el-delete",
      disabled: true,
      onCommand: async () => {
        if (checkedDatas.value.length > 0) {
          var confirm = await EtConfirm.showDialog(
            t("common.message.deleteConfirm_Content", { 0: checkedDatas.value.length }),
            { title: t("common.message.deleteConfirm_Title") }
          );
          if (confirm == ConfirmResult.Yes) {
            await employeeService
              .delete("batch", { keys: checkedDatas.value.map((x) => x.id) })
              .then(() => {
                handleQuery();
              });
          }
        }
      },
    },
  },
  {
    type: "button",
    config: {
      text: t("admin.department.toolbar.batchApprove"),
      type: "primary",
      command: "approve",
      visible: false,
      icon: "el-select",
      disabled: true,
      onCommand: async () => {
        await reviewSelected(true);
      },
    },
  },
  {
    type: "button",
    config: {
      text: t("admin.department.toolbar.batchReject"),
      type: "danger",
      command: "reject",
      visible: false,
      icon: "el-close",
      disabled: true,
      onCommand: async () => {
        await reviewSelected(false);
      },
    },
  },
  // { type: "button", config: { text: "导入", command: "upload", icon: "el-upload" } },
  // { type: "button", config: { text: "导出", command: "download", icon: "el-download" } }
]);

const rightBars = ref<ToolbarItem[]>([
  {
    type: "button",
    config: {
      text: t("common.filter"),
      class: "data-filter",
      command: "filter",
      visible: true,
      icon: "el-filter",
      onCommand: (cmd: string, e: MouseEvent) => {
        ((filterBtnRef.value = e.currentTarget), (showSort.value = false));
        showFilter.value = !showFilter.value;
      },
    },
  },
  {
    type: "button",
    config: {
      text: t("common.sort"),
      class: "data-filter",
      command: "sort",
      visible: true,
      icon: "el-sort",
      onCommand: (cmd: string, e: MouseEvent) => {
        ((sortBtnRef.value = e.currentTarget), (showFilter.value = false));
        showSort.value = !showSort.value;
      },
    },
  },
  {
    type: "button",
    config: {
      text: t("common.refresh"),
      class: "data-filter",
      command: "refresh",
      visible: true,
      icon: "el-refresh",
      onCommand: () => {
        handleQuery();
      },
    },
  },
]);

const toolbarHandler = (cmd: string, e: MouseEvent) => {
  switch (cmd) {
    case "delete":
      {
        if (checkedDatas.value.length > 0) {
          showDeleteConfirmDialog.value = true;
        }
      }
      break;
  }
};

const setFilter = (filter: IConditionList) => {
  condList.value = filter;
  showFilter.value = false;

  updateQueryParams();
  handleQuery();
};

const setSort = (sort: IFieldSortList) => {
  sortList.value = sort;
  showSort.value = false;

  updateQueryParams();
  handleQuery();
};

const updateQueryParams = () => {
  let preFilter: any = { status: { eq: empStatus.value } };

  queryParams.value = toODataQuery(
    condList.value,
    sortList.value,
    (pageNum.value - 1) * pageSize.value,
    pageSize.value,
    preFilter
  );
};

const queryParams = ref<ODataQuery<Employee>>({
  skip: 0,
  top: pageSize.value,
});

const dataRef = ref<Employee[]>();
const totalRef = ref(0);
const loading = ref(false);
const empStatus = ref(0);
const selectedDepartmentId = ref("");

const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;

  updateQueryParams();
  loadData();
};

const handleStatusChanged = () => {
  updateQueryParams();
  handleQuery();
};

const handleDeptChanged = (dept?: Department) => {
  selectedDepartmentId.value = dept?.id ?? "";
  pageNum.value = 1;
  updateQueryParams();
  handleQuery();
};
const rowClassName = (row: any) => {
  return "pointer";
};

const loadCount = () => {
  let query = buildQuery({ filter: queryParams.value.filter });

  const request = selectedDepartmentId.value
    ? employeeService.countByDepartment(selectedDepartmentId.value, true, query)
    : employeeService.count(query);

  request.then((cnt: number) => {
    totalRef.value = cnt;
  });
};
const loadData = () => {
  loading.value = true;
  let query = buildQuery(queryParams.value);

  const request = selectedDepartmentId.value
    ? employeeService.queryByDepartment<Employee>(selectedDepartmentId.value, true, query)
    : employeeService.query<Employee>(query);

  request
    .then((res: Employee[]) => {
      dataRef.value = res;
      if (isPendingMode.value) {
        selectedEmp.value = res[0];
      }
    })
    .finally(() => (loading.value = false));
};

const handleQuery = async () => {
  loading.value = true;
  try {
    checkedDatas.value = [];
    loadCount();
    loadData();
  } finally {
    loading.value = false;
  }
};

const selectionChanged = (rows: any[]) => {
  checkedDatas.value = rows;
  const hasSelection = checkedDatas.value.length > 0;
  leftBars.value.find((x) => x.config.command == "delete")!.config.disabled = !hasSelection;
  const approveBar = leftBars.value.find((x) => x.config.command == "approve");
  const rejectBar = leftBars.value.find((x) => x.config.command == "reject");
  if (approveBar) approveBar.config.disabled = !hasSelection;
  if (rejectBar) rejectBar.config.disabled = !hasSelection;
};
const tableToolFormatter = (data: TableTooltipData<FormData>) => {
  return `${data.cellValue}`;
};

const edit = (row: Employee, column: any) => {
  if (column.type == "selection") {
    tableRef.value?.toggleRowSelection(row);
  } else {
    if (isPendingMode.value) {
      selectedEmp.value = row;
      return;
    }
    editMode.value = true;
    selectedEmp.value = row;
    showAddEditDialog.value = true;
  }
};

const reviewSingle = async (row: Employee, approved: boolean) => {
  const confirm = await EtConfirm.showDialog(
    t("admin.department.messages." + (approved ? "approveSingle" : "rejectSingle"), { name: row.empName }),
    { title: t("admin.department.messages." + (approved ? "approveTitle" : "rejectTitle")) }
  );
  if (confirm != ConfirmResult.Yes) {
    return;
  }

  await employeeService.reviewJoinCorporate({ employeeIds: [row.id], approved });
  ElMessage.success(t("admin.department.messages." + (approved ? "approveSuccess" : "rejectSuccess")));
  await handleQuery();
};

const reviewSelected = async (approved: boolean) => {
  const employeeIds = checkedDatas.value.map((x) => x.id).filter((x): x is string => !!x);

  if (!employeeIds.length) {
    ElMessage.warning(t("admin.department.selectPending"));
    return;
  }

  const confirm = await EtConfirm.showDialog(
    t("admin.department.messages." + (approved ? "batchApproveConfirm" : "batchRejectConfirm"), { count: employeeIds.length }),
    { title: t("admin.department.messages." + (approved ? "batchApproveTitle" : "batchRejectTitle")) }
  );
  if (confirm != ConfirmResult.Yes) {
    return;
  }

  await employeeService.reviewJoinCorporate({
    employeeIds,
    approved,
  });

  ElMessage.success(t("admin.department.messages." + (approved ? "batchApproveSuccess" : "batchRejectSuccess")));
  await handleQuery();
};

// 重置密码
// function hancleResetPassword(row: any) {
//   ElMessageBox.prompt("请输入用户【" + row.username + "】的新密码", "重置密码", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//   }).then(
//     ({ value }) => {
//       if (!value || value.length < 6) {
//         ElMessage.warning("密码至少需要6位字符，请重新输入");
//         return false;
//       }
//       UserAPI.resetPassword(row.id, value).then(() => {
//         ElMessage.success("密码重置成功，新密码是：" + value);
//       });
//     },
//     () => {
//       ElMessage.info("已取消重置密码");
//     }
//   );
// }

const handleSaved = (data: Employee) => {
  showAddEditDialog.value = false;
  handleQuery();
};

watch(isPendingMode, () => {
  leftBars.value.find((x) => x.config.command == "add")!.config.visible = !isPendingMode.value;
  leftBars.value.find((x) => x.config.command == "delete")!.config.visible = !isPendingMode.value;
  leftBars.value.find((x) => x.config.command == "approve")!.config.visible = isPendingMode.value;
  leftBars.value.find((x) => x.config.command == "reject")!.config.visible = isPendingMode.value;
  selectedEmp.value = undefined;
});

onMounted(() => {
  updateQueryParams();
  handleQuery();
});
</script>
<style lang="scss" scoped>
// 主容器样式
.dept-manager-container {
  height: 100vh;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 var(--et-space-8);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: var(--et-size-700); // 设置整个页面的最小宽度
}

// 主行样式
.main-row {
  flex: 1;
  display: flex;
  min-width: var(--et-size-660); // 确保主行内容不会被压缩
  gap: var(--et-space-20); // 替代el-row的gutter
}

// 部门树列样式
.dept-tree-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: var(--et-size-300); // 设置最小宽度
  max-width: var(--et-size-500); // 设置最大宽度，防止挤占员工列表
  flex-shrink: 0; // 防止被压缩
  max-height: 100%; // 确保不超过父容器高度
}

// 部门树包装器样式
.dept-tree-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  margin-top: var(--et-space-10);
  background-color: var(--et-bg-container);
  min-height: 0;
  width: 100%;
  max-height: calc(100vh - var(--et-size-180)); // 设置最大高度，确保出现滚动条
  display: flex;
  flex-direction: column;

  // 确保内部元素能够触发横向滚动且不产生额外滚动条
  > * {
    min-width: 100%;
    max-height: 100%; // 限制内部元素高度
    overflow: hidden; // 防止内部元素产生滚动条
  }
}

// 员工列表列样式
.emp-list-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: var(--et-size-360); // 设置最小宽度
  flex: 1; // 允许在有空间时扩展
}

.pending-detail-col {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.pending-detail-card {
  height: 100%;
}

// 员工列表卡片样式
.emp-list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

// 表格容器样式
.table-container {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

// 分页容器样式
.pagination-container {
  margin-top: var(--et-space-16);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 var(--et-space-10) var(--et-space-10);
  box-sizing: border-box;
  //横向外层容器内居中显示
  position: absolute;
  left: 30%;
  transform: translateX(-10%);
  bottom: var(--et-space-0);
}

// 原始样式保留
.org-menu {
  color: var(--et-text-tertiary);
  font-size: var(--et-font-size-14);
  height: var(--et-space-28);
  line-height: var(--et-space-28);

  &:not(:first-child) {
    margin-top: var(--et-space-10);
  }
}

.menu-items {
  margin: 0 var(--et-space-20);
  font-size: var(--et-font-size-14);
}

.detail-title {
  margin-bottom: var(--et-space-16);
  font-size: var(--et-font-size-16);
  font-weight: 600;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: var(--et-space-12);
  margin-bottom: var(--et-space-12);
}

.detail-label {
  color: var(--et-text-tertiary);
  flex-shrink: 0;
}

:deep(.data-filter) {
  margin-left: var(--et-space-0);
}

:deep(.form-list-toolbar .toolbar-container) {
  min-height: 42px;
  margin-bottom: var(--et-space-10);
  padding: var(--et-space-6) var(--et-space-10);
  border: 1px solid var(--el-border-color-lighter);
  border-bottom: 0;
  background: var(--el-bg-color);
}

:deep(.form-list-toolbar .left-group),
:deep(.form-list-toolbar .right-group) {
  align-items: center;
  gap: 2px;
}

:deep(.form-list-toolbar .toolbar-item.el-button),
:deep(.form-list-toolbar .toolbar-dropdown) {
  height: 32px;
  padding: 0 var(--et-space-8);
  border: 0;
  box-shadow: none;
}

:deep(.form-list-toolbar .toolbar-item.el-button:not(.el-button--primary)),
:deep(.form-list-toolbar .toolbar-dropdown) {
  background: transparent;
}

:deep(.form-list-toolbar .toolbar-item.el-button:not(.el-button--primary):not(.is-disabled):hover),
:deep(.form-list-toolbar .toolbar-dropdown:not(.is-disabled):hover) {
  background: var(--el-fill-color-light);
}

:deep(.data-table-full .el-table__header-wrapper th.el-table__cell),
:deep(.data-table-full .el-table__fixed-header-wrapper th.el-table__cell) {
  background: var(--el-fill-color-light);
}
</style>
