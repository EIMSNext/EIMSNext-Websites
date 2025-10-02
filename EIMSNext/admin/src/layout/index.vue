<template>
  <div class="wh-full" :class="classObj">
    <el-container>
      <el-header style="height: 50px; padding:0 12px">
        <NavBar />
      </el-header>
      <el-container style="border-top: 1px solid var(--el-menu-border-color);">
        <el-aside width="45px" class="main-left-menu">
          <el-tooltip content="工作台" placement="right" :hide-after="0">
            <AppLink :to="{
              path: '/dashboard',
            }">
              <div class="main-left-menu-item">
                <et-icon icon="homepage" size="20px"></et-icon>
              </div>
            </AppLink>
          </el-tooltip>
          <el-tooltip content="通讯录" placement="right" :hide-after="0">
            <AppLink :to="{
              path: '/system',
            }">
              <div class="main-left-menu-item">
                <et-icon icon="el-icon-Notebook" size="20px" :color="getAppIconColor()"></et-icon>
              </div>
            </AppLink>
          </el-tooltip>
          <el-divider style="margin: 3px 0" />
          <template v-for="app in appsRef">
            <el-tooltip :content="app.name" placement="right" :hide-after="0">
              <AppLink :to="{
                path: `/app/${app.id}`,
              }">
                <div class="main-left-menu-item">
                  <et-icon :icon="getAppIcon(app)" size="20px" :color="getAppIconColor()"></et-icon>
                </div>
              </AppLink>
            </el-tooltip>
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
import { useSystemStore, useSettingsStore, usePermissionStore } from "@/store";
import { useAppStore } from "@eimsnext/store";
import { DeviceEnum } from "@/enums/DeviceEnum";
import NavBar from "./components/NavBar/index.vue";
import defaultSettings from "@/settings"
import { getAppIcon, getAppIconColor } from "@/utils/common";

defineOptions({
  name: "Layout",
});

const systemStore = useSystemStore();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const { items: appsRef } = storeToRefs(appStore);
const width = useWindowSize().width;

const WIDTH_DESKTOP = 992; // 响应式布局容器固定宽度  大屏（>=1200px） 中屏（>=992px） 小屏（>=768px）
const isMobile = computed(() => systemStore.device === DeviceEnum.MOBILE);
const isOpenSidebar = computed(() => systemStore.sidebar.opened);
// const layout = computed(() => settingsStore.layout); // 布局模式 left top mix

const classObj = computed(() => ({
  hideSidebar: !systemStore.sidebar.opened,
  openSidebar: systemStore.sidebar.opened,
  mobile: systemStore.device === DeviceEnum.MOBILE,
  // [`layout-${settingsStore.layout}`]: true,
}));

watchEffect(() => {
  systemStore.toggleDevice(width.value < WIDTH_DESKTOP ? DeviceEnum.MOBILE : DeviceEnum.DESKTOP);
  if (width.value >= WIDTH_DESKTOP) {
    systemStore.openSideBar();
  } else {
    systemStore.closeSideBar();
  }
});

const route = useRoute();
watch(route, () => {
  if (isMobile.value && isOpenSidebar.value) {
    systemStore.closeSideBar();
  }
});
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
