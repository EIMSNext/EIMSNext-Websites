<template>
  <et-dialog
    v-model="showDialog"
    width="400px"
    :title="title"
    :append-to-body="true"
    :destroy-on-close="true"
    @cancel="cancel"
    @ok="save"
  >
    <el-form
      ref="deptFormRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
      style="padding: 12px 20px"
    >
      <el-form-item label="上级部门" prop="parentName">
        <el-input :model-value="formData.parentName" readonly />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入部门编码" />
      </el-form-item>
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入部门名称" />
      </el-form-item>
    </el-form>
  </et-dialog>
</template>
<script lang="ts" setup>
import { Department, DepartmentRequest } from "@eimsnext/models";
import { departmentService } from "@eimsnext/services";
import { useDeptStore } from "@eimsnext/store";

defineOptions({
  name: "AddEditDept",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    pDept: Department;
  }>(),
  {
    edit: false,
  }
);

const deptStore = useDeptStore();
const showDialog = ref(true);
const title = props.edit ? "修改部门信息" : "添加子部门";
const formData = ref<Department>({ id: "", code: "", name: "", isCompany: false });
if (props.edit) formData.value = props.pDept;
else {
  formData.value.parentId = props.pDept.id;
  formData.value.parentName = props.pDept.name;
}
const rules = reactive({
  //   parentId: [{ required: true, message: "上级部门不能为空", trigger: "change" }],
  code: [{ required: true, message: "部门编码不能为空", trigger: "blur" }],
  name: [{ required: true, message: "部门名称不能为空", trigger: "blur" }],
});

const emit = defineEmits(["cancel", "ok"]);
const cancel = () => {
  emit("cancel");
};
const save = async () => {
  const newDept: DepartmentRequest = {
    id: formData.value.id,
    code: formData.value.code,
    name: formData.value.name,
    parentId: formData.value.parentId,
    isCompany: false,
  };

  if (props.edit) {
    formData.value = await departmentService.patch<Department>(newDept.id, newDept);
  } else {
    formData.value = await departmentService.post<Department>(newDept);
  }

  deptStore.update(formData.value);
  emit("ok", formData.value);
};
</script>
