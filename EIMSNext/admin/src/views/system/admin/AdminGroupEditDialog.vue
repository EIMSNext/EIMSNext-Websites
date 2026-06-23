<template>
  <et-dialog
    :model-value="modelValue"
    :title="title"
    width="420px"
    destroy-on-close
    @cancel="cancel"
    @ok="save"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" class="dialog-form">
      <el-form-item :label="t('common.name')" prop="name">
        <el-input v-model="formData.name" :placeholder="t('common.namePlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('common.description')">
        <el-input v-model="formData.description" type="textarea" :placeholder="t('common.descriptionPlaceholder')" />
      </el-form-item>
    </el-form>
  </et-dialog>
</template>

<script setup lang="ts">
import { AdminGroup, AdminGroupType } from "@eimsnext/models";
import { FormInstance, FormRules } from "element-plus";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "AdminGroupEditDialog",
});

const props = defineProps<{
  modelValue: boolean;
  group?: AdminGroup;
  type: AdminGroupType;
}>();

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const { t } = useI18n();
const formRef = ref<FormInstance>();
const formData = ref({
  name: "",
  description: "",
});

const title = computed(() => {
  if (props.group) return t("common.edit");
  return props.type === AdminGroupType.Folder ? t("admin.adminGroup.addFolder") : t("admin.adminGroup.addGroup");
});

const rules: FormRules = {
  name: [{ required: true, message: t("common.nameRequired"), trigger: "blur" }],
};

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      formData.value = {
        name: props.group?.name || "",
        description: props.group?.description || "",
      };
    }
  },
  { immediate: true },
);

const cancel = () => {
  emit("update:modelValue", false);
  emit("cancel");
};

const save = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  emit("ok", {
    name: formData.value.name.trim(),
    description: formData.value.description.trim(),
  });
  emit("update:modelValue", false);
};
</script>

<style scoped lang="scss">
.dialog-form {
  padding: var(--et-space-12) var(--et-space-16);
}
</style>
