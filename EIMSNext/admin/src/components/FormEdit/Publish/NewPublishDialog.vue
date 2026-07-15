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
        <el-select v-model="newAuthGrp.type">
          <el-option :label="t('admin.publishEditor.manageSelfData')" :value="AuthGroupType.ManageSelfData"></el-option>
          <el-option :label="t('admin.publishEditor.viewAllData')" :value="AuthGroupType.ViewAllData"></el-option>
          <el-option :label="t('admin.publishEditor.manageAllData')" :value="AuthGroupType.ManageAllData"></el-option>
          <el-option :label="t('admin.publishEditor.custom')" :value="AuthGroupType.Custom"></el-option>
        </el-select>
      </div>
      <AuthGroupEditor
        v-if="newAuthGrp.type == AuthGroupType.Custom"
        v-model="newAuthGrp"
        :form-def="formDef"
        class="auth-group-editor"
      ></AuthGroupEditor>
      <MemberSelectDialog
        v-model="showMemberDialog"
        :tags="members"
        :memberOptions="{
          showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee,
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
  AuthGroup,
  DataPerms,
  AuthGroupType,
  AuthGroupRequest,
  Member,
  MemberType,
} from "@eimsnext/models";
import { ISelectedTag, SelectedTags, MemberSelectDialog, MemberTabs } from "@eimsnext/components";
import AuthGroupEditor from "./AuthGroupEditor.vue";

import { useI18n } from "vue-i18n";
import { authGroupService } from "@eimsnext/services";
import { convertMemberTypeToTagType, convertTagTypeToMemberType } from "./type";
const { t } = useI18n();

defineOptions({
  name: "NewPublishDialog",
});

const props = defineProps<{
  modelValue: boolean;
  authGroup?: AuthGroup;
  formDef: FormDef;
  limit?: { depts?: ISelectedTag[]; roles?: ISelectedTag[] };
}>();

const limit = computed(() => props.limit);

const newAuthGrp = toRef(
  props.authGroup ?? {
    id: "",
    name: t("admin.publishEditor.manageSelfData"),
    appId: props.formDef.appId,
    formId: props.formDef.id,
    type: AuthGroupType.ManageSelfData,
    dataPerms: DataPerms.None,
    disabled: false,
  }
);

const members = ref<ISelectedTag[]>([]);
if (newAuthGrp.value.members)
  members.value = newAuthGrp.value.members.map<ISelectedTag>((x) => {
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

const authGroupTypeName = (type: AuthGroupType) => {
  switch (type) {
    case AuthGroupType.ManageSelfData:
      return "ManageSelfData";
    case AuthGroupType.ViewAllData:
      return "ViewAllData";
    case AuthGroupType.ManageAllData:
      return "ManageAllData";
    case AuthGroupType.Custom:
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
  let req: AuthGroupRequest = {
    id: newAuthGrp.value.id,
    appId: props.formDef.appId,
    formId: props.formDef.id,
    name: newAuthGrp.value.name,
    desc: newAuthGrp.value.desc,
    type: authGroupTypeName(newAuthGrp.value.type) as AuthGroupType,
    members: members.value.map<Member>((x) => {
      return {
        id: x.id,
        value: x.value,
        label: x.label,
        type: convertTagTypeToMemberType(x.type),
        cascadedDept: x.cascadedDept ?? false,
      };
    }),
    dataPerms: newAuthGrp.value.dataPerms,
    dataFilter: newAuthGrp.value.dataFilter,
    disabled: newAuthGrp.value.disabled,
    fieldPerms: newAuthGrp.value.fieldPerms,
  };

  const request = req.id
    ? authGroupService.put<AuthGroupRequest>(req.id, req)
    : authGroupService.post<AuthGroupRequest>(req);

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
