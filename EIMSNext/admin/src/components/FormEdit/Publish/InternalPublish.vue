<template>
  <EtConfirmDialog v-model="showDeleteConfirmDialog" title="你确定要删除所选数据吗？" :icon="MessageIcon.Warning"
    :showNoSave="false" okText="确定" @ok="execDelete">
    <div>数据删除后将不可恢复</div>
  </EtConfirmDialog>
  <NewPublishDialog v-model="showDialog" :formDef="formDef" @close="close" />
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
                  <el-switch :model-value="authGrp.disabled" @change="toggleDisable(authGrp)"></el-switch>
                </div>
              </template>
              <div class="auth-grp-content"> <selected-tags v-model="authGrp.members" :editable="true"
                  :empty-text="t('workflow.emptyMember')" /></div>
            </et-card>
          </template>
        </el-space>
      </div>
    </div>
  </AdvanceLayout>
</template>
<script setup lang="ts">
import { FormDef, AuthGroup, DataPerms, AuthGroupType } from "@eimsnext/models";
import { authGroupService } from "@eimsnext/services";
import buildQuery from "odata-query";
import AdvanceLayout from "../Advanced/AdvanceLayout.vue";
import { MessageIcon } from "@eimsnext/components";
import NewPublishDialog from "./NewPublishDialog.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n()

defineOptions({
  name: "InternalPublish",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const showDialog = ref(false);
const showDeleteConfirmDialog = ref(false)
const authGrps = ref<AuthGroup[]>([]);
const selectedGrp = ref<AuthGroup>();

// console.log("formid", props.formId);

const loadAuthGroups = (formId: string) => {
  // let query = buildQuery({ filter: { formId: formId } });
  // authGroupService.query<AuthGroup>(query).then((res) => {
  //   authGrps.value = res;
  // });
  authGrps.value.push({ id: "1111", name: "11111", dataPerms: 0, disabled: false, type: AuthGroupType.ViewAllData, members: [], appId: "", formId: "" })
};

const addNew = () => {
  selectedGrp.value = {
    id: "",
    appId: props.formDef.appId,
    formId: props.formDef.id,
    name: "未命名助手",
    type: AuthGroupType.Custom,
    dataPerms: DataPerms.None,
    members: [],
    disabled: false
  };

  showDialog.value = true;
};

const edit = (grp: AuthGroup) => {
  // console.log("edit df", flow);
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

// const emit = defineEmits(["close"]);

function close(reload: boolean) {
  showDialog.value = false;

  if (reload)
    loadAuthGroups(props.formDef.id);
}

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
