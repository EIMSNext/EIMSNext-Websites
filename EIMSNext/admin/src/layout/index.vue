<template>
  <div class="wh-full layout-left" :class="classObj">
    <el-container style="height: 100vh;">
      <el-header style="height: 50px; padding: 0 12px">
        <NavBar />
      </el-header>
      <el-container style="height: calc(100vh - 50px); border-top: 1px solid var(--el-menu-border-color)">
        <el-aside width="45px" class="main-left-menu">
          <el-tooltip :content="t('route.workspace')" placement="right" :hide-after="0">
            <AppLink :to="{
              path: '/workspace',
            }">
              <div class="main-left-menu-item">
                <et-icon icon="homepage" size="18px" :color="getAppIconColor()"></et-icon>
              </div>
            </AppLink>
          </el-tooltip>
          <template v-if="curUser.userType == UserType.CorpOwmer || curUser.userType == UserType.CorpAdmin">
            <el-tooltip :content="t('route.system')" placement="right" :hide-after="0">
              <AppLink :to="{
                path: '/system/department',
              }">
                <div class="main-left-menu-item">
                  <et-icon icon="el-Notebook" size="18px" :color="getAppIconColor()"></et-icon>
                </div>
              </AppLink>
            </el-tooltip>
          </template>
          <el-divider style="margin: 3px 0" />
          <template v-for="app in appsRef">
            <template v-if="app.id != 'system'">
              <el-tooltip :content="app.name" placement="right" :hide-after="0">
                <AppLink :to="{
                  path: `/app/${app.id}/mytasks`,
                }">
                  <div class="main-left-menu-item">
                    <et-icon :icon="getAppIcon(app)" size="18px" :color="getAppIconColor()"></et-icon>
                  </div>
                </AppLink>
              </el-tooltip></template>
          </template>
        </el-aside>
        <el-main style="padding: 0">
          <slot></slot>
        </el-main>
      </el-container>
    </el-container>
    <Settings v-if="defaultSettings.showSettings" />
  </div>
</template>

<script setup lang="ts">
import { useSystemStore } from "@/store";
import { useAppStore, useUserStore } from "@eimsnext/store";
import NavBar from "./components/NavBar/index.vue";
import defaultSettings from "@/settings";
import { getAppIcon, getAppIconColor } from "@/utils/common";
import { useI18n } from "vue-i18n";
import { UserType } from "@eimsnext/models";
const { t } = useI18n()

defineOptions({
  name: "Layout",
});

const systemStore = useSystemStore();

const userStore = useUserStore()
const appStore = useAppStore();
const { items: appsRef } = storeToRefs(appStore);
const curUser = toRef(userStore.currentUser)

const classObj = computed(() => ({
  hideSidebar: !systemStore.sidebar.opened,
  openSidebar: systemStore.sidebar.opened,
}));

</script>

<style lang="scss" scoped>
.main-left-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid var(--el-menu-border-color);
}

.main-left-menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  height: 40px;
  cursor: pointer;
  box-sizing: border-box;
}
</style>
