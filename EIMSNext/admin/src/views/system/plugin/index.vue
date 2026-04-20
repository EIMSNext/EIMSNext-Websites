<template>
  <div class="plugin-status-container">
    <el-card shadow="never" class="plugin-status-card">
      <et-toolbar :left-group="leftBars" />
      <el-table v-loading="loading" :data="plugins" style="width: 100%">
        <el-table-column prop="pluginId" label="Plugin ID" min-width="180" />
        <el-table-column prop="name" label="名称" min-width="180" />
        <el-table-column prop="version" label="当前版本" width="120" />
        <el-table-column label="功能数" width="100">
          <template #default="scope">
            {{ scope.row.functions?.length ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="240" />
      </el-table>

      <div v-if="reloadItems.length > 0" class="reload-result mt-[16px]">
        <div class="reload-header">
          <div class="reload-title">最近一次 reload 结果</div>
          <div v-if="lastReloadTime" class="reload-time">{{ lastReloadTime }}</div>
        </div>
        <el-alert
          v-if="hasUnloadWarnings"
          class="mb-[12px]"
          type="warning"
          :closable="false"
          title="存在旧版本未释放的插件，请检查是否仍有引用未结束"
        />
        <el-table :data="reloadItems" size="small">
          <el-table-column prop="pluginId" label="Plugin ID" min-width="160" />
          <el-table-column label="结果" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.updated ? 'success' : 'info'">
                {{ scope.row.updated ? '已更新' : '无变化' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="previousVersion" label="旧版本" width="120" />
          <el-table-column prop="currentVersion" label="当前版本" width="120" />
          <el-table-column label="卸载结果" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.unloadedOldVersion ? 'success' : 'warning'">
                {{ scope.row.unloadedOldVersion ? '已释放' : '仍被引用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="信息" min-width="220" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ToolbarItem } from "@eimsnext/components";
import { systemService } from "@eimsnext/services";

interface PluginRuntimeInfo {
  pluginId: string;
  name: string;
  version: string;
  description?: string;
  functions?: { id: string; name: string }[];
}

interface PluginReloadItemResult {
  pluginId: string;
  previousVersion?: string;
  currentVersion?: string;
  updated: boolean;
  unloadedOldVersion: boolean;
  message?: string;
}

interface PluginReloadResult {
  items?: PluginReloadItemResult[];
}

type PluginSystemService = typeof systemService & {
  getPlugins(): Promise<PluginRuntimeInfo[]>;
  reloadPlugin(): Promise<PluginReloadResult>;
};

defineOptions({
  name: "PluginStatusPage",
});

const loading = ref(false);
const plugins = ref<PluginRuntimeInfo[]>([]);
const reloadItems = ref<PluginReloadItemResult[]>([]);
const lastReloadTime = ref("");
const pluginSystemService = systemService as PluginSystemService;

const hasUnloadWarnings = computed(() => reloadItems.value.some((item) => item.updated && !item.unloadedOldVersion));

const loadPlugins = async () => {
  loading.value = true;
  try {
    plugins.value = await pluginSystemService.getPlugins();
  } finally {
    loading.value = false;
  }
};

const reloadPlugins = async () => {
  loading.value = true;
  try {
    const result = await pluginSystemService.reloadPlugin();
    reloadItems.value = result.items ?? [];
    lastReloadTime.value = new Date().toLocaleString();
    plugins.value = await pluginSystemService.getPlugins();
  } finally {
    loading.value = false;
  }
};

const leftBars = ref<ToolbarItem[]>([
  {
    type: "button",
    config: {
      text: "刷新",
      type: "primary",
      command: "refresh",
      visible: true,
      icon: "el-refresh",
      onCommand: loadPlugins,
    },
  },
  {
    type: "button",
    config: {
      text: "Reload Plugins",
      type: "success",
      command: "reload",
      visible: true,
      icon: "el-upload",
      onCommand: reloadPlugins,
    },
  },
]);

onMounted(loadPlugins);
</script>

<style scoped lang="scss">
.plugin-status-container {
  padding: var(--et-space-16);
}

.plugin-status-card {
  min-height: calc(100vh - 160px);
}

.reload-title {
  font-weight: 600;
}

.reload-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--et-space-8);
}

.reload-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
