<template>
  <Layout>
    <!-- 公用侧边栏 -->
    <div class="sidebar-container">
      <!-- 顶部布局顶部 || 左侧布局左侧 -->
      <div class="sys-menu-wrap">
        <el-menu mode="vertical" :default-active="route.path">
          <div v-for="group in menuGroups" :key="group.title" class="menu-group">
            <div class="group-title">{{ $t(group.title) }}</div>
            <router-link v-for="item in group.items" :key="item.path" custom :to="{ path: resolveFullPath(item.path) }" v-slot="{ navigate }">
              <el-menu-item :index="resolveFullPath(item.path)" @click="() => navigate()">
                <et-icon :icon="item.icon" class="step-image" size="14px" />
                <span class="app-menu-text">{{ $t(item.label) }}</span>
              </el-menu-item>
            </router-link>
          </div>
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
import { useUserStore } from "@eimsnext/store";
import { UserType } from "@eimsnext/models";
import SysMain from "./SysMain/index.vue";

interface SysMenuItem {
  path: string;
  icon: string;
  label: string;
  visible?: boolean;
}

interface SysMenuGroup {
  title: string;
  items: SysMenuItem[];
}

const userStore = useUserStore();
const curUser = toRef(userStore.currentUser);
const route = useRoute();
const wfbasePath = `/system/`;
const resolveFullPath = (routePath: string) => routePath.startsWith("/") ? routePath : wfbasePath + routePath;
const isCorpAdmin = computed(() => curUser.value.userType == UserType.CorpAdmin);
const isPlatAdmin = computed(() => curUser.value.userType == UserType.PlatAdmin);
const isUnrestrictedAdmin = computed(() =>
  curUser.value.userType == UserType.CorpOwmer || curUser.value.userType == UserType.CorpAdmin,
);

const menuGroups = computed<SysMenuGroup[]>(() => {
  if (isPlatAdmin.value) {
    return [{
      title: "admin.platformAdmin.navigation",
      items: [{ path: "/platform-admin", icon: "el-Setting", label: "admin.platformAdmin.title" }],
    }];
  }

  const groups: SysMenuGroup[] = [
    {
      title: "admin.shellMenu.contacts",
      items: [
        { path: "department", icon: "icon-organization", label: "admin.shellMenu.org" },
        { path: "role", icon: "icon-role", label: "admin.shellMenu.role" },
      ],
    },
    {
      title: "admin.shellMenu.permissionCenter",
      items: [{ path: "admin", icon: "icon-admin", label: "admin.shellMenu.admin", visible: isUnrestrictedAdmin.value }],
    },
    {
      title: "admin.shellMenu.logAudit",
      items: [{ path: "corp-log", icon: "icon-admin", label: "admin.shellMenu.corpLog", visible: isUnrestrictedAdmin.value }],
    },
    {
      title: "admin.shellMenu.managementTools",
      items: [
        {
          path: "flow-manage",
          icon: "tree",
          label: "admin.shellMenu.flowManage",
          visible: isCorpAdmin.value,
        },
      ],
    },
  ];

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.visible !== false),
    }))
    .filter((group) => group.items.length > 0);
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

.menu-group + .menu-group {
  margin-top: 14px;
}

.group-title {
  padding: 0 14px 6px;
  color: var(--et-text-secondary);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

:deep(.el-menu-item) {
  line-height: var(--et-line-height-40);
  height: var(--et-size-40);
}
</style>
