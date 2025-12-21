<template>
  <div :class="{ 'has-logo': sidebarLogo }">
    <form-edit v-if="showFormEditor" :formId="''" :usingFlow="usingWorkflow" :isLedger="isLedger"
      @close="showFormEditor = false" />

    <!-- 顶部布局顶部 || 左侧布局左侧 -->
    <!-- <SidebarLogo v-if="sidebarLogo" :collapse="isSidebarCollapsed" /> -->
    <div class="app-title">
      <et-icon :icon="getAppIcon(app)" size="20px" :color="getAppIconColor(app)"></et-icon>
      <span class="ml-[10px]">{{ app?.name
      }}</span>
    </div>
    <div>
      <el-menu mode="vertical">
        <AppLink :to="{ name: 'mytasks', params: { appId: app?.id } }">
          <el-menu-item index="mytodo">
            <et-icon icon="iconfont-mytodo" class="step-image" size="16px" />
            <span class="app-menu-text">我的待办</span>
          </el-menu-item>
        </AppLink>
        <AppLink :to="{ name: 'mystarted', params: { appId: app?.id } }">
          <el-menu-item index="mystarted">
            <et-icon icon="iconfont-mystarted" class="step-image" size="16px" />
            <span class="app-menu-text">我发起的</span>
          </el-menu-item>
        </AppLink>
        <AppLink :to="{ name: 'myapproved', params: { appId: app?.id } }">
          <el-menu-item index="myapproved">
            <et-icon icon="iconfont-myapproved" class="step-image" size="16px" />
            <span class="app-menu-text">我审批的</span>
          </el-menu-item>
        </AppLink>
        <AppLink :to="{ name: 'cctome', params: { appId: app?.id } }">
          <el-menu-item index="mycced">
            <et-icon icon="iconfont-mycced" class="step-image" size="16px" />
            <span class="app-menu-text">抄送我的</span>
          </el-menu-item>
        </AppLink>
      </el-menu>
    </div>
    <div class="form-action">
      <el-input>
        <template #prefix>
          <et-icon icon="el-icon-search"> </et-icon>
        </template>
      </el-input>

      <el-dropdown placement="bottom-start" size="large">
        <el-button>
          <et-icon icon="el-icon-plus"> </et-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu style="min-width: 150px">
            <el-dropdown-item @click="createForm(false, false)">创建普通表单</el-dropdown-item>
            <el-dropdown-item @click="createForm(true, false)">创建流程表单</el-dropdown-item>
            <el-dropdown-item @click="createForm(false, true)">新建数据台账</el-dropdown-item>
            <el-divider style="margin: 3px 0" />
            <el-dropdown-item @click="createFolder">创建表单分组</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-scrollbar>
      <SidebarMenu :menu-list="permissionStore.routes" base-path="" />
    </el-scrollbar>
    <!-- 顶部布局导航 -->
    <NavbarRight />
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, usePermissionStore } from "@/store";
import { App } from "@eimsnext/models";
import { useAppStore, useContextStore } from "@eimsnext/store";
import NavbarRight from "../NavBar/components/NavbarRight.vue";
import FormEdit from "@/components/FormEdit/index.vue";
import { getAppIcon, getAppIconColor } from "@/utils/common";

const showFormEditor = ref(false);
const usingWorkflow = ref(false);
const isLedger = ref(false);

const showDshEditor = ref(false);
// const systemStore = useSystemStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();

const sidebarLogo = computed(() => settingsStore.sidebarLogo);

const appStore = useAppStore();
const contextStore = useContextStore();

const app = ref<App>();


watch(() => contextStore.appId,
  () => { appStore.get(contextStore.appId).then((res) => (app.value = res)); },
  { immediate: true }
)

const createForm = (usingFlow: boolean, ledger: boolean) => {
  usingWorkflow.value = usingFlow;
  isLedger.value = ledger;

  showFormEditor.value = true;
};

const createDashboard = () => {
  showDshEditor.value = true;
};

const createFolder = () => { };
</script>

<style lang="scss" scoped>
.has-logo {
  .el-scrollbar {
    height: calc(100vh - $navbar-height);
  }
}

.app-title {
  display: flex;
  overflow: hidden;
  padding: 16px;
  font-size: 20px;
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

:deep(.el-menu-item) {
  line-height: 40px;
  height: 40px;
}
</style>
