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
                <el-icon :size="14" color="#2f7deb"><UserFilled /></el-icon>
                <span class="ml-5px">在职员工</span>
              </div>
              <div class="menu-item">
                <el-icon :size="14"><UserFilled /></el-icon>
                <span class="ml-5px">离职员工</span>
              </div>
            </div>
            <div class="org-menu">部门</div>
            <dept-tree :editable="true" @node-click="handleQuery" />
          </el-tab-pane>
          <el-tab-pane label="角色" name="role">
            <!-- <dept-tree :editable="true" @node-click="handleQuery" /> -->
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <!-- 用户列表 -->
      <el-col :lg="18" :xs="24">
        <div class="search-bar">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键字" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                placeholder="用户名/昵称/手机号"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <!-- <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="正常" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item> -->

            <!-- <el-form-item label="创建时间">
              <el-date-picker
                v-model="queryParams.createTime"
                :editable="false"
                class="!w-[240px]"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="截止时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item> -->

            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery()">搜索</el-button>
              <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="never">
          <div class="flex-x-between mb-10px">
            <div>
              <el-button
                v-hasPerm="['sys:user:add']"
                type="success"
                icon="plus"
                @click="handleAddClick()"
              >
                新增
              </el-button>
              <el-button
                v-hasPerm="'sys:user:delete'"
                type="danger"
                icon="delete"
                :disabled="selectIds.length === 0"
                @click="handleBatchDeleteClick()"
              >
                删除
              </el-button>
            </div>
            <div>
              <el-button
                v-hasPerm="'sys:user:import'"
                icon="upload"
                @click="handleOpenImportDialog"
              >
                导入
              </el-button>

              <el-button v-hasPerm="'sys:user:export'" icon="download" @click="handleExport">
                导出
              </el-button>
            </div>
          </div>
          <el-table v-loading="loading" :data="pageData" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="姓名" width="150" prop="empName" />
            <el-table-column label="编码" width="150" prop="code" />
            <el-table-column label="工作电话" width="150" prop="workPhone" />
            <el-table-column label="工作邮箱" width="150" prop="workEmail" />
            <el-table-column label="部门" prop="departmentName" />
            <el-table-column label="操作" fixed="right" width="150">
              <template #default="scope">
                <el-button
                  v-hasPerm="'sys:user:edit'"
                  type="primary"
                  icon="edit"
                  link
                  size="small"
                  @click="handleEditClick(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-hasPerm="'sys:user:delete'"
                  type="danger"
                  icon="delete"
                  link
                  size="small"
                  @click="handleDeleteClick(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </el-card>
      </el-col>
    </el-row>
    <AddEditEmp
      v-if="showAddEditDialog"
      :edit="editMode"
      :emp="selectedEmp"
      @cancel="showAddEditDialog = false"
      @ok="handleSaved"
    />
    <et-confirm-dialog
      v-model="showDeleteDialog"
      title="确认要删除吗?"
      :showNoSave="false"
      okText="确认"
      @cancel="showDeleteDialog = false"
      @ok="handleDeleteConfirm"
    >
      确认删除已选中的数据项?
    </et-confirm-dialog>
    <!-- 用户导入 -->
    <EmpImport v-model="importDialogVisible" @import-success="handleQuery()" />
  </div>
</template>

<script setup lang="ts">
import DeptTree from "./components/DeptTree.vue";
import EmpImport from "./components/EmpImport.vue";
import { ODataQuery } from "@/utils/query";
import { Department, Employee } from "@eimsnext/models";
import { employeeService } from "@eimsnext/services";
import buildQuery from "odata-query";
import AddEditEmp from "./components/AddEditEmp.vue";

defineOptions({
  name: "Employee",
  inheritAttrs: false,
});

const activeTab = ref("dept");
const selectedEmp = ref<Employee>();
const showAddEditDialog = ref(false);
const editMode = ref(false);
const showDeleteDialog = ref(false);

const queryFormRef = ref(ElForm);

const queryParams = reactive<ODataQuery<Employee>>({
  pageNum: 1,
  pageSize: 10,
  deptId: "",
  keywords: "",
});

const pageData = ref<Employee[]>();
const total = ref(0);
const loading = ref(false);

