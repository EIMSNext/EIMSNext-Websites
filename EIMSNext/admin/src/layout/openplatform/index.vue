<template>
  <Layout>
    <div class="open-shell">
      <aside class="open-sidebar">
        <div class="menu-group" v-for="group in menuGroups" :key="group.title">
          <div v-if="group.title" class="group-title">{{ group.title }}</div>
          <router-link v-for="item in group.items" :key="item.path" custom :to="item.path" v-slot="{ navigate }">
            <div class="open-menu-item" :class="{ active: route.path === item.path }" @click="navigate">
              <et-icon :icon="item.icon" size="14" />
              <span>{{ item.label }}</span>
            </div>
          </router-link>
        </div>
      </aside>
      <main class="open-content">
        <OpenMain />
      </main>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "@/layout/index.vue";
import OpenMain from "./OpenMain/index.vue";
import { useRoute } from "vue-router";

defineOptions({ name: "OpenPlatformLayout" });

const route = useRoute();

const menuGroups = [
  {
    title: "资源管理",
    items: [
      { path: "/open-platform/pluginstore", label: "插件中心", icon: "el-Shop" },
      { path: "/open-platform/plugin-manage", label: "插件管理", icon: "icon-settings" },
    ],
  },
  {
    title: "密钥管理",
    items: [
      { path: "/open-platform/api-key", label: "API Key", icon: "el-Key" },
      { path: "/open-platform/api-log", label: "API调用日志", icon: "el-Document" },
    ],
  },
  {
    title: "开发者工具",
    items: [{ path: "/open-platform/docs", label: "开发文档", icon: "el-Reading" }],
  },
];
</script>

<style scoped lang="scss">
.open-shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  min-height: calc(100vh - var(--et-size-50));
  background: var(--et-bg-page);
}

.open-sidebar {
  padding: 12px 10px;
  margin: 18px 0 18px 18px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--et-bg-container) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--et-border-color-light) 78%, transparent);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
}

.menu-group {
  margin-top: 14px;
}

.menu-group+.menu-group {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--et-border-color);
}

.group-title {
  padding: 0 10px 6px;
  color: var(--et-text-secondary);
  font-size: 14px;
  font-weight: 700;
}

.open-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--et-text-primary);
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
  font-size: 14px;
}

.open-menu-item:hover {
  background: color-mix(in srgb, var(--et-fill-color-light) 72%, transparent);
}

.open-menu-item.active {
  background: color-mix(in srgb, var(--et-color-primary) 14%, transparent);
  color: var(--et-color-primary);
  transform: translateX(2px);
}

.open-content {
  min-width: 0;
  padding: 18px 0 18px 0;
  margin-right: 18px;
}

:global(html.dark) .open-shell {
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
}

:global(html.dark) .open-sidebar {
  background: rgba(15, 23, 42, 0.82);
  box-shadow: 0 24px 54px rgba(2, 6, 23, 0.42);
}

@media (max-width: 960px) {
  .open-shell {
    grid-template-columns: 1fr;
  }

  .open-sidebar {
    margin: 16px 16px 0;
  }

  .open-content {
    padding: 16px;
    margin-right: 0;
  }
}
</style>
