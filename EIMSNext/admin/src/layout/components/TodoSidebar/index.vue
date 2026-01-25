<template>
  <div>
    <div class="app-title">
      <et-icon icon="iconfont-mytodo" size="16px" class="step-image"></et-icon>
      <span v-if="isSidebarOpened" class="ml-[10px]">{{ t('admin.flowcenter') }}</span>
      <el-button class="side-bar-control" @click.stop="toggleSideBar"> <et-icon v-if="isSidebarOpened"
          icon="el-icon-DArrowLeft" size="14px"></et-icon>
        <et-icon v-else icon="el-icon-DArrowRight" size="14px"></et-icon>
      </el-button>
    </div>
    <div v-if="isSidebarOpened">
      <el-menu mode="vertical" :default-active="defaultActiveMenu" :default-openeds="defaultOpenedMenus"
        @select="handleMenuSelect" class="todo-sidebar-menu">
        <!-- 我的待办 -->
        <el-sub-menu index="mytasks">
          <template #title>
            <et-icon icon="iconfont-mytodo" size="14px" class="step-image" />
            <span class="app-menu-text" @click.stop="goToTaskType('mytasks')">{{ t("common.wfProcess.mytasks")
            }}</span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item v-if="app.id !== 'system'" :index="`mytasks-${app.id}`" @click="selectApp(app, 'mytasks')">
              <et-icon :icon="getAppIcon(app)" size="14px" :color="getAppIconColor(app)"></et-icon>
              <span class="app-menu-text">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 我发起的 -->
        <el-sub-menu index="mystarted">
          <template #title>
            <et-icon icon="iconfont-mystarted" size="14px" class="step-image" />
            <span class="app-menu-text" @click.stop="goToTaskType('mystarted')">{{ t("common.wfProcess.mystarted")
            }}</span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item v-if="app.id !== 'system'" :index="`mystarted-${app.id}`"
              @click="selectApp(app, 'mystarted')">
              <et-icon :icon="getAppIcon(app)" size="14px" :color="getAppIconColor(app)"></et-icon>
              <span class="app-menu-text">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 我审核的 -->
        <el-sub-menu index="myapproved">
          <template #title>
            <et-icon icon="iconfont-myapproved" size="14px" class="step-image" />
            <span class="app-menu-text" @click.stop="goToTaskType('myapproved')">{{ t("common.wfProcess.myapproved")
            }}</span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item v-if="app.id !== 'system'" :index="`myapproved-${app.id}`"
              @click="selectApp(app, 'myapproved')">
              <et-icon :icon="getAppIcon(app)" size="14px" :color="getAppIconColor(app)"></et-icon>
              <span class="app-menu-text">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 抄送我的 -->
        <el-sub-menu index="cctome">
          <template #title>
            <et-icon icon="iconfont-mycced" size="14px" class="step-image" />
            <span class="app-menu-text" @click.stop="goToTaskType('cctome')">{{ t("common.wfProcess.cctome") }}</span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item v-if="app.id !== 'system'" :index="`cctome-${app.id}`" @click="selectApp(app, 'cctome')">
              <et-icon :icon="getAppIcon(app)" size="14px" :color="getAppIconColor(app)"></et-icon>
              <span class="app-menu-text">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
      </el-menu>
    </div>
    <div v-else>
      <el-menu mode="vertical" :default-active="defaultActiveMenu" :default-openeds="defaultOpenedMenus"
        @select="handleMenuSelect" class="todo-sidebar-menu">
        <!-- 我的待办 -->
        <el-menu-item index="mytasks" class="pl-15px" @click.stop="goToTaskType('mytasks')">
          <et-icon icon="iconfont-mytodo" size="14px" class="step-image" />
        </el-menu-item>

        <!-- 我发起的 -->
        <el-menu-item index="mystarted" class="pl-15px" @click.stop="goToTaskType('mystarted')">
          <et-icon icon="iconfont-mystarted" size="14px" class="step-image" />
        </el-menu-item>

        <!-- 我审核的 -->
        <el-menu-item index="myapproved" class="pl-15px" @click.stop="goToTaskType('myapproved')">
          <et-icon icon="iconfont-myapproved" size="14px" class="step-image" />
        </el-menu-item>

        <!-- 抄送我的 -->
        <el-menu-item index="cctome" class="pl-15px" @click.stop="goToTaskType('cctome')">
          <et-icon icon="iconfont-mycced" size="14px" class="step-image" />
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "TodoSidebar",
});

import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSettingsStore, useSystemStore } from "@/store";
import { useAppStore } from "@eimsnext/store";
import { App } from "@eimsnext/models";
import { getAppIcon, getAppIconColor } from "@/utils/common";
import { useI18n } from "vue-i18n";

const settingsStore = useSettingsStore();
const appStore = useAppStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

// 获取当前路由路径
const currentPath = computed(() => route.path);

// 默认激活的菜单
const defaultActiveMenu = computed(() => {
  const appId = route.query.appId as string;
  if (!appId) return currentPath.value.substring(1);

  // 根据当前路径和appId生成激活的菜单索引
  switch (currentPath.value) {
    case '/mytasks':
      return `mytasks-${appId}`;
    case '/mystarted':
      return `mystarted-${appId}`;
    case '/myapproved':
      return `myapproved-${appId}`;
    case '/cctome':
      return `cctome-${appId}`;
    default:
      return currentPath.value.substring(1);
  }
});

// 默认展开的菜单
const defaultOpenedMenus = computed(() => {
  // 总是展开当前路径对应的一级菜单
  return [currentPath.value.substring(1)];
});

const systemStore = useSystemStore();
const isSidebarOpened = computed(() => systemStore.sidebar.opened);
// 展开/收缩菜单
function toggleSideBar() {
  systemStore.toggleSidebar();
}

const appsRef = ref<App[]>([]);

// 选择应用和任务类型
const selectApp = (app: App, taskType: string) => {
  // 根据任务类型跳转到不同的路由
  let routePath = `/mystarted`;
  switch (taskType) {
    case 'mytasks':
      routePath = `/mytasks`;
      break;
    case 'mystarted':
      routePath = `/mystarted`;
      break;
    case 'myapproved':
      routePath = `/myapproved`;
      break;
    case 'cctome':
      routePath = `/cctome`;
      break;
  }

  // 使用查询参数传递appId
  router.push({
    path: routePath,
    query: { appId: app.id }
  });
};

// 跳转到任务类型页面，不带appId filter
const goToTaskType = (taskType: string) => {
  // 根据任务类型跳转到不同的路由
  let routePath = `/mystarted`;
  switch (taskType) {
    case 'mytasks':
      routePath = `/mytasks`;
      break;
    case 'mystarted':
      routePath = `/mystarted`;
      break;
    case 'myapproved':
      routePath = `/myapproved`;
      break;
    case 'cctome':
      routePath = `/cctome`;
      break;
  }

  // 跳转到对应任务类型的页面，不带appId filter
  router.push({
    path: routePath,
    query: {} // 清空查询参数
  });
};

// 处理菜单选择事件
const handleMenuSelect = (key: string, keyPath: string[]) => {
  // 处理菜单选择事件，如果需要的话
};

// 获取所有应用
onMounted(async () => {
  await appStore.load();
  appsRef.value = appStore.items;
});
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