<!-- 用户管理 -->
<template>
  <div>
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="6" :xs="24" class="mb-[12px]">
        <div class="org-menu">员工</div>
        <div class="menu-items">
          <el-radio-group v-model="empStatus" @change="handleStatusChanged">
            <el-radio :label="0">在职员工</el-radio>
            <el-radio :label="1">离职员工</el-radio>
          </el-radio-group>
        </div>
        <div class="org-menu">部门</div>
        <dept-tree :editable="true" @node-click="handleDeptChanged" />
      </el-col>
      <!-- 用户列表 -->
      <el-col :lg="18" :xs="24">
        <el-card shadow="never">
          <et-toolbar :left-group="leftBars" :right-group="rightBars" @command="toolbarHandler"></et-toolbar>
          <el-table ref="tableRef" v-loading="loading" :data="dataRef" show-overflow-tooltip
            :tooltip-formatter="tableToolFormatter" :row-class-name="rowClassName" @selection-change="selectionChanged"
            @row-click="edit">
            <el-table-column type="selection" width="40" />
            <el-table-column label="姓名" width="150" prop="empName" />
            <el-table-column label="编码" width="150" prop="code" />
            <el-table-column label="工作电话" width="150" prop="workPhone" />
            <el-table-column label="工作邮箱" width="150" prop="workEmail" />
            <el-table-column label="部门" prop="department.name" />
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
    <AddEditEmp v-if="showAddEditDialog" :edit="editMode" :emp="selectedEmp" @cancel="showAddEditDialog = false"
      @ok="handleSaved" />
    <et-confirm-dialog v-model="showDeleteConfirmDialog" title="你确定要删除所选数据吗？" :showNoSave="false" okText="确认"
      @ok="execDelete">
      你当前选中了{{ checkedDatas.length }}条数据，数据删除后将不可恢复
    </et-confirm-dialog>
    <el-popover :visible="showFilter" :virtual-ref="filterBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataFilter :model-value="condList" formId="employee" @ok="setFilter" @cancel="showFilter = false">
      </DataFilter>
    </el-popover>
    <el-popover :visible="showSort" :virtual-ref="sortBtnRef" :show-arrow="false" :offset="0" placement="bottom-end"
      width="500" :teleported="false" trigger="click" :destroy-on-close="true">
      <DataSort :model-value="sortList" formId="employee" @ok="setSort" @cancel="showSort = false"></DataSort>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ODataQuery } from "@/utils/query";
import { Department, Employee, FieldType } from "@eimsnext/models";
import { SortDirection, employeeService } from "@eimsnext/services";
import buildQuery from "odata-query";
import { ToolbarItem } from "@eimsnext/components";
import { IConditionList, toODataQuery } from "@/components/ConditionList/type";
import { IFieldSortList } from "@/components/FieldSortList/type";
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
const sortList = ref<IFieldSortList>({ items: [{ field: { formId: "employee", field: "empName", label: "姓名", type: FieldType.Input }, sort: SortDirection.Asc }] });

const filterBtnRef = ref();
const sortBtnRef = ref();
const checkedDatas = ref<any[]>([])
const pageNum = ref(1)
const pageSize = ref(20)

const leftBars = ref<ToolbarItem[]>([
  { type: "button", config: { text: "新增", type: "success", command: "add", icon: "el-icon-plus", onCommand: () => { editMode.value = false; showAddEditDialog.value = true; } } },
  { type: "button", config: { text: "删除", type: "danger", command: "delete", icon: "el-icon-delete", disabled: true } },
  // { type: "button", config: { text: "导入", command: "upload", icon: "el-icon-upload" } },
  // { type: "button", config: { text: "导出", command: "download", icon: "el-icon-download" } }
])

const rightBars = ref<ToolbarItem[]>([
  { type: "button", config: { text: "筛选", class: "data-filter", command: "filter", icon: "el-icon-filter", onCommand: (cmd: string, e: MouseEvent) => { filterBtnRef.value = e.currentTarget, showSort.value = false; showFilter.value = !showFilter.value; } } },
  { type: "button", config: { text: "排序", class: "data-filter", command: "sort", icon: "el-icon-sort", onCommand: (cmd: string, e: MouseEvent) => { sortBtnRef.value = e.currentTarget, showFilter.value = false; showSort.value = !showSort.value; } } },
  { type: "button", config: { text: "刷新", class: "data-filter", command: "refresh", icon: "el-icon-refresh", onCommand: () => { handleQuery() } } }
])

const toolbarHandler = (cmd: string, e: MouseEvent) => {
  switch (cmd) {
    case "delete":
      {
        if (checkedDatas.value.length > 0) {
          showDeleteConfirmDialog.value = true
        }
      }
      break;
  }
}

const setFilter = (filter: IConditionList) => {
  condList.value = filter;
  showFilter.value = false;
  // console.log("condList", filter);

  updateQueryParams()
  handleQuery();
};

const setSort = (sort: IFieldSortList) => {
  sortList.value = sort;
  showSort.value = false;
  // console.log("sortList", sort);

  updateQueryParams()
  handleQuery();
};

const updateQueryParams = () => {
  let statusFilter = { status: { eq: empStatus.value } };
  let preFilter: any = statusFilter;
  if (deptHeriarchyId.value) {
    preFilter = { and: [statusFilter, { "department/heriarchyId": { startswith: deptHeriarchyId.value } }] }
  }

  queryParams.value = toODataQuery(condList.value, sortList.value, (pageNum.value - 1) * pageSize.value, pageSize.value, preFilter)
  queryParams.value.expand = "department"

  // console.log("queryParams list", queryParams.value);
}

const queryParams = ref<ODataQuery<Employee>>({
  skip: 0,
  top: pageSize.value
});

const dataRef = ref<Employee[]>();
const totalRef = ref(0);
const loading = ref(false);
const deptHeriarchyId = ref("")
const empStatus = ref(0)

const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;

  updateQueryParams();
  loadData()
}

const handleStatusChanged = () => {
  updateQueryParams()
  handleQuery()
}

const handleDeptChanged = (dept?: Department) => {
  deptHeriarchyId.value = dept?.heriarchyId ?? ""

  updateQueryParams()
  handleQuery()
}
// 查询
const handleQuery = () => {
  loading.value = true;

  loadCount()
  loadData()
};
const rowClassName = (row: any) => {
  return "pointer"
}

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
      console.log("data.....", dataRef.value)
    })
    .finally(() => loading.value = false);
};

// 选中项发生变化
const selectionChanged = (rows: any[]) => {
  checkedDatas.value = rows
  leftBars.value.find(x => x.config.command == "delete")!.config.disabled = checkedDatas.value.length == 0
}
const tableToolFormatter = (data: TableTooltipData<FormData>) => {
  return `${data.cellValue}`;
};

const edit = (row: Employee, column: any) => {
  if (column.type == "selection") {
    tableRef.value?.toggleRowSelection(row)
  }
  else {
    editMode.value = true
    selectedEmp.value = row
    showAddEditDialog.value = true
  }
}

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
  handleQuery()
};

const execDelete = async () => {
  await employeeService.delete("batch", { keys: checkedDatas.value.map(x => x.id) })
    .then(() => {
      handleQuery()
    })
};

onMounted(() => {
  updateQueryParams()
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
  margin: 0 20px;
  font-size: 14px;
}

:deep(.data-filter) {
  margin-left: 0px;
}
</style>
