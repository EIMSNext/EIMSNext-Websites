<template>
  <Layout>
    <!-- 公用侧边栏 -->
    <Sidebar class="sidebar-container" />
    <!-- 遮罩层 -->
    <div v-if="isOpenSidebar" class="wh-full fixed-lt z-999 bg-black bg-opacity-30" @click="handleOutsideClick" />
    <!-- 左侧和顶部布局 -->
    <div :class="{ hasTagsView: showTagsView }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }" class="tag-header">
        <TagsView v-if="showTagsView" />
      </div>
      <AppMain />
      <!-- 返回顶部 -->
      <el-backtop target=".main-container">
        <et-icon icon="backtop" size="24px" />
      </el-backtop>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "@/layout/index.vue";
import { useSystemStore, useSettingsStore } from "@/store";
import { useContextStore } from "@eimsnext/store";
import AppMain from "./AppMain/index.vue"

const contextStore = useContextStore();
const systemStore = useSystemStore();
const settingsStore = useSettingsStore();
const isOpenSidebar = computed(() => systemStore.sidebar.opened);
const fixedHeader = computed(() => settingsStore.fixedHeader); // 是否固定header
const showTagsView = computed(() => settingsStore.tagsView); // 是否显示tagsView
const route = useRoute();

function handleOutsideClick() {
  systemStore.closeSideBar();
}

onBeforeMount(async () => {
  let appId = route.params.appId.toString();
  await contextStore.setAppId(appId);
});
</script>

<style lang="scss" scoped>
.sidebar-container {
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

// .hideSidebar {
//   .main-container {
//     margin-left: $sidebar-width-collapsed;
//   }
// }

// .layout-left.hideSidebar {
//   .sidebar-container {
//     width: $sidebar-width-collapsed !important;
//   }

//   .main-container {
//     margin-left: $sidebar-width-collapsed;
//   }
// }

// }</style>
