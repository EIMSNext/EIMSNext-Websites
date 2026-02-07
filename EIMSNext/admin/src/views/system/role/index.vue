<!-- 用户管理 -->
<template>
  <div class="role-manager-container">
    <div class="main-row">
      <!-- 角色树 -->
      <div class="role-tree-col">
        <role-tree :editable="true" @role-click="handleRoleQuery" />
      </div>
      <!-- 用户列表 -->
      <div class="emp-list-col">
        <el-card shadow="never" class="emp-list-card">
          <et-toolbar :left-group="leftBars" :right-group="rightBars" @command="toolbarHandler"></et-toolbar>

          <div class="table-container">
            <el-table v-loading="loading" :data="dataRef" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="40" />
              <el-table-column label="姓名" width="150" prop="empName" />
              <el-table-column label="编码" width="150" prop="code" />
              <el-table-column label="工作电话" width="150" prop="workPhone" />
              <el-table-column label="工作邮箱" width="150" prop="workEmail" />
              <el-table-column label="部门" prop="department.name" />
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
    <el-popover :visible="showFilter" :virtual-ref="filterBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataFilter :model-value="condList" formId="employee" @ok="setFilter" @cancel="showFilter = false"></DataFilter>
    </el-popover>
    <el-popover :visible="showSort" :virtual-ref="sortBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataSort :model-value="sortList" formId="employee" @ok="setSort" @cancel="showSort = false"></DataSort>
    </el-popover>
    <member-select-dialog v-model="showMemberDialog" :member-options="{ showTabs: MemberTabs.Employee }"
      destroy-on-close @ok="finishSelect" />
  </div>
</template>

<script setup lang="ts">
import { ODataQuery } from "@/utils/query";
import { DataPerms, Department, Employee, FieldType, Role } from "@eimsnext/models";
import { SortDirection, employeeService, roleService } from "@eimsnext/services";
import buildQuery from "odata-query";
import { ToolbarItem, IConditionList, toODataQuery, IFieldSortList, ISelectedTag, EtConfirm, MemberTabs, ConfirmResult } from "@eimsnext/components";

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
      field: { formId: "employee", field: "empName", label: "姓名", type: FieldType.Input },
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
      text: "添加",
      type: "success",
      command: "add",
      visible: true,
      icon: "el-plus",
      onCommand: () => {
        showMemberDialog.value = true;
      },
    },
  },
  {
    type: "button",
    config: {
      text: "移除",
      type: "danger",
      command: "delete",
      visible: true,
      icon: "el-delete",
      disabled: true,
      onCommand: async () => {
        if (checkedDatas.value.length > 0) {
          var confirm = await EtConfirm.showDialog(`你当前选中了${checkedDatas.value.length}条数据，数据删除后将不可恢复`, { title: "你确定要删除所选数据吗？" })
          if (confirm == ConfirmResult.Yes) {
            await roleService.removeEmps(roleId.value, checkedDatas.value.map(x => x.id))
              .then(() => {
                handleQuery()
              })
          }
        }
      }
    },
  },
  // { type: "button", config: { text: "导入", command: "upload", icon: "el-upload" } },
  // { type: "button", config: { text: "导出", command: "download", icon: "el-download" } }
]);

const rightBars = ref<ToolbarItem[]>([
  {
    type: "button",
    config: {
      text: "筛选",
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
      text: "排序",
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
      text: "刷新",
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
  //   console.log("sel tags", tags);
  if (tags.length > 0) {
    roleService.addEmps(roleId.value, tags.map(x => x.id)).then(() => handleQuery())
  }

  showMemberDialog.value = false;
};

const setFilter = (filter: IConditionList) => {
  condList.value = filter;
  showFilter.value = false;
  // console.log("condList", filter);

  updateQueryParams();
  handleQuery();
};

const setSort = (sort: IFieldSortList) => {
  sortList.value = sort;
  showSort.value = false;
  // console.log("sortList", sort);

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

  console.log("queryParams filter", queryParams.value.filter);
};

const queryParams = ref<ODataQuery<Employee>>({
  skip: 0,
  top: pageSize.value,
});

const dataRef = ref<Employee[]>();
const totalRef = ref(0);
const loading = ref(false);
const roleId = ref("");

const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;

  updateQueryParams();
  loadData();
};
const handleRoleQuery = (role?: Role) => {
  roleId.value = role?.id ?? "";

  updateQueryParams();
  handleQuery();
};
// 查询
const handleQuery = () => {
  if (!roleId.value) {
    totalRef.value = 0;
    dataRef.value = []
    return
  }
  loading.value = true;

  loadCount();
  loadData();
};

const loadCount = () => {
  let query = buildQuery({ filter: queryParams.value.filter });

  employeeService.count(query).then((cnt: number) => {
    totalRef.value = cnt;
  });
};
const loadData = () => {
  loading.value = true;
  let query = buildQuery(queryParams.value);

  employeeService
    .query<Employee>(query)
    .then((res: Employee[]) => {
      dataRef.value = res;
    })
    .finally(() => (loading.value = false));
};

// 选中项发生变化
const handleSelectionChange = (selection: any[]) => {
  checkedDatas.value = selection;
  leftBars.value.find((x) => x.config.command == "delete")!.config.disabled =
    checkedDatas.value.length == 0;
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

onMounted(() => {
  handleQuery();
});
</script>
<style lang="scss" scoped>
// 主容器样式
.role-manager-container {
  height: 100vh;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 700px; // 设置整个页面的最小宽度
}

// 主行样式
.main-row {
  flex: 1;
  display: flex;
  min-width: 660px; // 确保主行内容不会被压缩
  gap: 20px; // 替代el-row的gutter
}

// 角色树列样式
.role-tree-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 300px; // 设置最小宽度
  max-width: 500px; // 设置最大宽度，防止挤占员工列表
  flex-shrink: 0; // 防止被压缩
  max-height: 100%; // 确保不超过父容器高度
}

// 员工列表列样式
.emp-list-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 360px; // 设置最小宽度
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
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 10px 10px;
  box-sizing: border-box;
  //横向外层容器内居中显示
  position: absolute;
  left: 30%;
  transform: translateX(-10%);
  bottom: 0px;
}

:deep(.data-filter) {
  margin-left: 0px;
}
</style>
