<template>
  <et-dialog v-model="showDialog" width="400px" :title="title" :append-to-body="true" :destroy-on-close="true"
    @cancel="cancel" @ok="save">
    <el-form :model="formData" :rules="rules" label-width="80px" style="padding: 12px 20px">
      <el-form-item label="分组名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分组名称" />
      </el-form-item>
      <el-form-item label="分组描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入分组描述" />
      </el-form-item>
    </el-form>
  </et-dialog>
</template>
<script lang="ts" setup>
import { RoleGroup, RoleGroupRequest } from "@eimsnext/models";
import { roleGroupService } from "@eimsnext/services";

defineOptions({
  name: "AddEditRoleGroup",
});

const props = withDefaults(
  defineProps<{
    edit: boolean;
    pGroup?: RoleGroup;
  }>(),
  {
    edit: false,
  }
);

const showDialog = ref(true);
const title = props.edit ? "修改分组信息" : "添加分组";
const formData = ref<RoleGroup>({ id: "", name: "", description: "", sortValue: -1 });
if (props.edit) formData.value = props.pGroup!;

const rules = reactive({
  name: [{ required: true, message: "分组名称不能为空", trigger: "blur" }],
});

const emit = defineEmits(["cancel", "ok"]);
const cancel = () => {
  emit("cancel");
};
const save = async () => {
  const newGroup: RoleGroupRequest = {
    id: formData.value.id,
    name: formData.value.name,
    description: formData.value.description,
    sortValue: formData.value.sortValue,
  };

  if (props.edit) {
    formData.value = await roleGroupService.patch<RoleGroup>(newGroup.id, newGroup);
  } else {
    formData.value = await roleGroupService.post<RoleGroup>(newGroup);
  }

  emit("ok", formData.value);
};
</script>
