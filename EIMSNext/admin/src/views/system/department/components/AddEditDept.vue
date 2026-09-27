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
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" class="dialog-form">
      <el-form-item :label="t('admin.department.editDept.parentDept')" prop="parentName">
        <el-input :model-value="formData.parentName" readonly />
      </el-form-item>
      <el-form-item :label="t('admin.department.editDept.deptCode')" prop="code">
        <el-input v-model="formData.code" :placeholder="t('admin.department.editDept.deptCodePlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('admin.department.editDept.deptName')" prop="name">
        <el-input v-model="formData.name" :placeholder="t('admin.department.editDept.deptNamePlaceholder')" />
      </el-form-item>
    </el-form>
  </et-dialog>
</template>
<script lang="ts" setup>
import { Department, DepartmentRequest } from "@eimsnext/models";
import { departmentService } from "@eimsnext/services";
import { useDeptStore } from "@eimsnext/store";
import { FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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
const title = props.edit ? t("admin.department.editDept.editTitle") : t("admin.department.editDept.addTitle");
const formData = ref<Department>({ id: "", code: "", name: "", isCompany: false });
const formRef = ref<FormInstance>();
if (props.edit) formData.value = props.pDept;
else {
  formData.value.parentId = props.pDept.id;
  formData.value.parentName = props.pDept.name;
}
const rules = reactive({
  code: [{ required: true, message: t("admin.department.editDept.codeRequired"), trigger: "blur" }],
  name: [{ required: true, message: t("admin.department.editDept.nameRequired"), trigger: "blur" }],
});

const emit = defineEmits(["cancel", "ok"]);
const cancel = () => {
  emit("cancel");
};
const save = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
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
    }
  });
};
</script>

<style lang="scss" scoped>
.dialog-form {
  padding: var(--et-space-12) var(--et-space-20);
}
</style>
