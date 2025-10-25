<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="6" :xs="24" class="mb-[12px]">
        <el-tabs v-model="activeTab" style="flex: 1">
          <el-tab-pane label="组织架构" name="dept">
            <div class="org-menu">员工</div>
            <div class="menu-items">
              <div class="menu-item">
                <el-icon :size="14" color="#2f7deb">
                  <UserFilled />
                </el-icon>
                <span class="ml-5px">在职员工</span>
              </div>
              <div class="menu-item">
                <el-icon :size="14">
                  <UserFilled />
                </el-icon>
                <span class="ml-5px">离职员工</span>
              </div>
            </div>
            <div class="org-menu">部门</div>
            <dept-tree :editable="true" @node-click="handleDeptQuery" />
          </el-tab-pane>
          <el-tab-pane label="角色" name="role">
            <!-- <dept-tree :editable="true" @node-click="handleQuery" /> -->
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <!-- 用户列表 -->
      <el-col :lg="18" :xs="24">
        <el-card shadow="never">
          <et-toolbar :left-group="leftBars" :right-group="rightBars" @command="toolbarHandler"></et-toolbar>
          <el-table v-loading="loading" :data="dataRef" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
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
import DeptTree from "./components/DeptTree.vue";
import { ODataQuery } from "@/utils/query";
import { Department, Employee, FieldType } from "@eimsnext/models";
import { SortDirection, employeeService } from "@eimsnext/services";
import buildQuery from "odata-query";
import AddEditEmp from "./components/AddEditEmp.vue";
import { ToolbarItem } from "@eimsnext/components";
import { IConditionList, toODataQuery } from "@/components/ConditionList/type";
import { IFieldSortList } from "@/components/FieldSortList/type";

defineOptions({
  name: "Employee",
  inheritAttrs: false,
});

const activeTab = ref("dept");
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
  { type: "button", config: { text: "新增", type: "success", command: "add", icon: "el-icon-plus", onCommand: () => { showAddEditDialog.value = true; } } },
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
  let deptFilter = undefined;
  if (deptId.value) {
    deptFilter = { departmentId: { eq: deptId.value } }
  }
  queryParams.value = toODataQuery(condList.value, sortList.value, (pageNum.value - 1) * pageSize.value, pageSize.value, deptFilter)

  // console.log("queryParams list", queryParams.value);
}

const queryParams = ref<ODataQuery<Employee>>({
  skip: 0,
  top: pageSize.value
});

const dataRef = ref<Employee[]>();
const totalRef = ref(0);
const loading = ref(false);
const deptId = ref("")

const pageChanged = (curPage: number, pSize: number) => {
  pageNum.value = curPage;
  pageSize.value = pSize;

  updateQueryParams();
  loadData()
}
const handleDeptQuery = (dept?: Department) => {
  deptId.value = dept?.id ?? ""

  updateQueryParams()
  handleQuery()
}
// 查询
const handleQuery = () => {
  loading.value = true;

  loadCount()
  loadData()
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
    .finally(() => loading.value = false);
};

// 选中项发生变化
const handleSelectionChange = (selection: any[]) => {
  checkedDatas.value = selection;
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
  handleQuery()
};

const execDelete = async () => {
  await employeeService.delete("batch", { keys: checkedDatas.value.map(x => x.id) })
    .then(() => {
      handleQuery()
    })
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
