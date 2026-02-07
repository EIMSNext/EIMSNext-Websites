<template>
  <div>
    <EtConfirmDialog v-model="showDeleteConfirmDialog" title="你确定要删除所选数据吗？" :icon="MessageIcon.Warning"
      :showNoSave="false" okText="确定" @ok="execDelete">
      <div>数据删除后将不可恢复</div>
    </EtConfirmDialog>
    <NewPublishDialog v-if="showDialog" v-model="showDialog" :authGroup="selectedGrp" :formDef="formDef"
      destroy-on-close @close="close" />
    <AdvanceLayout title="内部发布" desc="设置成员权限，成员登录后根据权限访问">
      <div class="auth-grp-container">
        <div class="panel-header">
          <div class="header-left"> <el-button type="primary" icon="plus" @click="addNew()">新建权限组</el-button>
          </div>
          <div class="header-right"></div>
        </div>
        <div>
          <el-space direction="vertical" class="auth-grp-space">
            <template v-for="authGrp in authGrps">
              <et-card class="auth-grp-card" :title="authGrp.name">
                <template #action>
                  <div class="auth-grp-header">
                    <el-button @click="edit(authGrp)">编辑</el-button>
                    <el-button @click="remove(authGrp)">删除</el-button>
                    <el-switch :model-value="!authGrp.disabled" @change="toggleDisable(authGrp)"></el-switch>
                  </div>
                </template>
                <div class="auth-grp-content">
                  <selected-tags :modelValue="convertMembersToTags(authGrp.members)" :editable="true"
                    :empty-text="t('comp.emptyMember')" @editTag="editTag(authGrp)" />
                </div>
              </et-card>
            </template>
          </el-space>
        </div>
      </div>
    </AdvanceLayout>
    <MemberSelectDialog v-if="showMemberDialog" v-model="showMemberDialog" :tags="selectedMemberTags" :memberOptions="{
      showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee, multiple: true, cascadedDept: true,
      showCascade: true
    }" destroy-on-close @ok="finishSelect">
    </MemberSelectDialog>
  </div>
</template>
<script setup lang="ts">
import { FormDef, AuthGroup, DataPerms, AuthGroupType, Member, AuthGroupRequest } from "@eimsnext/models";
import { authGroupService } from "@eimsnext/services";
import buildQuery from "odata-query";
import AdvanceLayout from "../Advanced/AdvanceLayout.vue";
import { ISelectedTag, MemberTabs, MessageIcon } from "@eimsnext/components";
import NewPublishDialog from "./NewPublishDialog.vue";
import { useI18n } from "vue-i18n";
import { convertMemberTypeToTagType, convertTagTypeToMemberType } from "./type";
const { t } = useI18n()

defineOptions({
  name: "InternalPublish",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const showDialog = ref(false);
const showMemberDialog = ref(false)
const showDeleteConfirmDialog = ref(false)
const authGrps = ref<AuthGroup[]>([]);
const selectedGrp = ref<AuthGroup>();
const selectedMemberTags = ref<ISelectedTag[]>([])
// console.log("formid", props.formId);

const loadAuthGroups = (formId: string) => {
  let query = buildQuery({ filter: { formId: formId } });
  authGroupService.query<AuthGroup>(query).then((res) => {
    authGrps.value = res;
  });
};

const convertMembersToTags = (members?: Member[]): ISelectedTag[] => {

  if (members && members.length > 0)
    return members.map<ISelectedTag>(x => { return { id: x.id, code: x.code, label: x.label, type: convertMemberTypeToTagType(x.type), cascadedDept: x.cascadedDept } })

  return [] as ISelectedTag[];
}

const addNew = () => {
  selectedGrp.value = undefined;
  showDialog.value = true;
};

const edit = (grp: AuthGroup) => {
  selectedGrp.value = grp;
  showDialog.value = true;
};

const remove = (grp: AuthGroup) => {
  selectedGrp.value = grp
  showDeleteConfirmDialog.value = true
};
const execDelete = () => {
  authGroupService.delete<AuthGroup>(selectedGrp.value!.id).then((res) => {
    loadAuthGroups(props.formDef.id)
    showDeleteConfirmDialog.value = false
  });
}
const toggleDisable = (grp: AuthGroup) => {
  authGroupService.patch<AuthGroup>(grp.id, { id: grp.id, disabled: !grp.disabled }).then((res) => {
    grp.disabled = !grp.disabled
  });
}

function close(reload: boolean) {
  showDialog.value = false;

  if (reload)
    loadAuthGroups(props.formDef.id);
}

const editTag = (grp: AuthGroup) => {
  selectedGrp.value = grp;
  selectedMemberTags.value = convertMembersToTags(grp.members)
  showMemberDialog.value = true
}
const finishSelect = (tags: ISelectedTag[]) => {
  let newMembers = tags.map<Member>(x => { return { id: x.id, value: x.value, label: x.label, type: convertTagTypeToMemberType(x.type), cascadedDept: x.cascadedDept ?? false } })

  let req: AuthGroupRequest = {
    id: selectedGrp.value!.id,
    members: newMembers
  }
  authGroupService.patch<AuthGroupRequest>(req.id, req).then(res => {
    authGrps.value.find(x => x.id == req.id)!.members = newMembers
    showMemberDialog.value = false;
  }
  )
};

onBeforeMount(() => {
  //初始化
  if (props.formDef) {
    loadAuthGroups(props.formDef.id);
  }
});
</script>
<style lang="scss" scoped>
.auth-grp-container {
  display: flex;
  flex-direction: column;

  .panel-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding-bottom: 16px;
  }

  .auth-grp-space {
    width: 100%;
    align-items: normal !important;
  }

  .auth-grp-card {
    width: 100%;

    .auth-grp-header {
      display: flex;
      justify-content: space-between;

      .auth-grp-name {
        font-size: 15px;
        font-weight: 600;
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .el-button {
        margin: 0px;
        border: none;
      }
    }

    .auth-grp-content {
      padding: 5px 0;
    }
  }
}
</style>
