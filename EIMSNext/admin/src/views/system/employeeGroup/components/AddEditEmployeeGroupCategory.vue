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
      <el-form :model="formData" :rules="rules" label-width="80px" class="dialog-form">
        <el-form-item :label="$t('comp.addEditEmployeeGroupCategory.groupName')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('comp.addEditEmployeeGroupCategory.groupNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('comp.addEditEmployeeGroupCategory.groupDesc')" prop="description">
          <el-input v-model="formData.description" type="textarea" :placeholder="$t('comp.addEditEmployeeGroupCategory.groupDescPlaceholder')" />
        </el-form-item>
      </el-form>
  </et-dialog>
</template>
<script lang="ts" setup>
import { EmployeeGroupCategory, EmployeeGroupCategoryRequest } from "@eimsnext/models";
import { employeeGroupCategoryService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "AddEditEmployeeGroupCategory",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    pCategory?: EmployeeGroupCategory;
  }>(),
  {
    edit: false,
  }
);

const showDialog = ref(true);
const { t } = useI18n();
const title = props.edit ? t("comp.addEditEmployeeGroupCategory.editGroup") : t("comp.addEditEmployeeGroupCategory.addGroup");
const formData = ref<EmployeeGroupCategory>({ id: "", name: "", description: "", sortValue: -1 });
if (props.edit) formData.value = props.pCategory!;

const rules = reactive({
  name: [{ required: true, message: t("comp.addEditEmployeeGroupCategory.groupNameRequired"), trigger: "blur" }],
});

const emit = defineEmits(["cancel", "ok"]);
const cancel = () => {
  emit("cancel");
};
const save = async () => {
  const newGroup: EmployeeGroupCategoryRequest = {
    id: formData.value.id,
    name: formData.value.name,
    description: formData.value.description,
    sortValue: formData.value.sortValue,
  };

  if (props.edit) {
    formData.value = await employeeGroupCategoryService.patch<EmployeeGroupCategory>(newGroup.id, newGroup);
  } else {
    formData.value = await employeeGroupCategoryService.post<EmployeeGroupCategory>(newGroup);
  }

  emit("ok", formData.value);
};
</script>

<style lang="scss" scoped>
.dialog-form {
  padding: var(--et-space-12) var(--et-space-20);
}
</style>
