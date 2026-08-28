<template>
  <et-dialog
    :modelValue="modelValue"
    :title="t('admin.publishEditor.createGroup')"
    width="750px"
    destroy-on-close
    @ok="save"
    @cancel="cancel"
  >
    <div class="new-publish-container">
      <div class="member-select">
        <div class="item-title">{{ t("admin.publishEditor.publishToMembers") }}</div>
        <selected-tags v-model="members" :editable="true" @editTag="editTag"></selected-tags>
      </div>
      <div class="auth-group-select">
        <div class="item-title">{{ t("admin.publishEditor.memberPermission") }}</div>
        <el-select v-model="newPermissionGroup.type">
          <el-option :label="t('admin.publishEditor.manageSelfData')" :value="FormDataPermissionMode.ManageSelfData"></el-option>
          <el-option :label="t('admin.publishEditor.viewAllData')" :value="FormDataPermissionMode.ViewAllData"></el-option>
          <el-option :label="t('admin.publishEditor.manageAllData')" :value="FormDataPermissionMode.ManageAllData"></el-option>
          <el-option :label="t('admin.publishEditor.custom')" :value="FormDataPermissionMode.Custom"></el-option>
        </el-select>
      </div>
      <FormDataPermissionGroupEditor
        v-if="newPermissionGroup.type == FormDataPermissionMode.Custom"
        v-model="newPermissionGroup"
        :form-def="formDef"
        class="auth-group-editor"
      ></FormDataPermissionGroupEditor>
      <MemberSelectDialog
        v-model="showMemberDialog"
        :tags="members"
        :memberOptions="{
          showTabs: MemberTabs.Department | MemberTabs.EmployeeGroup | MemberTabs.Employee,
          multiple: true,
          cascadedDept: true,
          showCascade: true,
          limit,
        }"
        destroy-on-close
        @ok="finishSelect"
      ></MemberSelectDialog>
    </div>
  </et-dialog>
</template>
<script setup lang="ts">
import {
  FormDef,
  FormDataPermissionGroup,
  FormDataPermissions,
  FormDataPermissionMode,
  FormDataPermissionGroupRequest,
  Member,
  MemberType,
} from "@eimsnext/models";
import { ISelectedTag, SelectedTags, MemberSelectDialog, MemberTabs } from "@eimsnext/components";
import FormDataPermissionGroupEditor from "./FormDataPermissionGroupEditor.vue";

import { useI18n } from "vue-i18n";
import { formDataPermissionGroupService } from "@eimsnext/services";
import { convertMemberTypeToTagType, convertTagTypeToMemberType } from "./type";
const { t } = useI18n();

defineOptions({
  name: "NewPublishDialog",
});

const props = defineProps<{
  modelValue: boolean;
  permissionGroup?: FormDataPermissionGroup;
  formDef: FormDef;
  limit?: { depts?: ISelectedTag[]; employeeGroups?: ISelectedTag[] };
}>();

const limit = computed(() => props.limit);

const newPermissionGroup = toRef(
  props.permissionGroup ?? {
    id: "",
    name: t("admin.publishEditor.manageSelfData"),
    appId: props.formDef.appId,
    formId: props.formDef.id,
    type: FormDataPermissionMode.ManageSelfData,
    formDataPermissions: FormDataPermissions.None,
    disabled: false,
  }
);

const members = ref<ISelectedTag[]>([]);
if (newPermissionGroup.value.members)
  members.value = newPermissionGroup.value.members.map<ISelectedTag>((x) => {
    return {
      id: x.id,
      value: x.value,
      label: x.label,
      type: convertMemberTypeToTagType(x.type),
      cascadedDept: x.cascadedDept,
    };
  });

const showMemberDialog = ref(false);

const editTag = () => {
  showMemberDialog.value = true;
};
const finishSelect = (tags: ISelectedTag[]) => {
  members.value = tags;
  showMemberDialog.value = false;
};

const permissionGroupTypeName = (type: FormDataPermissionMode) => {
  switch (type) {
    case FormDataPermissionMode.ManageSelfData:
      return "ManageSelfData";
    case FormDataPermissionMode.ViewAllData:
      return "ViewAllData";
    case FormDataPermissionMode.ManageAllData:
      return "ManageAllData";
    case FormDataPermissionMode.Custom:
      return "Custom";
    default:
      return type;
  }
};

const emit = defineEmits(["update:modelValue", "close"]);
const cancel = () => {
  emit("update:modelValue", false);
  emit("close", false);
};
const save = async () => {
  let req: FormDataPermissionGroupRequest = {
    id: newPermissionGroup.value.id,
    appId: props.formDef.appId,
    formId: props.formDef.id,
    name: newPermissionGroup.value.name,
    desc: newPermissionGroup.value.desc,
    type: permissionGroupTypeName(newPermissionGroup.value.type) as FormDataPermissionMode,
    members: members.value.map<Member>((x) => {
      return {
        id: x.id,
        value: x.value,
        label: x.label,
        type: convertTagTypeToMemberType(x.type),
        cascadedDept: x.cascadedDept ?? false,
      };
    }),
    formDataPermissions: newPermissionGroup.value.formDataPermissions,
    dataFilter: newPermissionGroup.value.dataFilter,
    disabled: newPermissionGroup.value.disabled,
    formFieldPermissions: newPermissionGroup.value.formFieldPermissions,
  };

  const request = req.id
    ? formDataPermissionGroupService.put<FormDataPermissionGroupRequest>(req.id, req)
    : formDataPermissionGroupService.post<FormDataPermissionGroupRequest>(req);

  await request.then(() => {
    ElMessage.success(t("common.saveSuccess"));
    emit("close", true);
  });
};
</script>
<style lang="scss" scoped>
.new-publish-container {
  margin: var(--et-space-20);
  height: var(--et-size-470);

  .item-title {
    color: var(--et-text-primary);
    font-size: var(--et-font-size-14);
    font-weight: 500;
    line-height: var(--et-line-height-22);
    margin-bottom: var(--et-space-8);
  }

  .auth-group-select {
    margin: var(--et-space-20) 0 var(--et-space-8);
  }
}

.auth-group-editor {
  height: var(--et-size-280);
}
</style>

