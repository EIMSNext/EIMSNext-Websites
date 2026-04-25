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
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="图标">
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
import { appService } from "@eimsnext/services";

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
  props.menu.menuType === FormType.Dashboard ? "修改仪表盘名称和图标" : "修改表单名称和图标"
);

const formData = ref({
  name: props.menu.title || "",
  icon: props.menu.icon || "icon-formdefault",
  iconColor: props.menu.iconColor || "#1296db",
});

const rules = reactive({
  name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
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

  const app = await appService.editMenu(payload);
  emit("ok", app);
};
</script>

<style lang="scss" scoped>
.dialog-form {
  padding: var(--et-space-12) var(--et-space-20);
}
</style>
