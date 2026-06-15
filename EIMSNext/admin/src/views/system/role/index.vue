<!-- 用户管理 -->
<template>
  <div class="role-manager-container">
    <div class="main-row">
      <!-- 角色树 -->
      <div class="role-tree-col">
        <role-tree :editable="isUnrestrictedAdmin" admin-scope @role-click="handleRoleQuery" />
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
              v-loading="loading"
              :data="dataRef"
              class="data-table-full"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="40" />
          <el-table-column :label="$t('admin.role.name')" width="150" prop="empName" />
          <el-table-column :label="$t('admin.role.code')" width="150" prop="code" />
          <el-table-column :label="$t('admin.workPhone')" width="150" prop="workPhone" />
          <el-table-column :label="$t('admin.workEmail')" width="150" prop="workEmail" />
          <el-table-column :label="$t('admin.role.dept')" prop="department.name" />
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
    </div>
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
    <member-select-dialog
      v-model="showMemberDialog"
      :member-options="memberDialogOptions"
      destroy-on-close
      @ok="finishSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ODataQuery } from "@/utils/query";
import { AdminPermissionSnapshot, DataPerms, Department, Employee, FieldType, Role, ScopeMode, UserType } from "@eimsnext/models";
import { SortDirection, employeeService, roleService, systemService } from "@eimsnext/services";
import { useUserStore } from "@eimsnext/store";
import buildQuery from "odata-query";
import {
  ToolbarItem,
  IConditionList,
  toODataQuery,
  IFieldSortList,
  ISelectedTag,
  DataItemType,
  EtConfirm,
  MemberTabs,
  ConfirmResult,
} from "@eimsnext/components";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const userStore = useUserStore();

defineOptions({
  name: "RoleManager",
  inheritAttrs: false,
});

const showMemberDialog = ref(false);
const showDeleteConfirmDialog = ref(false);
const showFilter = ref(false);
const condList = ref<IConditionList>({ id: "", rel: "and" });
const showSort = ref(false);
const sortList = ref<IFieldSortList>({
  items: [
    {
      field: { formId: "employee", field: "empName", label: t("admin.role.name"), type: FieldType.Input },
      sort: SortDirection.Asc,
    },
  ],
});

const filterBtnRef = ref();
const sortBtnRef = ref();
const checkedDatas = ref<any[]>([]);
const pageNum = ref(1);
const pageSize = ref(20);

