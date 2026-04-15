<template>
  <et-dialog v-model="showDialog" width="500px" :title="title" :append-to-body="true" :destroy-on-close="true"
    @cancel="cancel" @ok="save">
    <el-form ref="appRef" :model="formData" :rules="rules" label-width="80px" class="dialog-form">
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入应用名称" />
      </el-form-item>
      <el-form-item label="应用描述" prop="description">
        <el-input v-model="formData.description" placeholder="请输入应用描述" type="textarea" :rows="5" />
      </el-form-item>
      <el-form-item label="应用图标" prop="icon">
        <el-popover trigger="click" placement="bottom-start" width="340px">
          <template #reference>
            <div class="app-icon" :style="{ backgroundColor: appIconColor }"">
              <span style=" width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
              <et-icon :icon="appIcon" color="#ffffff" size="28px" /></span>
            </div>
          </template>
          <AppIconSelect :icon="appIcon" :icon-color="appIconColor" @ok="onIconSelected" />
        </el-popover>
      </el-form-item>
    </el-form>
  </et-dialog>
</template>
<script lang="ts" setup>
import { App, AppRequest } from "@eimsnext/models";
import { appService } from "@eimsnext/services";
import { useAppStore } from "@eimsnext/store";
import AppIconSelect from "./AppIconSelect.vue";
import { getAppIcon, getAppIconColor } from "@/utils/common";

defineOptions({
  name: "AddEditApp",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    app?: App;
  }>(),
  {
    edit: false,
  }
);

const appStore = useAppStore();
const showDialog = ref(true);
const title = props.edit ? "修改应用信息" : "添加新应用";
const formData = ref<App>({ id: "", name: "", sortIndex: 0, appMenus: [], icon: "" });
if (props.edit) formData.value = props.app!;
const appIcon = ref(getAppIcon(formData.value))
const appIconColor = ref(getAppIconColor(formData.value))

const rules = reactive({
  name: [{ required: true, message: "应用名称不能为空", trigger: "blur" }],
});

const onIconSelected = (payload: { icon: string; iconColor: string }) => {
  appIcon.value = payload.icon;
  appIconColor.value = payload.iconColor;
};

const emit = defineEmits(["cancel", "ok"]);
const appRef = ref();
const cancel = () => {
  emit("cancel");
};
const save = async () => {
  if (!appRef.value) return;

  try {
    await appRef.value.validate();
  } catch (error) {
    return;
  }

  const newApp: AppRequest = {
    id: formData.value.id,
    name: formData.value.name,
    description: formData.value.description,
    sortIndex: formData.value.sortIndex,
    icon: appIcon.value,
    iconColor: appIconColor.value,
  };

  if (props.edit) {
    formData.value = await appService.patch<App>(newApp.id, newApp);
  } else {
    formData.value = await appService.post<App>(newApp);
  }

  appStore.update(formData.value);
  emit("ok", formData.value);
};
</script>

<style lang="scss" scoped>
.dialog-form {
  padding: var(--et-space-12) var(--et-space-20);
}

.app-icon {
  cursor: pointer;
  display: inline-block;
  margin: 5px;
  border-radius: 8px;
  height: 48px;
  width: 48px;
  vertical-align: middle;
}
</style>
