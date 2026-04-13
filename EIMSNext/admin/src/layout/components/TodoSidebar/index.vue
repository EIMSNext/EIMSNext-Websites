<template>
  <div>
    <div class="app-title">
      <et-icon icon="icon-mytodo" size="16px" class="step-image"></et-icon>
      <span v-if="isSidebarOpened" class="ml-[10px]">{{ t("admin.flowcenter") }}</span>
      <el-button class="side-bar-control" @click.stop="toggleSideBar">
        <et-icon v-if="isSidebarOpened" icon="el-DArrowLeft" size="14px"></et-icon>
        <et-icon v-else icon="el-DArrowRight" size="14px"></et-icon>
      </el-button>
    </div>
    <div v-if="isSidebarOpened">
      <el-menu
        mode="vertical"
        :default-active="defaultActiveMenu"
        :default-openeds="defaultOpenedMenus"
        @select="handleMenuSelect"
        class="todo-sidebar-menu"
      >
        <!-- 我的待办 -->
        <el-sub-menu index="mytasks">
          <template #title>
            <el-badge :is-dot="hasCorpTodo" :offset="[0, 8]">
              <et-icon icon="icon-mytodo" size="14px" class="step-image" />
            </el-badge>
            <span class="app-menu-text" @click.stop="goToTaskType('mytasks')">
              {{ t("common.wfProcess.mytasks") }}
            </span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item
              v-if="app.id !== 'system'"
              :index="`mytasks-${app.id}`"
              @click="selectApp(app, 'mytasks')"
            >
              <et-icon :icon="getAppIcon(app)" size="14px" :color="getAppIconColor(app)"></et-icon>
              <span class="app-menu-text">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 我发起的 -->
        <el-sub-menu index="mystarted">
          <template #title>
            <et-icon icon="icon-mystarted" size="14px" class="step-image" />
            <span class="app-menu-text" @click.stop="goToTaskType('mystarted')">
              {{ t("common.wfProcess.mystarted") }}
            </span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item
              v-if="app.id !== 'system'"
              :index="`mystarted-${app.id}`"
              @click="selectApp(app, 'mystarted')"
            >
              <et-icon :icon="getAppIcon(app)" size="14px" :color="getAppIconColor(app)"></et-icon>
              <span class="app-menu-text">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 我审核的 -->
        <el-sub-menu index="myapproved">
          <template #title>
            <et-icon icon="icon-myapproved" size="14px" class="step-image" />
            <span class="app-menu-text" @click.stop="goToTaskType('myapproved')">
              {{ t("common.wfProcess.myapproved") }}
            </span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item
              v-if="app.id !== 'system'"
              :index="`myapproved-${app.id}`"
              @click="selectApp(app, 'myapproved')"
            >
              <et-icon :icon="getAppIcon(app)" size="14px" :color="getAppIconColor(app)"></et-icon>
              <span class="app-menu-text">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 抄送我的 -->
        <el-sub-menu index="cctome">
          <template #title>
            <et-icon icon="icon-mycced" size="14px" class="step-image" />
            <span class="app-menu-text" @click.stop="goToTaskType('cctome')">
              {{ t("common.wfProcess.cctome") }}
            </span>
          </template>
          <template v-for="app in appsRef" :key="app.id">
            <el-menu-item
              v-if="app.id !== 'system'"
              :index="`cctome-${app.id}`"
              @click="selectApp(app, 'cctome')"
            >
              <et-icon :icon="getAppIcon(app)" size="14px" :color="getAppIconColor(app)"></et-icon>
              <span class="app-menu-text">{{ app.name }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
      </el-menu>
    </div>
    <div v-else>
      <el-menu
        mode="vertical"
        :default-active="defaultActiveMenu"
        :default-openeds="defaultOpenedMenus"
        @select="handleMenuSelect"
        class="todo-sidebar-menu"
      >
        <!-- 我的待办 -->
        <el-menu-item index="mytasks" class="pl-15px" @click.stop="goToTaskType('mytasks')">
          <el-badge :is-dot="hasCorpTodo" :offset="[0, 8]">
            <et-icon icon="icon-mytodo" size="14px" class="step-image" />
          </el-badge>
        </el-menu-item>

        <!-- 我发起的 -->
        <el-menu-item index="mystarted" class="pl-15px" @click.stop="goToTaskType('mystarted')">
          <et-icon icon="icon-mystarted" size="14px" class="step-image" />
        </el-menu-item>

        <!-- 我审核的 -->
        <el-menu-item index="myapproved" class="pl-15px" @click.stop="goToTaskType('myapproved')">
          <et-icon icon="icon-myapproved" size="14px" class="step-image" />
        </el-menu-item>

        <!-- 抄送我的 -->
        <el-menu-item index="cctome" class="pl-15px" @click.stop="goToTaskType('cctome')">
          <et-icon icon="icon-mycced" size="14px" class="step-image" />
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "TodoSidebar",
});

