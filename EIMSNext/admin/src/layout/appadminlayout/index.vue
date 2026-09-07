<template>
  <Layout>
    <div class="app-admin-sidebar">
      <div class="app-admin-title">
        <router-link :to="{ path: `/app/${appId}` }" class="back-link">
          <et-icon icon="el-arrow-left" size="16px" />
        </router-link>
        <span>{{ t("admin.appAdmin.title") }}</span>
      </div>
      <el-menu mode="vertical" :default-active="route.path">
        <div v-for="group in menuGroups" :key="group.titleKey" class="menu-group">
          <div class="group-title">{{ t(group.titleKey) }}</div>
          <router-link v-for="item in group.items" :key="item.path" custom :to="{ path: resolvePath(item.path) }" v-slot="{ navigate }">
            <el-menu-item :index="resolvePath(item.path)" @click="() => navigate()">
              <et-icon :icon="item.icon" class="step-image" size="14px" />
              <span class="app-menu-text">{{ t(item.labelKey) }}</span>
            </el-menu-item>
          </router-link>
        </div>
      </el-menu>
    </div>
    <div class="app-admin-main">
      <router-view />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "@/layout/index.vue";
import { useAdminPermissions } from "@/composables/useAdminPermissions";
import { useContextStore } from "@eimsnext/store";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const contextStore = useContextStore();
const appId = computed(() => route.params.appId?.toString() || "");
const { loadAdminPermissions, canManageAppId } = useAdminPermissions();
const { t } = useI18n();

const menuGroups = [
  {
    titleKey: "admin.appAdmin.settings",
    items: [
      { path: "permissions", icon: "share", labelKey: "admin.appAdmin.permissions" },
      { path: "cross-binding", icon: "icon-relation", labelKey: "admin.appAdmin.crossBinding" },
      { path: "settings", icon: "icon-settings", labelKey: "admin.appAdmin.settings" },
    ],
  },
  {
    titleKey: "admin.appAdmin.advancedFeatures",
    items: [
      { path: "aggregate", icon: "table", labelKey: "admin.appAdmin.aggregate" },
      { path: "event-flow", icon: "el-cpu", labelKey: "admin.advanced.eventFlow" },
      { path: "webhook", icon: "trend-charts", labelKey: "admin.webhook.title" },
    ],
  },
];

const resolvePath = (path: string) => `/app/${appId.value}/admin/${path}`;

watch(
  appId,
  async (value) => {
    if (!value) return;
    await contextStore.setAppId(value);
    await loadAdminPermissions();
    if (!canManageAppId(value)) {
      router.replace(`/app/${value}`);
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.app-admin-sidebar {
  background: var(--et-bg-page);
  bottom: 0;
  left: 45px;
  overflow: auto;
  position: fixed;
  top: var(--et-size-50);
  width: var(--et-size-200);
  z-index: 20;

  :deep(.el-menu) {
    border: none;
    background: transparent;
  }
}

.app-admin-title {
  align-items: center;
  display: flex;
  font-size: var(--et-font-size-16);
  font-weight: 700;
  gap: var(--et-space-8);
  height: var(--et-size-52);
  padding: 0 var(--et-space-16);
}

.back-link {
  color: var(--et-text-primary);
  display: inline-flex;
}

.app-admin-main {
  background: var(--et-bg-page);
  height: calc(100vh - var(--et-size-50));
  margin-left: var(--et-size-200);
  overflow: hidden;
}

.menu-group + .menu-group {
  margin-top: var(--et-space-16);
}

.group-title {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-13);
  padding: 0 var(--et-space-16) var(--et-space-6);
}

.step-image {
  color: var(--et-color-primary);
}

.app-menu-text {
  margin-left: var(--et-space-6);
}

:deep(.el-menu-item) {
  height: var(--et-size-40);
  line-height: var(--et-line-height-40);
}
</style>
