<template>
  <Layout>
    <!-- 公用侧边栏 -->
    <div class="sidebar-container">
      <!-- 顶部布局顶部 || 左侧布局左侧 -->
      <div class="sys-menu-wrap">
        <el-menu mode="vertical">
          <router-link custom :to="{ path: resolveFullPath('department') }" v-slot="{ navigate }">
            <el-menu-item index="department" @click="navigate">
              <et-icon icon="icon-organization" class="step-image" size="14px" />
              <span class="app-menu-text">内部组织</span>
            </el-menu-item>
          </router-link>
          <router-link custom :to="{ path: resolveFullPath('role') }" v-slot="{ navigate }">
            <el-menu-item index="role" @click="navigate">
              <et-icon icon="icon-role" class="step-image" size="14px" />
              <span class="app-menu-text">角色</span>
            </el-menu-item>
          </router-link>
          <router-link custom :to="{ path: resolveFullPath('admin') }" v-slot="{ navigate }">
            <el-menu-item index="admin" @click="navigate">
              <et-icon icon="icon-admin" class="step-image" size="14px" />
              <span class="app-menu-text">管理员</span>
            </el-menu-item>
          </router-link>
          <router-link custom :to="{ path: resolveFullPath('corp-log') }" v-slot="{ navigate }">
            <el-menu-item index="corp-log" @click="navigate">
              <et-icon icon="icon-admin" class="step-image" size="14px" />
              <span class="app-menu-text">企业日志</span>
            </el-menu-item>
          </router-link>
        </el-menu>
      </div>
    </div>
    <!-- 左侧和顶部布局 -->
    <div class="main-container">
      <SysMain />
      <!-- 返回顶部 -->
      <el-backtop target=".main-container">
        <et-icon icon="backtop" size="24px" />
      </el-backtop>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "@/layout/index.vue";
import SysMain from "./SysMain/index.vue";

const wfbasePath = `/system/`;
const resolveFullPath = (routePath: string) => wfbasePath + routePath;

onBeforeMount(async () => { });
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
  overflow: hidden;
  transition: margin-left 0.28s;

  .fixed-header {
    position: sticky;
    top: 0;
    z-index: 9;
    transition: width 0.28s;
  }
}

.step-image {
  color: var(--et-color-primary);
}

.app-menu-text {
  margin-left: var(--et-space-5);
}

.sys-menu-wrap {
  margin-top: var(--et-space-10);
}

:deep(.el-menu-item) {
  line-height: var(--et-line-height-40);
  height: var(--et-size-40);
}
</style>
