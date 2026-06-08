<template>
  <et-dialog
    v-model="showDialog"
    width="500px"
    :title="title"
    :append-to-body="true"
    :destroy-on-close="true"
    @cancel="cancel"
    @ok="save"
  >
    <el-form ref="groupRef" :model="formData" :rules="rules" class="dialog-form">
      <el-form-item prop="name">
        <el-input v-model="formData.name" :placeholder="t('admin.sidebarEditor.groupNamePlaceholder')" />
      </el-form-item>
    </el-form>
  </et-dialog>
</template>

<script lang="ts" setup>
import { AppDef, AppMenu, CreateAppGroupRequest, EditAppGroupRequest } from "@eimsnext/models";
import { appDefService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineOptions({
  name: "EditMenuGroup",
});

const props = defineProps<{
  appId: string;
  menu?: AppMenu;
}>();

const emit = defineEmits(["cancel", "ok"]);
const showDialog = ref(true);
const groupRef = ref();
const isEdit = computed(() => !!props.menu);
const title = computed(() => (isEdit.value ? t("admin.sidebarEditor.editGroup") : t("admin.sidebarEditor.newGroup")));
const formData = ref({
  name: props.menu?.title || "",
});

const rules = reactive({
  name: [{ required: true, message: t("admin.sidebarEditor.groupNameRequired"), trigger: "blur" }],
});

const cancel = () => {
  emit("cancel");
};

const save = async () => {
  if (!groupRef.value) return;

  try {
    await groupRef.value.validate();
  } catch {
    return;
  }

  let app: AppDef;
  if (isEdit.value) {
    const payload: EditAppGroupRequest = {
      appId: props.appId,
      menuId: props.menu!.menuId,
      name: formData.value.name,
    };
    app = await appDefService.editGroup(payload);
  } else {
    const payload: CreateAppGroupRequest = {
      appId: props.appId,
      name: formData.value.name,
    };
    app = await appDefService.createGroup(payload);
  }

  emit("ok", app);
};
</script>

<style lang="scss" scoped>
.dialog-form {
  padding: var(--et-space-12) var(--et-space-20);
}
</style>
