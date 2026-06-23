<template>
  <el-dialog v-model="visible" :title="t('admin.workbench.addChart')" width="520px" destroy-on-close>
    <el-input v-model="keyword" clearable :placeholder="t('admin.appAdmin.searchByName')">
      <template #prefix>
        <et-icon icon="el-search" />
      </template>
    </el-input>
    <el-scrollbar height="360px" class="chart-tree-scroll">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :filter-node-method="filterNode"
        node-key="id"
        default-expand-all
        highlight-current
        :props="{ label: 'label', children: 'children' }"
        @node-click="handleNodeClick"
      >
        <template #default="{ data }">
          <div class="chart-tree-node" :class="{ selected: data.kind === 'chart' && data.dashboardItemId === selected?.dashboardItemId }">
            <et-icon v-if="data.kind === 'app'" icon="icon-appdefault" />
            <et-icon v-else-if="data.kind === 'dashboard'" icon="el-DataAnalysis" />
            <et-icon v-else icon="el-PieChart" />
            <span>{{ data.label }}</span>
            <el-radio
              v-if="data.kind === 'chart'"
              :model-value="selected?.dashboardItemId"
              :value="data.dashboardItemId"
              @click.stop="handleNodeClick(data)"
            />
          </div>
        </template>
      </el-tree>
    </el-scrollbar>
    <template #footer>
      <el-button @click="visible = false">{{ t("common.cancel") }}</el-button>
      <el-button type="primary" :disabled="!selected" @click="confirm">{{ t("common.ok") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useWorkbenchStore } from "@/store";
import { useI18n } from "vue-i18n";

interface ChartTreeNode {
  id: string;
  label: string;
  kind: "app" | "dashboard" | "chart";
  appId?: string;
  dashboardId?: string;
  dashboardItemId?: string;
  children?: ChartTreeNode[];
}

defineOptions({
  name: "ChartSelectDialog",
});

const props = defineProps<{
  modelValue: boolean;
  dashboardItemId?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "select", value: { dashboardId: string; dashboardItemId: string; title: string }): void;
}>();

const workbenchStore = useWorkbenchStore();
const { t } = useI18n();
const { catalog } = storeToRefs(workbenchStore);
const treeRef = ref();
const keyword = ref("");
const selected = ref<{ dashboardId: string; dashboardItemId: string; title: string }>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const treeData = computed<ChartTreeNode[]>(() =>
  catalog.value
    .map((app) => ({
      id: `app:${app.id}`,
      label: app.name,
      kind: "app" as const,
      appId: app.id,
      children: (app.dashboards || []).map((dashboard) => ({
        id: `dashboard:${dashboard.id}`,
        label: dashboard.name,
        kind: "dashboard" as const,
        appId: app.id,
        dashboardId: dashboard.id,
        children: (dashboard.charts || []).map((chart) => ({
          id: `chart:${chart.id}`,
          label: chart.name,
          kind: "chart" as const,
          appId: app.id,
          dashboardId: chart.dashboardId,
          dashboardItemId: chart.id,
        })),
      })),
    }))
    .filter((app) => app.children.length > 0)
);

const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.label.includes(value);
};

const handleNodeClick = (data: ChartTreeNode) => {
  if (data.kind !== "chart" || !data.dashboardId || !data.dashboardItemId) {
    return;
  }

  selected.value = {
    dashboardId: data.dashboardId,
    dashboardItemId: data.dashboardItemId,
    title: data.label,
  };
};

const confirm = () => {
  if (!selected.value) return;
  emit("select", selected.value);
  visible.value = false;
};

const syncSelected = () => {
  const charts = treeData.value.flatMap((app) =>
    (app.children || []).flatMap((dashboard) => dashboard.children || [])
  );
  const matched = charts.find((chart) => chart.dashboardItemId === props.dashboardItemId);
  selected.value =
    matched && matched.dashboardId && matched.dashboardItemId
      ? { dashboardId: matched.dashboardId, dashboardItemId: matched.dashboardItemId, title: matched.label }
      : undefined;
};

watch(keyword, (value) => {
  treeRef.value?.filter(value);
});

watch(
  () => props.modelValue,
  async (value) => {
    if (!value) return;
    await workbenchStore.loadCatalog();
    syncSelected();
  }
);
</script>

<style lang="scss" scoped>
.chart-tree-scroll {
  margin-top: var(--et-space-12);
}

.chart-tree-node {
  align-items: center;
  display: flex;
  gap: var(--et-space-8);
  width: 100%;

  &.selected {
    color: var(--et-color-primary);
    font-weight: 600;
  }

  .el-radio {
    margin-left: auto;
  }
}
</style>
