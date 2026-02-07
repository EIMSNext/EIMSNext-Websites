<!-- 用户管理 -->
<template>
  <div class="dept-manager-container">
    <div class="main-row">
      <!-- 部门树 -->
      <div class="dept-tree-col">
        <div class="org-menu">员工</div>
        <div class="menu-items">
          <el-radio-group v-model="empStatus" @change="handleStatusChanged">
            <el-radio :label="0">在职员工</el-radio>
            <el-radio :label="1">离职员工</el-radio>
          </el-radio-group>
        </div>
        <div class="org-menu">部门</div>
        <div class="dept-tree-wrapper">
          <dept-tree :editable="true" @node-click="handleDeptChanged" />
        </div>
      </div>
      <!-- 用户列表 -->
      <div class="emp-list-col">
        <el-card shadow="never" class="emp-list-card">
          <et-toolbar :left-group="leftBars" :right-group="rightBars" @command="toolbarHandler"></et-toolbar>
          <div class="table-container">
            <el-table ref="tableRef" v-loading="loading" :data="dataRef" show-overflow-tooltip
              :tooltip-formatter="tableToolFormatter" :row-class-name="rowClassName"
              @selection-change="selectionChanged" @row-click="edit">
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
    <AddEditEmp v-if="showAddEditDialog" :edit="editMode" :emp="selectedEmp" @cancel="showAddEditDialog = false"
      @ok="handleSaved" />
    <el-popover :visible="showFilter" :virtual-ref="filterBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataFilter :model-value="condList" formId="employee" @ok="setFilter" @cancel="showFilter = false"></DataFilter>
    </el-popover>
    <el-popover :visible="showSort" :virtual-ref="sortBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataSort :model-value="sortList" formId="employee" @ok="setSort" @cancel="showSort = false"></DataSort>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ODataQuery } from "@/utils/query";
import { DataPerms, Department, Employee, FieldType } from "@eimsnext/models";
import { SortDirection, employeeService } from "@eimsnext/services";
import buildQuery from "odata-query";
import { ToolbarItem, IConditionList, toODataQuery, IFieldSortList, EtConfirm, ConfirmResult } from "@eimsnext/components";
import { TableInstance, TableTooltipData } from "element-plus";

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
      text: "新增",
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
      text: "删除",
      type: "danger",
      command: "delete",
      visible: true,
      icon: "el-delete",
      disabled: true,
      onCommand: async () => {
        if (checkedDatas.value.length > 0) {
          var confirm = await EtConfirm.showDialog(`你当前选中了${checkedDatas.value.length}条数据，数据删除后将不可恢复`, { title: "你确定要删除所选数据吗？" })
          if (confirm == ConfirmResult.Yes) {
            await employeeService.delete("batch", { keys: checkedDatas.value.map((x) => x.id) }).then(() => {
              handleQuery();
            });
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
  let statusFilter = { status: { eq: empStatus.value } };
  let preFilter: any = statusFilter;
  if (deptHeriarchyId.value) {
    preFilter = {
      and: [statusFilter, { "department/heriarchyId": { startswith: deptHeriarchyId.value } }],
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

  // console.log("queryParams list", queryParams.value);
};

const queryParams = ref<ODataQuery<Employee>>({
  skip: 0,
  top: pageSize.value,
});

const dataRef = ref<Employee[]>();
const totalRef = ref(0);
const loading = ref(false);
const deptHeriarchyId = ref("");
const empStatus = ref(0);

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
  deptHeriarchyId.value = dept?.heriarchyId ?? "";

  updateQueryParams();
  handleQuery();
};
// 查询
const handleQuery = () => {
  loading.value = true;

  loadCount();
  loadData();
};
const rowClassName = (row: any) => {
  return "pointer";
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
      // console.log("data.....", dataRef.value);
    })
    .finally(() => (loading.value = false));
};

// 选中项发生变化
const selectionChanged = (rows: any[]) => {
  checkedDatas.value = rows;
  leftBars.value.find((x) => x.config.command == "delete")!.config.disabled =
    checkedDatas.value.length == 0;
};
const tableToolFormatter = (data: TableTooltipData<FormData>) => {
  return `${data.cellValue}`;
};

const edit = (row: Employee, column: any) => {
  if (column.type == "selection") {
    tableRef.value?.toggleRowSelection(row);
  } else {
    editMode.value = true;
    selectedEmp.value = row;
    showAddEditDialog.value = true;
  }
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

// 部门树列样式
.dept-tree-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 300px; // 设置最小宽度
  max-width: 500px; // 设置最大宽度，防止挤占员工列表
  flex-shrink: 0; // 防止被压缩
  max-height: 100%; // 确保不超过父容器高度
}

// 部门树包装器样式
.dept-tree-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  margin-top: 10px;
  background-color: #fff;
  min-height: 0;
  width: 100%;
  max-height: calc(100vh - 180px); // 设置最大高度，确保出现滚动条
  display: flex;
  flex-direction: column;

  // 确保内部元素能够触发横向滚动且不产生额外滚动条
  >* {
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

// 原始样式保留
.org-menu {
  color: #838892;
  font-size: 14px;
  height: 28px;
  line-height: 28px;

  &:not(:first-child) {
    margin-top: 10px;
  }
}

.menu-items {
  margin: 0 20px;
  font-size: 14px;
}

:deep(.data-filter) {
  margin-left: 0px;
}
</style>
