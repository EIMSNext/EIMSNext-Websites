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
        <el-input v-model="formData.name" placeholder="请输入分组名称" />
      </el-form-item>
    </el-form>
  </et-dialog>
</template>

<script lang="ts" setup>
import { App, AppMenu, CreateAppGroupRequest, EditAppGroupRequest } from "@eimsnext/models";
import { appService } from "@eimsnext/services";

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
const title = computed(() => (isEdit.value ? "修改分组" : "新建分组"));
const formData = ref({
  name: props.menu?.title || "",
});

const rules = reactive({
  name: [{ required: true, message: "分组名称不能为空", trigger: "blur" }],
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

  let app: App;
  if (isEdit.value) {
    const payload: EditAppGroupRequest = {
      appId: props.appId,
      menuId: props.menu!.menuId,
      name: formData.value.name,
    };
    app = await appService.editGroup(payload);
  } else {
    const payload: CreateAppGroupRequest = {
      appId: props.appId,
      name: formData.value.name,
    };
    app = await appService.createGroup(payload);
  }

  emit("ok", app);
};
</script>

<style lang="scss" scoped>
.dialog-form {
  padding: var(--et-space-12) var(--et-space-20);
}
</style>
