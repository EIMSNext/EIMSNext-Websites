<template>
  <div :class="{ 'has-logo': sidebarLogo }" class="todo-sidebar-container">
    <div class="app-title">
      <et-icon icon="iconfont-mytodo" size="20px" class="step-image"></et-icon>
      <span class="ml-[10px]">{{ t('admin.flowcenter') }}</span>
    </div>
    <div>
      <el-menu mode="vertical" :default-active="defaultActiveMenu" :default-openeds="defaultOpenedMenus"
        @select="handleMenuSelect" class="todo-sidebar-menu">
        <!-- 我的待办 -->
        <el-sub-menu index="mytasks">
          <template #title>
            <et-icon icon="iconfont-mytodo" class="step-image" />
            <span @click.stop="goToTaskType('mytasks')">{{ t("common.wfProcess.mytasks") }}</span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item v-if="app.id !== 'system'" :index="`mytasks-${app.id}`" @click="selectApp(app, 'mytasks')">
              <et-icon :icon="getAppIcon(app)" size="16px" :color="getAppIconColor(app)"></et-icon>
              <span class="ml-1">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 我发起的 -->
        <el-sub-menu index="mystarted">
          <template #title>
            <et-icon icon="iconfont-mystarted" class="step-image" />
            <span @click.stop="goToTaskType('mystarted')">{{ t("common.wfProcess.mystarted") }}</span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item v-if="app.id !== 'system'" :index="`mystarted-${app.id}`"
              @click="selectApp(app, 'mystarted')">
              <et-icon :icon="getAppIcon(app)" size="16px" :color="getAppIconColor(app)"></et-icon>
              <span class="ml-1">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 我审核的 -->
        <el-sub-menu index="myapproved">
          <template #title>
            <et-icon icon="iconfont-myapproved" class="step-image" />
            <span @click.stop="goToTaskType('myapproved')">{{ t("common.wfProcess.myapproved") }}</span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item v-if="app.id !== 'system'" :index="`myapproved-${app.id}`"
              @click="selectApp(app, 'myapproved')">
              <et-icon :icon="getAppIcon(app)" size="16px" :color="getAppIconColor(app)"></et-icon>
              <span class="ml-1">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 抄送我的 -->
        <el-sub-menu index="cctome">
          <template #title>
            <et-icon icon="iconfont-mycced" class="step-image" />
            <span @click.stop="goToTaskType('cctome')">{{ t("common.wfProcess.cctome") }}</span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item v-if="app.id !== 'system'" :index="`cctome-${app.id}`" @click="selectApp(app, 'cctome')">
              <et-icon :icon="getAppIcon(app)" size="16px" :color="getAppIconColor(app)"></et-icon>
              <span class="ml-1">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
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
import { useSettingsStore } from "@/store";
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

const sidebarLogo = computed(() => settingsStore.sidebarLogo);
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

:deep(.el-sub-menu__title) {
  line-height: 40px;
  height: 40px;
}

:deep(.el-menu-item) {
  line-height: 40px;
  height: 40px;
}
</style>