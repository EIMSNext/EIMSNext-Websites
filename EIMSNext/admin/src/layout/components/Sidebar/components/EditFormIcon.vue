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
    <el-form ref="menuRef" :model="formData" :rules="rules" label-width="60px" class="dialog-form">
      <el-form-item :label="t('admin.sidebarEditor.name')" prop="name">
        <el-input v-model="formData.name" :placeholder="t('admin.sidebarEditor.namePlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('admin.sidebarEditor.icon')">
        <el-popover trigger="click" placement="bottom-start" width="340px">
          <template #reference>
            <et-icon
              :icon="formData.icon"
              :color="formData.iconColor || '#1296db'"
              size="28px"
              style="cursor: pointer"
            />
          </template>
          <FormIconSelect
            :icon="formData.icon"
            :icon-color="formData.iconColor"
            @ok="onIconSelected"
          />
        </el-popover>
      </el-form-item>
    </el-form>
  </et-dialog>
</template>

<script lang="ts" setup>
import { AppMenu, EditAppMenuRequest, FormType } from "@eimsnext/models";
import { appDefService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";
import { getFormIcon } from "@/utils/common";

const { t } = useI18n();

defineOptions({
  name: "EditFormIcon",
});

const props = defineProps<{
  appId: string;
  menu: AppMenu;
}>();

const emit = defineEmits(["cancel", "ok"]);
const showDialog = ref(true);
const menuRef = ref();
const title = computed(() =>
  props.menu.menuType === FormType.Dashboard ? t("admin.sidebarEditor.editDashboardTitle") : t("admin.sidebarEditor.editFormTitle")
);

const formData = ref({
  name: props.menu.title || "",
  icon: getFormIcon(props.menu),
  iconColor: props.menu.iconColor || "#1296db",
});

const rules = reactive({
  name: [{ required: true, message: t("admin.sidebarEditor.nameRequired"), trigger: "blur" }],
});

const onIconSelected = (payload: { icon?: string; iconColor?: string }) => {
  formData.value.icon = payload.icon || formData.value.icon;
  formData.value.iconColor = payload.iconColor || formData.value.iconColor;
};

const cancel = () => {
  emit("cancel");
};

const save = async () => {
  if (!menuRef.value) return;

  try {
    await menuRef.value.validate();
  } catch {
    return;
  }

  const payload: EditAppMenuRequest = {
    appId: props.appId,
    menuId: props.menu.menuId,
    name: formData.value.name,
    icon: formData.value.icon,
    iconColor: formData.value.iconColor,
  };

  const app = await appDefService.editMenu(payload);
  emit("ok", app);
};
</script>

<style lang="scss" scoped>
.dialog-form {
  padding: var(--et-space-12) var(--et-space-20);
}
</style>
