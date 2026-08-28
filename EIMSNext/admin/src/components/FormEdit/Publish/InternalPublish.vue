<template>
  <div>
    <EtConfirmDialog
      v-model="showDeleteConfirmDialog"
      :title="t('common.message.deleteConfirm_Title')"
      :icon="MessageIcon.Warning"
      :showNoSave="false"
      :okText="t('common.ok')"
      @ok="execDelete"
    >
      <div>{{ t("common.message.deleteConfirm_Content2") }}</div>
    </EtConfirmDialog>
    <NewPublishDialog
      v-if="showDialog"
      v-model="showDialog"
      :permissionGroup="selectedGrp"
      :formDef="formDef"
      :limit="limit"
      destroy-on-close
      @close="close"
    />
    <AdvanceLayout :title="t('admin.publish.internal')" :desc="t('admin.internalPublish.desc')">
      <div class="permission-group-container">
        <div class="panel-header">
          <div class="header-left">
            <el-button type="primary" icon="plus" @click="addNew()">{{ t("admin.internalPublish.newGroup") }}</el-button>
          </div>
          <div class="header-right"></div>
        </div>
        <div>
          <el-space direction="vertical" class="permission-group-space">
            <template v-for="permissionGroup in permissionGroups">
              <et-card class="permission-group-card" :title="permissionGroup.name">
                <template #action>
                  <div class="permission-group-header">
                    <el-button @click="edit(permissionGroup)">{{ t("common.edit") }}</el-button>
                    <el-button class="delete-button" @click="remove(permissionGroup)">{{ t("common.delete") }}</el-button>
                    <el-switch
                      :model-value="!permissionGroup.disabled"
                      @change="toggleDisable(permissionGroup)"
                    ></el-switch>
                  </div>
                </template>
                <div class="permission-group-content">
                  <selected-tags
                    :modelValue="convertMembersToTags(permissionGroup.members)"
                    :editable="true"
                    :empty-text="t('comp.emptyMember')"
                    @editTag="editTag(permissionGroup)"
                  />
                </div>
              </et-card>
            </template>
          </el-space>
        </div>
      </div>
    </AdvanceLayout>
    <MemberSelectDialog
      v-if="showMemberDialog"
      v-model="showMemberDialog"
      :tags="selectedMemberTags"
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
</template>
<script setup lang="ts">
import {
  FormDef,
  FormDataPermissionGroup,
  FormDataPermissions,
  FormDataPermissionMode,
  Member,
  FormDataPermissionGroupRequest,
} from "@eimsnext/models";
import { formDataPermissionGroupService } from "@eimsnext/services";
import buildQuery from "odata-query";
import AdvanceLayout from "../Advanced/AdvanceLayout.vue";
import { ISelectedTag, MemberTabs, MessageIcon } from "@eimsnext/components";
import NewPublishDialog from "./NewPublishDialog.vue";
import { useI18n } from "vue-i18n";
import { convertMemberTypeToTagType, convertTagTypeToMemberType } from "./type";
const { t } = useI18n();

defineOptions({
  name: "InternalPublish",
});

const props = defineProps<{
  formDef: FormDef;
  limit?: { depts?: ISelectedTag[]; employeeGroups?: ISelectedTag[] };
}>();

const showDialog = ref(false);
const showMemberDialog = ref(false);
const showDeleteConfirmDialog = ref(false);
const permissionGroups = ref<FormDataPermissionGroup[]>([]);
const selectedGrp = ref<FormDataPermissionGroup>();
const selectedMemberTags = ref<ISelectedTag[]>([]);

const loadFormDataPermissionGroups = (formId: string) => {
  let query = buildQuery({ filter: { formId: formId } });
  formDataPermissionGroupService.query<FormDataPermissionGroup>(query).then((res) => {
    permissionGroups.value = res;
  });
};

const convertMembersToTags = (members?: Member[]): ISelectedTag[] => {
  if (members && members.length > 0)
    return members.map<ISelectedTag>((x) => ({
      id: x.id,
      value: x.value,
      label: x.label,
      type: convertMemberTypeToTagType(x.type),
      cascadedDept: x.cascadedDept,
    }));

  return [] as ISelectedTag[];
};

const addNew = () => {
  selectedGrp.value = undefined;
  showDialog.value = true;
};

const edit = (grp: FormDataPermissionGroup) => {
  selectedGrp.value = grp;
  showDialog.value = true;
};

const remove = (grp: FormDataPermissionGroup) => {
  selectedGrp.value = grp;
  showDeleteConfirmDialog.value = true;
};
const execDelete = () => {
  formDataPermissionGroupService.delete<FormDataPermissionGroup>(selectedGrp.value!.id).then(() => {
    loadFormDataPermissionGroups(props.formDef.id);
    showDeleteConfirmDialog.value = false;
  });
};
const toggleDisable = (grp: FormDataPermissionGroup) => {
  formDataPermissionGroupService.patch<FormDataPermissionGroup>(grp.id, { id: grp.id, disabled: !grp.disabled }).then(() => {
    grp.disabled = !grp.disabled;
  });
};

function close(reload: boolean) {
  showDialog.value = false;

  if (reload) loadFormDataPermissionGroups(props.formDef.id);
}

const editTag = (grp: FormDataPermissionGroup) => {
  selectedGrp.value = grp;
  selectedMemberTags.value = convertMembersToTags(grp.members);
  showMemberDialog.value = true;
};
const finishSelect = (tags: ISelectedTag[]) => {
  let newMembers = tags.map<Member>((x) => ({
    id: x.id,
    value: x.value,
    label: x.label,
    type: convertTagTypeToMemberType(x.type),
    cascadedDept: x.cascadedDept ?? false,
  }));

  let req: FormDataPermissionGroupRequest = {
    id: selectedGrp.value!.id,
    members: newMembers,
  };
  formDataPermissionGroupService.patch<FormDataPermissionGroupRequest>(req.id, req).then(() => {
    permissionGroups.value.find((x) => x.id == req.id)!.members = newMembers;
    showMemberDialog.value = false;
  });
};

onBeforeMount(() => {
  if (props.formDef) {
    loadFormDataPermissionGroups(props.formDef.id);
  }
});
</script>
<style lang="scss" scoped>
.permission-group-container {
  display: flex;
  flex-direction: column;

  .panel-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding-bottom: var(--et-space-16);
  }

  .permission-group-space {
    width: 100%;
    align-items: normal !important;
  }

  .permission-group-card {
    width: 100%;

    .permission-group-header {
      display: flex;
      justify-content: space-between;

      .permission-group-name {
        font-size: var(--et-font-size-15);
        font-weight: 600;
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .el-button {
        margin: var(--et-space-0);
        border: none;
      }
    }

    .permission-group-content {
      padding: var(--et-space-5) 0;
    }
  }
}
</style>

