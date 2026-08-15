<template>
  <et-dialog v-model="showDialog" width="500px" :title="title" :append-to-body="true" :destroy-on-close="true"
    @cancel="cancel" @ok="save">
      <el-form ref="appRef" :model="formData" :rules="rules" label-width="80px" class="dialog-form">
        <el-form-item :label="$t('comp.addEditApp.appName')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('comp.addEditApp.appNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('comp.addEditApp.appDesc')" prop="description">
          <el-input v-model="formData.description" :placeholder="$t('comp.addEditApp.appDescPlaceholder')" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item :label="$t('comp.addEditApp.appIcon')" prop="icon">
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
import { AppDef, AppDefRequest } from "@eimsnext/models";
import { appDefService } from "@eimsnext/services";
import { useAppStore } from "@eimsnext/store";
import { useI18n } from "vue-i18n";
import AppIconSelect from "./AppIconSelect.vue";
import { getAppIcon, getAppIconColor } from "@/utils/common";

defineOptions({
  name: "AddEditApp",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    app?: AppDef;
  }>(),
  {
    edit: false,
  }
);

const appStore = useAppStore();
const { t } = useI18n();
const showDialog = ref(true);
const title = props.edit ? t("comp.addEditApp.editApp") : t("comp.addEditApp.addApp");
const formData = ref<AppDef>({ id: "", name: "", sortIndex: 0, appMenus: [], icon: "" });
if (props.edit) formData.value = props.app!;
const appIcon = ref(getAppIcon(formData.value))
const appIconColor = ref(getAppIconColor(formData.value))

const rules = reactive({
  name: [{ required: true, message: t("comp.addEditApp.appNameRequired"), trigger: "blur" }],
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

  const newApp: AppDefRequest = {
    id: formData.value.id,
    name: formData.value.name,
    description: formData.value.description,
    sortIndex: formData.value.sortIndex,
    icon: appIcon.value,
    iconColor: appIconColor.value,
  };

  if (props.edit) {
    formData.value = await appDefService.patch<AppDef>(newApp.id, newApp);
  } else {
    formData.value = await appDefService.post<AppDef>(newApp);
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
  border-radius: 4px;
  height: 48px;
  width: 48px;
  vertical-align: middle;
}
</style>
