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
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>
    </el-form>
  </et-dialog>
</template>

<script setup lang="ts">
import { AdminGroup, AdminGroupType } from "@eimsnext/models";
import { FormInstance, FormRules } from "element-plus";

defineOptions({
  name: "AdminGroupEditDialog",
});

const props = defineProps<{
  modelValue: boolean;
  group?: AdminGroup;
  type: AdminGroupType;
}>();

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);
const formRef = ref<FormInstance>();
const formData = ref({
  name: "",
  description: "",
});

const title = computed(() => {
  if (props.group) return "编辑";
  return props.type === AdminGroupType.Folder ? "新增管理分组" : "新增管理组";
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
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