import { ref, computed, onBeforeUnmount, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSystemStore } from "@/store";
import { useAppStore } from "@eimsnext/store";
import { App } from "@eimsnext/models";
import { getAppIcon, getAppIconColor } from "@/utils/common";
import { useI18n } from "vue-i18n";
import { BADGE_REFRESH_INTERVAL, queryCorpTodoCount } from "@/utils/badge";

const appStore = useAppStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const currentPath = computed(() => route.path);

const defaultActiveMenu = computed(() => {
  const appId = route.query.appId as string;
  if (!appId) return currentPath.value.substring(1);

  switch (currentPath.value) {
    case "/mytasks":
      return `mytasks-${appId}`;
    case "/mystarted":
      return `mystarted-${appId}`;
    case "/myapproved":
      return `myapproved-${appId}`;
    case "/cctome":
      return `cctome-${appId}`;
    default:
      return currentPath.value.substring(1);
  }
});

const defaultOpenedMenus = computed(() => {
  return [currentPath.value.substring(1)];
});

const systemStore = useSystemStore();
const isSidebarOpened = computed(() => systemStore.sidebar.opened);
function toggleSideBar() {
  systemStore.toggleSidebar();
}

const appsRef = ref<App[]>([]);
const corpTodoCount = ref(0);
const hasCorpTodo = computed(() => corpTodoCount.value > 0);
let corpTodoTimer: ReturnType<typeof setInterval> | null = null;

const selectApp = (app: App, taskType: string) => {
  let routePath = `/mystarted`;
  switch (taskType) {
    case "mytasks":
      routePath = `/mytasks`;
      break;
    case "mystarted":
      routePath = `/mystarted`;
      break;
    case "myapproved":
      routePath = `/myapproved`;
      break;
    case "cctome":
      routePath = `/cctome`;
      break;
  }

  router.push({
    path: routePath,
    query: { appId: app.id },
  });
};

const goToTaskType = (taskType: string) => {
  let routePath = `/mystarted`;
  switch (taskType) {
    case "mytasks":
      routePath = `/mytasks`;
      break;
    case "mystarted":
      routePath = `/mystarted`;
      break;
    case "myapproved":
      routePath = `/myapproved`;
      break;
    case "cctome":
      routePath = `/cctome`;
      break;
  }

  router.push({
    path: routePath,
    query: {},
  });
};

const handleMenuSelect = () => {};

const loadCorpTodoCount = async () => {
  corpTodoCount.value = await queryCorpTodoCount();
};

onMounted(async () => {
  await appStore.load();
  appsRef.value = appStore.items;
  await loadCorpTodoCount();

  corpTodoTimer = setInterval(() => {
    loadCorpTodoCount();
  }, BADGE_REFRESH_INTERVAL);
});

onBeforeUnmount(() => {
  if (corpTodoTimer) {
    clearInterval(corpTodoTimer);
    corpTodoTimer = null;
  }
});
</script>

<style lang="scss" scoped>
.side-bar-control {
  border: none;
  position: absolute;
  top: var(--et-space-10);
  right: var(--et-space-0);
}

.app-title {
  display: flex;
  overflow: hidden;
  padding: var(--et-space-15);
  font-size: var(--et-font-size-16);
  align-items: center;
}

.form-action {
  display: flex;
  padding: 0 var(--et-space-8);
  margin-bottom: var(--et-space-5);
}

.step-image {
  color: var(--et-color-primary);
}

.app-menu-text {
  margin-left: var(--et-space-5);
}

:deep(.el-sub-menu__title) {
  line-height: var(--et-line-height-40);
  height: var(--et-size-40);
}

:deep(.el-menu-item) {
  line-height: var(--et-line-height-40);
  height: var(--et-size-40);
}

:deep(.el-sub-menu__title:hover),
:deep(.el-menu-item:hover),
:deep(.el-menu-item.is-active) {
  background-color: var(--et-bg-hover) !important;
}
</style>
