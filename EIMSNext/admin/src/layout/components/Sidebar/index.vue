<template>
  <div>
    <form-edit v-if="showFormEditor" :formId="newFormId" :usingFlow="usingWorkflow" :isLedger="isLedger"
      @close="showFormEditor = false" />

    <div class="app-title">
      <et-icon :icon="getAppIcon(app)" size="16px" :color="getAppIconColor(app)"></et-icon>
      <span v-if="isSidebarOpened" class="ml-[10px]">{{ app?.name
      }}</span>
      <el-button class="side-bar-control" @click.stop="toggleSideBar"> <et-icon v-if="isSidebarOpened"
          icon="el-icon-DArrowLeft" size="14px"></et-icon>
        <et-icon v-else icon="el-icon-DArrowRight" size="14px"></et-icon>
      </el-button>
    </div>
    <div>
      <el-menu mode="vertical">
        <AppLink :to="{ name: 'mytasks', params: { appId: app?.id } }">
          <el-menu-item index="mytodo" :class="{ 'pl-15px': !isSidebarOpened }">
            <et-icon icon="iconfont-mytodo" class="step-image" size="14px" />
            <span v-if="isSidebarOpened" class="app-menu-text">{{ t("common.wfProcess.mytasks") }}</span>
          </el-menu-item>
        </AppLink>
        <AppLink :to="{ name: 'mystarted', params: { appId: app?.id } }">
          <el-menu-item index="mystarted" :class="{ 'pl-15px': !isSidebarOpened }">
            <et-icon icon="iconfont-mystarted" class="step-image" size="14px" />
            <span v-if="isSidebarOpened" class="app-menu-text">{{ t("common.wfProcess.mystarted") }}</span>
          </el-menu-item>
        </AppLink>
        <AppLink :to="{ name: 'myapproved', params: { appId: app?.id } }">
          <el-menu-item index="myapproved" :class="{ 'pl-15px': !isSidebarOpened }">
            <et-icon icon="iconfont-myapproved" class="step-image" size="14px" />
            <span v-if="isSidebarOpened" class="app-menu-text">{{ t("common.wfProcess.myapproved") }}</span>
          </el-menu-item>
        </AppLink>
        <AppLink :to="{ name: 'cctome', params: { appId: app?.id } }">
          <el-menu-item index="mycced" :class="{ 'pl-15px': !isSidebarOpened }">
            <et-icon icon="iconfont-mycced" class="step-image" size="14px" />
            <span v-if="isSidebarOpened" class="app-menu-text">{{ t("common.wfProcess.cctome") }}</span>
          </el-menu-item>
        </AppLink>
      </el-menu>
    </div>
    <div v-if="isSidebarOpened" class="form-action">
      <el-input>
        <template #prefix>
          <et-icon icon="el-icon-search" size="14px"> </et-icon>
        </template>
      </el-input>

      <template v-if="curUser.userType == UserType.CorpOwmer || curUser.userType == UserType.CorpAdmin">
        <el-dropdown placement="bottom-start" size="large">
          <el-button style="width: 30px;">
            <et-icon icon="el-icon-plus"> </et-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu style="min-width: 150px">
              <el-dropdown-item @click="createForm(false, false)">{{ t("admin.newForm") }}</el-dropdown-item>
              <el-dropdown-item @click="createForm(true, false)">{{ t("admin.newFlowForm") }}</el-dropdown-item>
              <el-dropdown-item @click="createForm(false, true)">{{ t("admin.newLedgerForm") }}</el-dropdown-item>
              <el-divider style="margin: 3px 0" />
              <el-dropdown-item @click="createFolder">{{ t("admin.newGroup") }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
    <el-scrollbar>
      <SidebarMenu :menu-list="appMenus" base-path="" />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, usePermissionStore, useSystemStore } from "@/store";
import { App, FormDef, FormDefRequest, FormType, UserType } from "@eimsnext/models";
import { useAppStore, useContextStore, useFormStore, useUserStore } from "@eimsnext/store";
import FormEdit from "@/components/FormEdit/index.vue";
import { getAppIcon, getAppIconColor } from "@/utils/common";
import { useI18n } from "vue-i18n";
import { formDefService } from "@eimsnext/services";
const { t } = useI18n()

const newFormId = ref("")
const showFormEditor = ref(false);
const usingWorkflow = ref(false);
const isLedger = ref(false);

const showDshEditor = ref(false);
// const systemStore = useSystemStore();
const settingsStore = useSettingsStore();
var permissionStore = usePermissionStore()
const { appMenus } = storeToRefs(permissionStore);

const appStore = useAppStore();
const formStore = useFormStore();
const contextStore = useContextStore();
const userStore = useUserStore()
const curUser = toRef(userStore.currentUser)

const app = ref<App>();

const systemStore = useSystemStore();
const isSidebarOpened = computed(() => systemStore.sidebar.opened);
// 展开/收缩菜单
function toggleSideBar() {
  systemStore.toggleSidebar();
}

watch(() => contextStore.appId,
  () => { appStore.get(contextStore.appId).then((res) => (app.value = res)); },
  { immediate: true }
)

const createForm = (usingFlow: boolean, ledger: boolean) => {
  usingWorkflow.value = usingFlow;
  isLedger.value = ledger;

  //直接创建，防止工作流/数据流等设置报错
  let req: FormDefRequest = {
    id: "",
    appId: contextStore.appId,
    name: t("admin.untitledForm"),
    type: FormType.Form,
    content: {
      "layout": "[]",
      "options": "{\"info\":{\"align\":\"left\"},\"form\":{\"inline\":false,\"hideRequiredAsterisk\":false,\"labelPosition\":\"top\",\"size\":\"default\",\"labelWidth\":\"auto\"},\"resetBtn\":{\"show\":false,\"innerText\":\"重置\"},\"submitBtn\":{\"show\":false,\"innerText\":\"提交\"}}"
    },
    usingWorkflow: usingFlow,
    isLedger: ledger,
  };

  formDefService.post<FormDef>(req).then(resp => {
    newFormId.value = resp.id
    formStore.update(resp);
    contextStore.setAppChanged(); //reload 菜单

    showFormEditor.value = true;
  });
};

const createDashboard = () => {
  showDshEditor.value = true;
};

const createFolder = () => { };
</script>

<style lang="scss" scoped>
.side-bar-control {
  border: none;
  position: absolute;
  top: 10px;
  right: 1px;
}

.app-title {
  display: flex;
  overflow: hidden;
  padding: 15px;
  font-size: 16px;
  align-items: center;
}

.form-action {
  display: flex;
  padding: 0 8px;
  margin-bottom: 5px;
}

.step-image {
  color: #1296db;
}

.app-menu-text {
  margin-left: 5px
}

:deep(.el-sub-menu__title) {
  line-height: 40px;
  height: 40px;
}

:deep(.el-menu-item) {
  line-height: 40px;
  height: 40px;
}
</style>
