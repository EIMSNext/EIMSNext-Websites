<template>
  <Layout>
    <div class="workbench-container">
      <grid-layout
        v-if="ready && !loading"
        v-model:layout="runtimeLayout"
        class="workbench-grid"
        :col-num="24"
        :row-height="24"
        :is-draggable="false"
        :is-resizable="false"
        :is-mirrored="false"
        :is-bounded="true"
        :vertical-compact="true"
        :margin="[16, 16]"
        :use-css-transforms="true"
        :responsive="false"
      >
        <grid-item
          v-for="item in runtimeLayout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :minW="item.minW || 5"
          :minH="item.type === 'flowCenter' ? item.minH || item.h : 1"
          :maxW="24"
          :maxH="999"
        >
          <WorkbenchWidgetRenderer
            :item="item"
            @add-favorite="showFavoriteDialog = true"
            @add-chart="showChartDialog = true"
            @remove-chart="removeChart"
            @update-charts="updateCharts"
            @content-height="syncWidgetHeight(item.i, $event)"
          />
        </grid-item>
      </grid-layout>
      <div v-else class="workbench-loading">{{ t("admin.workbench.loading") }}</div>
    </div>
    <AddFavoriteDialog v-model="showFavoriteDialog" />
    <ChartSelectDialog
      v-model="showChartDialog"
      :selected-ids="selectedChartIds"
      @select="addCharts"
    />
  </Layout>
</template>

<script setup lang="ts">
import type { WorkbenchChartLayoutItem, WorkbenchLayoutItem } from "@eimsnext/models";
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import Layout from "@/layout/index.vue";
import {
  cloneWorkbenchLayout,
  normalizeWorkbenchLayout,
  useWorkbenchStore,
} from "@/store";
import WorkbenchWidgetRenderer from "./components/WorkbenchWidgetRenderer.vue";
import AddFavoriteDialog from "./components/AddFavoriteDialog.vue";
import ChartSelectDialog from "./components/ChartSelectDialog.vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "Workbench",
  inheritAttrs: false,
});

const workbenchStore = useWorkbenchStore();
const { t } = useI18n();
const { layout, loading } = storeToRefs(workbenchStore);
const runtimeLayout = ref<WorkbenchLayoutItem[]>([]);
const showFavoriteDialog = ref(false);
const showChartDialog = ref(false);
const ready = ref(false);
const GRID_ROW_HEIGHT = 24;
const GRID_ROW_GAP = 16;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const selectedChartIds = computed(() =>
  (runtimeLayout.value.find((item) => item.type === "chartBoard")?.config?.charts || [])
    .map((chart) => chart.dashboardItemId)
    .filter(Boolean)
);

watch(
  layout,
  (value) => {
    runtimeLayout.value = cloneWorkbenchLayout(normalizeWorkbenchLayout(value));
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  await workbenchStore.load();
  ready.value = true;
});

const scheduleLayoutSave = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    workbenchStore.saveLayout(runtimeLayout.value).catch(() => {
      ElMessage.error(t("common.saveFailed"));
    });
  }, 300);
};

const syncWidgetHeight = (widgetId: string, contentHeight: number) => {
  if (!ready.value) return;
  const item = runtimeLayout.value.find((current) => current.i === widgetId);
  if (!item) return;
  const nextHeight = Math.max(
    1,
    Math.ceil((contentHeight + GRID_ROW_GAP) / (GRID_ROW_HEIGHT + GRID_ROW_GAP))
  );
  if (item.h === nextHeight) return;
  const nextItem = { ...item, h: nextHeight };
  const nextLayout = runtimeLayout.value.map((current) =>
    current.i === widgetId ? nextItem : { ...current }
  );

  const ordered = [...nextLayout].sort((left, right) => left.y - right.y || left.x - right.x);
  const placed: WorkbenchLayoutItem[] = [];
  ordered.forEach((current) => {
    current.y = placed.reduce((nextY, previous) => {
      const overlapsX =
        current.x < previous.x + previous.w && previous.x < current.x + current.w;
      return overlapsX ? Math.max(nextY, previous.y + previous.h) : nextY;
    }, 0);
    placed.push(current);
  });

  runtimeLayout.value = nextLayout;
  scheduleLayoutSave();
};

const addCharts = (
  values: { dashboardId: string; dashboardItemId: string; title: string }[]
) => {
  const chartBoard = runtimeLayout.value.find((item) => item.type === "chartBoard");
  if (!chartBoard) return;
  const existingCharts = chartBoard.config?.charts || [];
  const existingIds = new Set(existingCharts.map((chart) => chart.dashboardItemId));
  const chartsToAdd = values.filter((chart) => !existingIds.has(chart.dashboardItemId));
  if (!chartsToAdd.length) return;

  const newCharts: WorkbenchChartLayoutItem[] = chartsToAdd.map((chart, index) => {
    const position = existingCharts.length + index;
    return {
      i: `chart_${chart.dashboardItemId}`,
      x: (position % 2) * 12,
      y: Math.floor(position / 2) * 9,
      w: 12,
      h: 9,
      minW: 6,
      minH: 5,
      ...chart,
    };
  });
  runtimeLayout.value = runtimeLayout.value.map((item) =>
    item.i === chartBoard.i
      ? { ...item, config: { ...item.config, charts: [...existingCharts, ...newCharts] } }
      : item
  );
  scheduleLayoutSave();
};

const updateCharts = (charts: WorkbenchChartLayoutItem[]) => {
  runtimeLayout.value = runtimeLayout.value.map((item) =>
    item.type === "chartBoard" ? { ...item, config: { ...item.config, charts } } : item
  );
  scheduleLayoutSave();
};

const removeChart = (chartId: string) => {
  const chartBoard = runtimeLayout.value.find((item) => item.type === "chartBoard");
  if (!chartBoard) return;
  const nextLayout = runtimeLayout.value.map((item) =>
    item.i === chartBoard.i
      ? {
          ...item,
          config: {
            ...item.config,
            charts: (item.config?.charts || []).filter((chart) => chart.i !== chartId),
          },
        }
      : item
  );
  runtimeLayout.value = nextLayout;
  scheduleLayoutSave();
};

onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer);
});
</script>

<style lang="scss" scoped>
.workbench-container {
  background: var(--et-bg-page);
  box-sizing: border-box;
  height: 100%;
  min-height: calc(100vh - var(--et-size-50));
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0;
}

.workbench-loading {
  align-items: center;
  color: var(--et-text-tertiary);
  display: flex;
  height: var(--et-size-180);
  justify-content: center;
}

.workbench-grid {
  min-height: calc(100vh - var(--et-size-120));
}

:deep(.workbench-grid > .vue-grid-item) {
  overflow: visible;
}
</style>
