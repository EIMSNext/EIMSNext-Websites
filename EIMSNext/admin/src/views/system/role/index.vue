<!-- 用户管理 -->
<template>
  <div>
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="6" :xs="24" class="mb-[12px]">
        <role-tree :editable="true" @role-click="handleRoleQuery" />
      </el-col>

      <!-- 用户列表 -->
      <el-col :lg="18" :xs="24">
        <el-card shadow="never">
          <et-toolbar :left-group="leftBars" :right-group="rightBars" @command="toolbarHandler"></et-toolbar>
          <el-table v-loading="loading" :data="dataRef" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="40" />
            <el-table-column label="姓名" width="150" prop="empName" />
            <el-table-column label="编码" width="150" prop="code" />
            <el-table-column label="工作电话" width="150" prop="workPhone" />
            <el-table-column label="工作邮箱" width="150" prop="workEmail" />
            <el-table-column label="部门" prop="departmentName" />
            <!-- <el-table-column label="操作" fixed="right" width="150">
              <template #default="scope">
                <el-button v-hasPerm="'sys:user:edit'" type="primary" icon="edit" link size="small"
                  @click="handleEditClick(scope.row)">
                  编辑
                </el-button>
                <el-button v-hasPerm="'sys:user:delete'" type="danger" icon="delete" link size="small"
                  @click="handleDeleteClick(scope.row)">
                  删除
                </el-button>
              </template>
</el-table-column> -->
          </el-table>

          <pagination :total="totalRef" :pageSize="pageSize" @change="pageChanged" />
        </el-card>
      </el-col>
    </el-row>
    <el-popover :visible="showFilter" :virtual-ref="filterBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataFilter :model-value="condList" formId="employee" @ok="setFilter" @cancel="showFilter = false"></DataFilter>
    </el-popover>
    <el-popover :visible="showSort" :virtual-ref="sortBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataSort :model-value="sortList" formId="employee" @ok="setSort" @cancel="showSort = false"></DataSort>
    </el-popover>
  </div>
  <member-select-dialog v-model="showMemberDialog" destroy-on-close @ok="finishSelect" />
</template>

<script setup lang="ts">
import { ODataQuery } from "@/utils/query";
import { Department, Employee, FieldType, Role } from "@eimsnext/models";
import { SortDirection, employeeService, roleService } from "@eimsnext/services";
import buildQuery from "odata-query";
import { ToolbarItem, IConditionList, toODataQuery, IFieldSortList, ISelectedTag } from "@eimsnext/components";

defineOptions({
  name: "RoleManager",
  inheritAttrs: false,
});

const selectedEmp = ref<Employee>();
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
      icon: "el-icon-plus",
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
      icon: "el-icon-delete",
      disabled: true,
    },
  },
  // { type: "button", config: { text: "导入", command: "upload", icon: "el-icon-upload" } },
  // { type: "button", config: { text: "导出", command: "download", icon: "el-icon-download" } }
]);

const rightBars = ref<ToolbarItem[]>([
  {
    type: "button",
    config: {
      text: "筛选",
      class: "data-filter",
      command: "filter",
      icon: "el-icon-filter",
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
      icon: "el-icon-sort",
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
      icon: "el-icon-refresh",
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
  let roleFilter = undefined;
  // if (deptId.value) {
  //   deptFilter = { departmentId: { eq: deptId.value } }
  // }
  queryParams.value = toODataQuery(
    condList.value,
    sortList.value,
    (pageNum.value - 1) * pageSize.value,
    pageSize.value,
    roleFilter
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

const handleSaved = (data: Employee) => {
  // showAddEditDialog.value = false;
  // handleQuery()
};

const execDelete = async () => {
  // await employeeService.delete("batch", { keys: checkedDatas.value.map(x => x.id) })
  //   .then(() => {
  //     handleQuery()
  //   })
};

onMounted(() => {
  handleQuery();
});
</script>
<style lang="scss" scoped>
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
  margin: 0 16px;
  font-size: 14px;

  .menu-item {
    -webkit-box-align: center;
    -ms-flex-align: center;
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    align-items: center;
    border-radius: 6px;
    color: #525967;
    cursor: pointer;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    height: 30px;
    justify-content: flex-start;
  }
}

:deep(.data-filter) {
  margin-left: 0px;
}
</style>
