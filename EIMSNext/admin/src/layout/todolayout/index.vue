<template>
  <Layout>
    <!-- 工作流侧边栏 -->
    <div class="todobar-container">
      <TodoSidebar />
    </div>
    <!-- 左侧和顶部布局 -->
    <div :class="{ hasTagsView: showTagsView }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }" class="tag-header">
        <TagsView v-if="showTagsView" />
      </div>
      <div class="app-main" :style="{ height: appMainHeight }">
        <router-view>
          <template #default="{ Component, route }">
            <transition enter-active-class="animate__animated animate__fadeIn" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="route.path" />
              </keep-alive>
            </transition>
          </template>
        </router-view>
      </div>
      <!-- 返回顶部 -->
      <el-backtop target=".main-container">
        <et-icon icon="backtop" size="24px" />
      </el-backtop>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Layout from "@/layout/index.vue";
import { useSystemStore, useSettingsStore, useTagsViewStore } from "@/store";
import TodoSidebar from "../components/TodoSidebar/index.vue";
import TagsView from "../components/TagsView/index.vue";
import variables from "@/styles/variables.module.scss";

const systemStore = useSystemStore();
const settingsStore = useSettingsStore();
const isOpenSidebar = computed(() => systemStore.sidebar.opened);
const fixedHeader = computed(() => settingsStore.fixedHeader); // 是否固定header
const showTagsView = computed(() => settingsStore.tagsView); // 是否显示tagsView
// 缓存页面集合
const cachedViews = computed(() => useTagsViewStore().cachedViews);

// 应用主区域高度
const appMainHeight = computed(() => {
  if (showTagsView.value) {
    return `calc(100vh - ${variables["navbar-height"]} - ${variables["tags-view-height"]})`;
  } else {
    return `calc(100vh - ${variables["navbar-height"]})`;
  }
});

function handleOutsideClick() {
  systemStore.closeSideBar();
}

</script>

<style lang="scss" scoped>
.todobar-container {
  position: fixed;
  z-index: 999;
  width: $sidebar-width;
  background-color: $menu-background;
  transition: width 0.28s;

  :deep(.el-menu) {
    border: none;
  }
}

.main-container {
  position: relative;
  height: 100%;
  margin-left: $sidebar-width;
  overflow-y: auto;
  transition: margin-left 0.28s;

  .fixed-header {
    position: sticky;
    top: 0;
    z-index: 9;
    transition: width 0.28s;
  }

  .tag-header {
    padding: 0 12px;
    background-color: var(--el-bg-color-page);
  }
}

.hideSidebar {
  .main-container {
    margin-left: $sidebar-width-collapsed;
  }
}

.layout-left.hideSidebar {
  .todobar-container {
    width: $sidebar-width-collapsed !important;
  }

  .main-container {
    margin-left: $sidebar-width-collapsed;
  }
}

.app-main {
  position: relative;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
  padding: 12px 12px 0;
}
</style>