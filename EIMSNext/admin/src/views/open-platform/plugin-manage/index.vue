<template>
  <div class="plugin-manage-page">
    <section class="table-shell">
      <div class="table-header">{{ $t("admin.openPlatform.installedPlugins") }}</div>
      <el-table v-loading="loading" :data="items" style="width: 100%">
        <el-table-column :label="$t('admin.openPlatform.plugin')" min-width="340">
          <template #default="scope">
            <div class="plugin-cell">
              <img v-if="scope.row.icon" class="plugin-icon" :src="scope.row.icon" :alt="scope.row.name" />
              <div>
                <div class="plugin-name">{{ scope.row.name }}</div>
                <div class="plugin-summary">{{ scope.row.summary }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="version" :label="$t('admin.openPlatform.version')" width="120" />
        <el-table-column prop="status" :label="$t('admin.openPlatform.status')" width="130" />
        <el-table-column :label="$t('admin.openPlatform.enable')" width="140">
          <template #default="scope">
            <el-switch :model-value="scope.row.enabled"
              @change="(value) => toggleEnabled(scope.row.id, value as boolean)" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('admin.openPlatform.action')" width="140">
          <template #default="scope">
            <el-button link type="danger" @click="removeInstall(scope.row.id)">{{ $t("admin.openPlatform.uninstall") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { PluginInstall } from "@eimsnext/models";
import { pluginProfileService } from "@eimsnext/services";

defineOptions({ name: "OpenPlatformPluginManagePage" });

const loading = ref(false);
const items = ref<PluginInstall[]>([]);

async function loadInstalls() {
  loading.value = true;
  try {
    items.value = await pluginProfileService.getInstalls();
  } finally {
    loading.value = false;
  }
}

async function toggleEnabled(id: string, enabled: boolean) {
  if (enabled) {
    await pluginProfileService.enableInstall(id);
  } else {
    await pluginProfileService.disableInstall(id);
  }
  await loadInstalls();
}

async function removeInstall(id: string) {
  await pluginProfileService.deleteInstall(id);
  await loadInstalls();
}

onMounted(loadInstalls);
</script>

<style scoped lang="scss">
.plugin-manage-page {
  min-height: 100%;
}

.table-header {
  align-items: center;
  border-bottom: 1px solid var(--et-border-color);
  display: flex;
  height: 40px;
  justify-content: space-between;
  padding: 0 var(--et-size-10);
  width: 100%;
  font-weight: 600;
  font-size: 16px;
}

.page-hero,
.table-shell {
  border: 1px solid color-mix(in srgb, var(--et-border-color-light) 78%, transparent);
  background: color-mix(in srgb, var(--et-bg-container) 98%, transparent);
  box-shadow: var(--et-shadow-md);
}

.page-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px;
  border-radius: var(--et-radius-10);
  background: color-mix(in srgb, var(--et-bg-container) 92%, transparent);
}

.page-kicker {
  color: var(--et-color-primary);
  font-size: 12px;
  font-weight: 700;
}

.page-title {
  margin: 8px 0 0;
  font-size: 32px;
}

.page-subtitle {
  margin-top: 8px;
  color: var(--et-text-secondary);
}

.table-shell {
  padding: 18px;
  border-radius: var(--et-radius-10);
}

.plugin-cell {
  display: flex;
  gap: 12px;
  align-items: center;
}

.plugin-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  object-fit: cover;
}

.plugin-name {
  font-weight: 700;
}

.plugin-summary {
  color: var(--et-text-secondary);
  margin-top: 4px;
}

:global(html.dark) .page-hero,
:global(html.dark) .table-shell {
  background: color-mix(in srgb, var(--et-bg-container) 82%, transparent);
  box-shadow: var(--et-shadow-overlay);
}

@media (max-width: 960px) {
  .page-hero {
    padding: 20px;
    align-items: flex-start;
    flex-direction: column;
  }

  .page-title {
    font-size: 26px;
  }
}
</style>