const leftBars = ref<ToolbarItem[]>([
  {
    type: "button",
    config: {
      text: t("common.add"),
      type: "success",
      command: "add",
      visible: true,
      icon: "el-plus",
      onCommand: () => {
        if (!canManageRoleMembers.value) return;

        showMemberDialog.value = true;
      },
    },
  },
  {
    type: "button",
    config: {
      text: t("admin.role.toolbar.remove"),
      type: "danger",
      command: "delete",
      visible: true,
      icon: "el-delete",
      disabled: true,
      onCommand: async () => {
        if (!canManageRoleMembers.value) return;

        if (checkedDatas.value.length > 0) {
          var confirm = await EtConfirm.showDialog(
            t("common.message.deleteConfirm_Content", { 0: checkedDatas.value.length }),
            { title: t("common.message.deleteConfirm_Title") }
          );
          if (confirm == ConfirmResult.Yes) {
            await roleService
              .removeEmps(
                roleId.value,
                checkedDatas.value.map((x) => x.id)
              )
              .then(() => {
                handleQuery();
              });
          }
        }
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

const finishSelect = (tags: ISelectedTag[]) => {
  if (!canManageRoleMembers.value) {
    showMemberDialog.value = false;
    return;
  }

  if (tags.length > 0) {
    roleService
      .addEmps(
        roleId.value,
        tags.map((x) => x.id)
      )
      .then(() => handleQuery());
  }

  showMemberDialog.value = false;
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
  let statusFilter = { status: { eq: 0 } };
  let preFilter: any = statusFilter;
  if (roleId.value) {
    preFilter = {
      and: [statusFilter, `roles/any(r: r/roleId eq '${roleId.value}')`],
    };
  }

  queryParams.value = toODataQuery(
    condList.value,
    sortList.value,
    (pageNum.value - 1) * pageSize.value,
    pageSize.value,
    preFilter
  );
  queryParams.value.expand = "department";
};

const queryParams = ref<ODataQuery<Employee>>({
  skip: 0,
  top: pageSize.value,
});

const dataRef = ref<Employee[]>();
const totalRef = ref(0);
const loading = ref(false);
const roleId = ref("");
const adminPermissions = ref<AdminPermissionSnapshot>();
const isUnrestrictedAdmin = computed(() =>
  [
    UserType.System,
    UserType.Client,
    UserType.CorpOwmer,
    UserType.CorpAdmin,
  ].includes(userStore.currentUser.userType),
);
const canManageCurrentRole = computed(() => {
  if (isUnrestrictedAdmin.value) return true;
  const permissions = adminPermissions.value;
  if (!roleId.value || !permissions?.isNormalAdmin) return false;
  if (permissions.contactManageRoleScopeMode === ScopeMode.All) return true;
  return permissions.contactManageRoleIds.includes(roleId.value);
});
const hasManageDepartmentScope = computed(() => {
  if (isUnrestrictedAdmin.value) return true;
  const permissions = adminPermissions.value;
  if (!permissions?.isNormalAdmin) return false;
  return permissions.contactManageDepartmentScopeMode === ScopeMode.All || permissions.contactManageDepartmentIds.length > 0;
});
const canManageRoleMembers = computed(() => canManageCurrentRole.value && hasManageDepartmentScope.value);
const canManageEmployeeDepartment = (departmentId?: string) => {
  if (isUnrestrictedAdmin.value) return true;
  const permissions = adminPermissions.value;
  if (!departmentId || !permissions?.isNormalAdmin) return false;
  if (permissions.contactManageDepartmentScopeMode === ScopeMode.All) return true;
  return permissions.contactManageDepartmentIds.includes(departmentId);
};
const managedDepartmentTags = computed<ISelectedTag[]>(() => {
  const permissions = adminPermissions.value;
  if (!permissions?.isNormalAdmin || permissions.contactManageDepartmentScopeMode !== ScopeMode.Partial) return [];
  return permissions.contactManageDepartmentIds.map((id) => ({
    id,
    label: id,
    type: DataItemType.Department,
  }));
});
const memberDialogOptions = computed(() => ({
  showTabs: MemberTabs.Employee,
  adminScope: true,
  limit: managedDepartmentTags.value.length > 0 ? { depts: managedDepartmentTags.value } : undefined,
}));
const appendAdminScope = (query: string) => query ? `${query}&adminScope=true` : "adminScope=true";

const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;

  updateQueryParams();
  loadData();
};
const syncManageToolbar = () => {
  const addBar = leftBars.value.find((x) => x.config.command == "add");
  const deleteBar = leftBars.value.find((x) => x.config.command == "delete");
  if (addBar) addBar.config.visible = canManageRoleMembers.value;
  if (deleteBar) {
    deleteBar.config.visible = canManageRoleMembers.value;
    deleteBar.config.disabled =
      !canManageRoleMembers.value ||
      checkedDatas.value.length == 0 ||
      checkedDatas.value.some((emp) => !canManageEmployeeDepartment(emp.departmentId));
  }
};
const handleRoleQuery = (role?: Role) => {
  roleId.value = role?.id ?? "";

  updateQueryParams();
  syncManageToolbar();
  handleQuery();
};
const handleQuery = () => {
  if (!roleId.value) {
    totalRef.value = 0;
    dataRef.value = [];
    return;
  }
  loading.value = true;

  syncManageToolbar();
  loadCount();
  loadData();
};

const loadCount = () => {
  let query = buildQuery({ filter: queryParams.value.filter });

  employeeService.count(appendAdminScope(query)).then((cnt: number) => {
    totalRef.value = cnt;
  });
};
const loadData = () => {
  loading.value = true;
  let query = buildQuery(queryParams.value);

  employeeService
    .query<Employee>(appendAdminScope(query))
    .then((res: Employee[]) => {
      dataRef.value = res;
    })
    .finally(() => (loading.value = false));
};

const handleSelectionChange = (selection: any[]) => {
  checkedDatas.value = selection;
  syncManageToolbar();
};

const showDetails = (row: FormData, column: any) => {
  // let selectable = row[SystemField.FlowStatus] == FlowStatus.Draft
  // if (column.type == "selection" && selectable) {
  //   tableRef.value?.toggleRowSelection(row)
  // }
  // else {
  //   selectedData.value = row
  //   showDetailsDialog.value = true
  // }
};

watch([canManageCurrentRole, hasManageDepartmentScope], () => {
  syncManageToolbar();
});

onMounted(async () => {
  adminPermissions.value = await systemService.getAdminPermissions();
  syncManageToolbar();
  handleQuery();
});
</script>
<style lang="scss" scoped>
// 主容器样式
.role-manager-container {
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

// 角色树列样式
.role-tree-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: var(--et-size-300); // 设置最小宽度
  max-width: var(--et-size-500); // 设置最大宽度，防止挤占员工列表
  flex-shrink: 0; // 防止被压缩
  max-height: 100%; // 确保不超过父容器高度
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
