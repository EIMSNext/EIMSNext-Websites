<template>
  <div class="navbar">
    <div class="navbar__left">
      <!--  -->
      <et-icon icon="el-icon-Grid" size="24"></et-icon>
      <!-- 展开/收缩菜单  -->
      <Hamburger :is-active="isSidebarOpened" @toggle-click="toggleSideBar" />
    </div>
    <!-- 导航栏右侧 -->
    <NavbarRight />
  </div>
</template>

<script setup lang="ts">
import { useSystemStore } from "@/store";

const appStore = useSystemStore();

// 侧边栏是否打开
const isSidebarOpened = computed(() => appStore.sidebar.opened);

// 展开/收缩菜单
function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  height: $navbar-height;
  background: var(--el-bg-color);

  &__left {
    display: flex;
    align-items: center;
  }
}
</style>
