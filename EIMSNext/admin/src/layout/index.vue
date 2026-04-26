<template>
  <div class="wh-full layout-left" :class="classObj">
    <el-container class="layout-shell">
      <el-header class="layout-header">
        <NavBar />
      </el-header>
      <el-container class="layout-main-shell">
        <el-aside width="45px" class="main-left-menu">
          <el-tooltip :content="t('route.workspace')" placement="right" :hide-after="0">
            <router-link custom :to="{ path: '/workspace' }" v-slot="{ navigate }">
              <div class="main-left-menu-item" @click="navigate">
                <!-- <AppIcon :app="workspaceApp" iconSize="12px" style="width: 22px;height: 22px;" /> -->
                <et-icon icon="homepage" size="18px" />
              </div>
            </router-link>
          </el-tooltip>
          <template
            v-if="curUser.userType == UserType.CorpOwmer || curUser.userType == UserType.CorpAdmin"
          >
            <el-tooltip :content="t('route.system')" placement="right" :hide-after="0">
              <router-link custom :to="{ path: '/system/department' }" v-slot="{ navigate }">
                <div class="main-left-menu-item" @click="navigate">
                  <!-- <AppIcon :app="systemApp" iconSize="12px" style="width: 22px;height: 22px;" /> -->
                  <et-icon icon="icon-settings" size="18px" />
                </div>
              </router-link>
            </el-tooltip>
          </template>
          <el-divider class="layout-divider" />
          <template v-for="app in appsRef">
            <template v-if="app.id != 'system'">
              <el-tooltip :content="app.name" placement="right" :hide-after="0">
                <router-link custom :to="{ path: `/app/${app.id}/mytasks` }" v-slot="{ navigate }">
                  <div class="main-left-menu-item" @click="navigate">
                    <AppIcon :app="app" iconSize="12px" style="width: 22px; height: 22px" />
                  </div>
                </router-link>
              </el-tooltip>
            </template>
          </template>
        </el-aside>
        <el-main class="layout-main">
          <slot></slot>
        </el-main>
      </el-container>
    </el-container>
    <Settings v-if="defaultSettings.showSettings" />
    <MessageCenter />
  </div>
</template>

<script setup lang="ts">
import { useSystemStore } from "@/store";
import { useAppStore, useUserStore } from "@eimsnext/store";
import NavBar from "./components/NavBar/index.vue";
import defaultSettings from "@/settings";
import { useI18n } from "vue-i18n";
import { App, UserType } from "@eimsnext/models";
const { t } = useI18n();

defineOptions({
  name: "Layout",
});

const workspaceApp: App = {
  id: "workspace",
  name: "工作台",
  icon: "homepage",
  sortIndex: -2,
  appMenus: [],
};
const systemApp: App = {
  id: "system",
  name: "系统设置",
  icon: "icon-settings",
  sortIndex: -1,
  appMenus: [],
};

const systemStore = useSystemStore();

const userStore = useUserStore();
const appStore = useAppStore();
const { items: appsRef } = storeToRefs(appStore);
const curUser = toRef(userStore.currentUser);

const classObj = computed(() => ({
  hideSidebar: !systemStore.sidebar.opened,
  openSidebar: systemStore.sidebar.opened,
}));
</script>

<style lang="scss" scoped>
.layout-shell {
  height: 100vh;
}

.layout-header {
  height: var(--et-size-50);
  padding: 0 var(--et-space-12);
}

.layout-main-shell {
  height: calc(100vh - var(--et-size-50));
  border-top: 1px solid var(--et-border-color-light);
}

.layout-divider {
  margin: var(--et-space-3) 0;
}

.layout-main {
  padding: var(--et-space-0);
}

.main-left-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid var(--et-border-color-light);
}

.main-left-menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  height: var(--et-size-40);
  cursor: pointer;
  box-sizing: border-box;
}
</style>
