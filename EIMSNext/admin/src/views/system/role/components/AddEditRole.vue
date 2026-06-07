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
        <el-form-item :label="$t('comp.addEditRole.roleGroup')">
          <el-input :model-value="pGroup.name" readonly />
        </el-form-item>
        <el-form-item :label="$t('comp.addEditRole.roleName')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('comp.addEditRole.roleNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('comp.addEditRole.roleDesc')" prop="description">
          <el-input v-model="formData.description" type="textarea" :placeholder="$t('comp.addEditRole.roleDescPlaceholder')" />
        </el-form-item>
      </el-form>
  </et-dialog>
</template>
<script lang="ts" setup>
import { Role, RoleGroup, RoleRequest } from "@eimsnext/models";
import { roleService } from "@eimsnext/services";
import { FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "AddEditRole",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    pGroup: RoleGroup;
    pRole?: Role;
  }>(),
  {
    edit: false,
  }
);

const { t } = useI18n();
const showDialog = ref(true);
const title = props.edit ? t("comp.addEditRole.editRole") : t("common.add");
const formData = ref<Role>({
  id: "",
  name: "",
  roleGroupId: props.pGroup.id,
  description: "",
  sortValue: -1,
});
const formRef = ref<FormInstance>();
if (props.edit) formData.value = props.pRole!;
else {
  formData.value.roleGroupId = props.pGroup.id;
}
const rules = reactive({
  name: [{ required: true, message: t("comp.addEditRole.roleNameRequired"), trigger: "blur" }],
});

const emit = defineEmits(["cancel", "ok"]);
const cancel = () => {
  emit("cancel");
};
const save = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const newRole: RoleRequest = {
        id: formData.value.id,
        name: formData.value.name,
        roleGroupId: formData.value.roleGroupId,
        description: formData.value.description,
        sortValue: formData.value.sortValue,
      };

      if (props.edit) {
        formData.value = await roleService.patch<Role>(newRole.id, newRole);
      } else {
        formData.value = await roleService.post<Role>(newRole);
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
