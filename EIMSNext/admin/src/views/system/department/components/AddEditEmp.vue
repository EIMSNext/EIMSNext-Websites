<template>
  <et-dialog v-model="showDialog" width="400px" :title="title" :append-to-body="true" :destroy-on-close="true"
    @cancel="cancel">
    <el-form :model="formData" :rules="rules" label-width="80px" style="padding: 12px 20px">
      <el-form-item label="员工编码" prop="nickname">
        <el-input v-model="formData.code" placeholder="请输入员工编码" />
      </el-form-item>
      <el-form-item label="员工姓名" prop="empName">
        <el-input v-model="formData.empName" placeholder="请输入员工姓名" />
      </el-form-item>
      <el-form-item label="手机号码" prop="workPhone">
        <el-input v-model="formData.workPhone" placeholder="请输入手机号码" maxlength="11" />
      </el-form-item>
      <el-form-item label="邮箱" prop="workEmail">
        <el-input v-model="formData.workEmail" placeholder="请输入邮箱" maxlength="50" />
      </el-form-item>
      <el-form-item label="所属部门" prop="departmentId">
        <el-tree-select v-model="formData.departmentId" placeholder="请选择所属部门" :data="deptList"
          :props="{ children: 'children', label: 'label', value: 'id', disabled: '' }" filterable check-strictly
          :render-after-expand="false" />
      </el-form-item>
      <!-- <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
      </el-form-item> -->
    </el-form>
    <template #footer>
      <div class="footer-wrapper">
        <div class="footer-left">
          <slot name="footer-left"></slot>
        </div>
        <div class="footer-right">
          <slot name="footer-right">
            <el-button @click="saveAndInvite">保存并邀请</el-button>
            <el-button type="primary" @click="save">保存</el-button>
          </slot>
        </div>
      </div>
    </template>
  </et-dialog>
</template>
<script lang="ts" setup>
import { ITreeNode, buildDeptTree } from "@eimsnext/components";
import { Department, Employee, EmployeeRequest } from "@eimsnext/models";
import { employeeService } from "@eimsnext/services";
import { useDeptStore } from "@eimsnext/store";

defineOptions({
  name: "AddEditEmp",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    emp?: Employee;
  }>(),
  {
    edit: false,
  }
);

const deptStore = useDeptStore();
const deptList = ref<ITreeNode[]>(); // 部门列表
const showDialog = ref(true);
const title = props.edit ? "修改员工信息" : "添加新员工";
const formData = ref<Employee>({
  id: "",
  code: "",
  empName: "",
  departmentId: "",
  status: 1,
  isManager: false,
  approved: false,
});
if (props.edit) formData.value = props.emp!;

const rules = reactive({
  code: [{ required: true, message: "员工编码不能为空", trigger: "blur" }],
  empName: [{ required: true, message: "员工姓名不能为空", trigger: "blur" }],
  workPhone: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
  workEmail: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: "请输入正确的邮箱地址",
      trigger: "blur",
    },
  ],
  deptId: [{ required: true, message: "所属部门不能为空", trigger: "blur" }],
  inviteId: [{ message: "用户角色不能为空", trigger: "blur" }],
});

onBeforeMount(() => {
  deptStore.load().then((data: Department[]) => {
    deptList.value = buildDeptTree(data);
  });
});

const emit = defineEmits(["cancel", "ok"]);
const cancel = () => {
  emit("cancel");
};
const saveAndInvite = async () => {
  const newEmp: EmployeeRequest = {
    id: formData.value.id,
    code: formData.value.code,
    empName: formData.value.empName,
    workPhone: formData.value.workPhone,
    workEmail: formData.value.workEmail,
    departmentId: formData.value.departmentId,
    isManager: false,
    invite: formData.value.workPhone || formData.value.workEmail
  };

  if (props.edit) {
    formData.value = await employeeService.patch<Employee>(newEmp.id, newEmp);
  } else {
    formData.value = await employeeService.post<Employee>(newEmp);
  }

  emit("ok", formData.value);
};

const save = async () => {
  const newEmp: EmployeeRequest = {
    id: formData.value.id,
    code: formData.value.code,
    empName: formData.value.empName,
    workPhone: formData.value.workPhone,
    workEmail: formData.value.workEmail,
    departmentId: formData.value.departmentId,
    isManager: false,
  };

  if (props.edit) {
    formData.value = await employeeService.patch<Employee>(newEmp.id, newEmp);
  } else {
    formData.value = await employeeService.post<Employee>(newEmp);
  }

  emit("ok", formData.value);
};
</script>
