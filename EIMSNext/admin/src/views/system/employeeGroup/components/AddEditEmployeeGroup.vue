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
        <el-form-item :label="$t('comp.addEditEmployeeGroup.employeeGroupCategory')">
          <el-input :model-value="pGroup.name" readonly />
        </el-form-item>
        <el-form-item :label="$t('comp.addEditEmployeeGroup.employeeGroupName')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('comp.addEditEmployeeGroup.employeeGroupNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('comp.addEditEmployeeGroup.employeeGroupDesc')" prop="description">
          <el-input v-model="formData.description" type="textarea" :placeholder="$t('comp.addEditEmployeeGroup.employeeGroupDescPlaceholder')" />
        </el-form-item>
      </el-form>
  </et-dialog>
</template>
<script lang="ts" setup>
import { EmployeeGroup, EmployeeGroupCategory, EmployeeGroupRequest } from "@eimsnext/models";
import { employeeGroupService } from "@eimsnext/services";
import { FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "AddEditEmployeeGroup",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    pGroup: EmployeeGroupCategory;
    pEmployeeGroup?: EmployeeGroup;
  }>(),
  {
    edit: false,
  }
);

const { t } = useI18n();
const showDialog = ref(true);
const title = props.edit ? t("comp.addEditEmployeeGroup.editEmployeeGroup") : t("common.add");
const formData = ref<EmployeeGroup>({
  id: "",
  name: "",
  employeeGroupCategoryId: props.pGroup.id,
  description: "",
  sortValue: -1,
});
const formRef = ref<FormInstance>();
if (props.edit) formData.value = props.pEmployeeGroup!;
else {
  formData.value.employeeGroupCategoryId = props.pGroup.id;
}
const rules = reactive({
  name: [{ required: true, message: t("comp.addEditEmployeeGroup.employeeGroupNameRequired"), trigger: "blur" }],
});

const emit = defineEmits(["cancel", "ok"]);
const cancel = () => {
  emit("cancel");
};
const save = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const newEmployeeGroup: EmployeeGroupRequest = {
        id: formData.value.id,
        name: formData.value.name,
        employeeGroupCategoryId: formData.value.employeeGroupCategoryId,
        description: formData.value.description,
        sortValue: formData.value.sortValue,
      };

      if (props.edit) {
        formData.value = await employeeGroupService.patch<EmployeeGroup>(newEmployeeGroup.id, newEmployeeGroup);
      } else {
        formData.value = await employeeGroupService.post<EmployeeGroup>(newEmployeeGroup);
      }

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
