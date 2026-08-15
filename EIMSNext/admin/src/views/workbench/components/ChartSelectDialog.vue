<template>
  <et-dialog
    v-model="visible"
    class="workbench-selection-dialog"
    :title="t('admin.workbench.addChart')"
    width="520px"
    destroy-on-close
  >
    <div class="workbench-dialog-content">
      <el-input v-model="keyword" clearable :placeholder="t('admin.appAdmin.searchByName')">
        <template #prefix><et-icon icon="el-search" /></template>
      </el-input>
      <el-scrollbar height="360px" class="chart-tree-scroll">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :filter-node-method="filterNode"
          node-key="id"
          default-expand-all
          :props="{ label: 'label', children: 'children' }"
          @node-click="toggleChart"
        >
          <template #default="{ data }">
            <div class="chart-tree-node" :class="{ selected: data.kind === 'chart' && isSelected(data) }">
              <span v-if="data.kind === 'app'" class="chart-tree-app-icon" :style="{ backgroundColor: data.iconColor }">
                <et-icon :icon="data.icon" color="#fff" size="12px" />
              </span>
              <et-icon v-else class="chart-tree-icon" :icon="data.icon" :style="{ color: data.iconColor }" size="18px" />
              <span class="chart-tree-label" :title="data.label">{{ data.label }}</span>
              <el-checkbox
                v-if="data.kind === 'chart'"
                :model-value="isSelected(data)"
                @click.stop
                @change="setSelected(data, $event)"
              />
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
    <template #footer>
      <div class="el-dialog__footer footer-wrapper">
        <div class="footer-left"></div>
        <div class="footer-right">
          <el-button @click="visible = false">{{ t("common.cancel") }}</el-button>
          <el-button type="primary" :disabled="!selectedIds.length" @click="confirm">{{ t("common.ok") }}</el-button>
        </div>
      </div>
    </template>
  </et-dialog>
</template>

<script setup lang="ts">
import { FormType, type AppDef, type AppMenu, type WorkbenchCatalogMenu } from "@eimsnext/models";
import { useWorkbenchStore } from "@/store";
import { getAppIcon, getAppIconColor, getFormIcon } from "@/utils/common";
import { useI18n } from "vue-i18n";

interface ChartTreeNode {
  id: string;
  label: string;
  kind: "app" | "dashboard" | "chart";
  icon: string;
  iconColor: string;
  dashboardId?: string;
  dashboardItemId?: string;
  children?: ChartTreeNode[];
}

interface ChartSelection {
  dashboardId: string;
  dashboardItemId: string;
  title: string;
}

defineOptions({ name: "ChartSelectDialog" });

const props = withDefaults(defineProps<{
  modelValue: boolean;
  selectedIds?: string[];
}>(), {
  selectedIds: () => [],
});
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "select", value: ChartSelection[]): void;
}>();

const workbenchStore = useWorkbenchStore();
const { t } = useI18n();
const { catalog } = storeToRefs(workbenchStore);
const treeRef = ref();
const keyword = ref("");
const selectedIds = ref<string[]>([]);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const findMenu = (menus: WorkbenchCatalogMenu[], dashboardId: string): WorkbenchCatalogMenu | undefined => {
  for (const menu of menus) {
    if (menu.id === dashboardId) return menu;
    const child = findMenu(menu.children || [], dashboardId);
    if (child) return child;
  }
  return undefined;
};

const getDashboardIcon = (menu: WorkbenchCatalogMenu | undefined, dashboardId: string) =>
  getFormIcon({
    menuId: dashboardId,
    menuType: FormType.Dashboard,
    icon: menu?.icon,
    iconColor: menu?.iconColor,
  } as AppMenu);

const getDashboardIconColor = (menu: WorkbenchCatalogMenu | undefined) =>
  getAppIconColor({ iconColor: menu?.iconColor, menuType: FormType.Dashboard });

const treeData = computed<ChartTreeNode[]>(() =>
  catalog.value
    .map((app) => ({
      id: `app:${app.id}`,
      label: app.name,
      kind: "app" as const,
      icon: getAppIcon(app as unknown as AppDef),
      iconColor: getAppIconColor(app),
      children: (app.dashboards || []).map((dashboard) => {
        const menu = findMenu(app.menus || [], dashboard.id);
        return {
          id: `dashboard:${dashboard.id}`,
          label: dashboard.name,
          kind: "dashboard" as const,
          icon: getDashboardIcon(menu, dashboard.id),
          iconColor: getDashboardIconColor(menu),
          children: (dashboard.charts || []).map((chart) => ({
            id: `chart:${chart.id}`,
            label: chart.name,
            kind: "chart" as const,
            icon: "el-TrendCharts",
            iconColor: "var(--et-color-primary)",
            dashboardId: chart.dashboardId,
            dashboardItemId: chart.id,
          })),
        };
      }),
    }))
    .filter((app) => app.children.length > 0)
);

const filterNode = (value: string, data: any) => !value || data.label.includes(value);
const isSelected = (data: ChartTreeNode) =>
  Boolean(data.dashboardItemId && selectedIds.value.includes(data.dashboardItemId));

const setSelected = (data: ChartTreeNode, checked: boolean | string | number) => {
  if (!data.dashboardItemId) return;
  const next = new Set(selectedIds.value);
  if (checked) next.add(data.dashboardItemId);
  else next.delete(data.dashboardItemId);
  selectedIds.value = [...next];
};

const toggleChart = (data: ChartTreeNode) => {
  if (data.kind === "chart") setSelected(data, !isSelected(data));
};

const confirm = () => {
  const selected = new Set(selectedIds.value);
  const charts = treeData.value.flatMap((app) =>
    (app.children || []).flatMap((dashboard) => dashboard.children || [])
  );
  emit(
    "select",
    charts
      .filter((chart) => chart.dashboardId && chart.dashboardItemId && selected.has(chart.dashboardItemId))
      .map((chart) => ({
        dashboardId: chart.dashboardId!,
        dashboardItemId: chart.dashboardItemId!,
        title: chart.label,
      }))
  );
  visible.value = false;
};

watch(keyword, (value) => treeRef.value?.filter(value));
watch(
  () => props.modelValue,
  async (value) => {
    if (!value) return;
    keyword.value = "";
    selectedIds.value = [...props.selectedIds];
    await workbenchStore.loadCatalog();
  }
);
</script>

<style lang="scss" scoped>
.chart-tree-scroll {
  margin-top: var(--et-space-12);
  margin-bottom: var(--et-space-12);
  :deep(.el-scrollbar__view) {
    box-sizing: border-box;
    padding-right: var(--et-space-16);
  }
}

.chart-tree-node {
  align-items: center;
  display: flex;
  gap: var(--et-space-8);
  height: var(--et-size-30);
  line-height: var(--et-line-height-30);
  min-width: 0;
  width: 100%;

  &.selected {
    color: var(--et-color-primary);
    font-weight: 600;
  }
}

.chart-tree-icon { flex: 0 0 var(--et-size-18); }

.chart-tree-app-icon {
  align-items: center;
  border-radius: var(--et-radius-4);
  display: inline-flex;
  flex: 0 0 var(--et-size-18);
  height: var(--et-size-18);
  justify-content: center;
  width: var(--et-size-18);
}

.chart-tree-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-checkbox {
  flex: 0 0 auto;
  margin-left: auto;
}

:deep(.el-tree-node__content) {
  height: var(--et-size-30);
  line-height: var(--et-line-height-30);
}

.workbench-dialog-content {
  padding: var(--et-space-16) var(--et-space-20) 0;
}
</style>
