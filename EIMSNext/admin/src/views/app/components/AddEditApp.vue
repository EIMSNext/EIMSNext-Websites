<template>
  <et-dialog v-model="showDialog" width="400px" :title="title" :append-to-body="true" :destroy-on-close="true"
    @cancel="cancel" @ok="save">
    <el-form ref="appRef" :model="formData" :rules="rules" label-width="80px" style="padding: 12px 20px">
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入应用名称" />
      </el-form-item>
      <el-form-item label="应用描述" prop="description">
        <el-input v-model="formData.description" placeholder="请输入应用描述" type="textarea" :rows="5" />
      </el-form-item>
      <el-form-item label="应用图标" prop="icon">
        <IconSelect v-model="formData.icon" />
      </el-form-item>
    </el-form>
  </et-dialog>
</template>
<script lang="ts" setup>
import { App, AppRequest } from "@eimsnext/models";
import { appService } from "@eimsnext/services";
import { useAppStore } from "@eimsnext/store";
import IconSelect from "@/components/IconSelect/index.vue";

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

const rules = reactive({
  name: [{ required: true, message: "应用名称不能为空", trigger: "blur" }],
});

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
    icon: formData.value.icon,
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