// 选中的用户ID
const selectIds = ref<number[]>([]);
// 导入弹窗显示状态
const importDialogVisible = ref(false);

// 查询
const handleQuery = (dept?: Department) => {
  loading.value = true;
  const filter: any = {};
  if (dept) queryParams.deptId = dept.id;
  if (queryParams.deptId) filter["departmentId"] = queryParams.deptId;

  let query = buildQuery({ filter: filter });
  // console.log("query", query);
  employeeService
    .query<Employee>(query)
    .then((data) => {
      // console.log("emps", data);
      pageData.value = data;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 重置查询
const handleResetQuery = () => {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.deptId = undefined;
  queryParams.createTime = undefined;
  handleQuery();
};

// 选中项发生变化
const handleSelectionChange = (selection: any[]) => {
  selectIds.value = selection.map((item) => item.id);
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

const handleAddClick = () => {
  editMode.value = false;
  selectedEmp.value = undefined;
  showAddEditDialog.value = true;
};

const handleEditClick = (data: Employee) => {
  // console.log("data", data);
  editMode.value = true;
  selectedEmp.value = data;
  showAddEditDialog.value = true;
};
const handleSaved = (data: Employee) => {
  showAddEditDialog.value = false;
  //TODO?刷新列表？？？ 还是关闭新增框才刷新？
};
const handleBatchDeleteClick = () => {
  if (selectIds.value.length > 0) showDeleteDialog.value = true;
};
const handleDeleteClick = (data?: Employee) => {
  selectedEmp.value = data;
  if (selectedEmp.value) showDeleteDialog.value = true;
};
const handleDeleteConfirm = async () => {
  await employeeService.delete(selectedEmp.value?.id!);

  let index = pageData.value?.findIndex((x) => x.id == selectedEmp.value?.id) ?? -1;
  if (index > -1) pageData.value?.splice(index, 1);

  showDeleteDialog.value = false;
};

// 提交用户表单（防抖）
const handleSubmit = useDebounceFn(() => {
  // userFormRef.value.validate((valid: boolean) => {
  //   if (valid) {
  //     const userId = formData.id;
  //     loading.value = true;
  //     if (userId) {
  //       UserAPI.update(userId, formData)
  //         .then(() => {
  //           ElMessage.success("修改用户成功");
  //           handleCloseDialog();
  //           handleResetQuery();
  //         })
  //         .finally(() => (loading.value = false));
  //     } else {
  //       UserAPI.add(formData)
  //         .then(() => {
  //           ElMessage.success("新增用户成功");
  //           handleCloseDialog();
  //           handleResetQuery();
  //         })
  //         .finally(() => (loading.value = false));
  //     }
  //   }
  // });
}, 1000);

/**
 * 删除用户
 *
 * @param id  用户ID
 */
// function handleDelete(id?: number) {
//   const userIds = [id || selectIds.value].join(",");
//   if (!userIds) {
//     ElMessage.warning("请勾选删除项");
//     return;
//   }

//   ElMessageBox.confirm("确认删除用户?", "警告", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     type: "warning",
//   }).then(
//     function () {
//       loading.value = true;
//       // UserAPI.deleteByIds(userIds)
//       //   .then(() => {
//       //     ElMessage.success("删除成功");
//       //     handleResetQuery();
//       //   })
//       //   .finally(() => (loading.value = false));
//     },
//     function () {
//       ElMessage.info("已取消删除");
//     }
//   );
// }

// 打开导入弹窗
function handleOpenImportDialog() {
  importDialogVisible.value = true;
}

// 导出用户
function handleExport() {
  // UserAPI.export(queryParams).then((response: any) => {
  //   const fileData = response.data;
  //   const fileName = decodeURI(response.headers["content-disposition"].split(";")[1].split("=")[1]);
  //   const fileType =
  //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";
  //   const blob = new Blob([fileData], { type: fileType });
  //   const downloadUrl = window.URL.createObjectURL(blob);
  //   const downloadLink = document.createElement("a");
  //   downloadLink.href = downloadUrl;
  //   downloadLink.download = fileName;
  //   document.body.appendChild(downloadLink);
  //   downloadLink.click();
  //   document.body.removeChild(downloadLink);
  //   window.URL.revokeObjectURL(downloadUrl);
  // });
}

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
</style>
