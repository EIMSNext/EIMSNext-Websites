<template>
  <div class="dash-edit-layout custom-scroll">
    <grid-layout
      ref="gridRef"
      v-model:layout="state.layout"
      :col-num="colNum"
      :col-width="colWidth"
      :row-height="rowHeight"
      :is-draggable="state.draggable"
      :is-resizable="state.resizable"
      :is-mirrored="false"
      :is-bounded="true"
      :vertical-compact="true"
      :margin="[10, 10]"
      :use-css-transforms="true"
      :responsive="true"
      drag-ignore-from=".no-drag"
      resize-ignore-from=".no-drag"
    >
      <grid-item
        v-for="item in state.layout"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :key="item.i"
        :minW="getMinWidth(item)"
        :minH="getMinHeight(item)"
        :maxW="60"
        :maxH="getMaxHeight(item)"
        drag-ignore-from=".no-drag"
      >
        <DashItemCard
          v-if="state.items[item.i]"
          :item-def="state.items[item.i]"
          :is-view="true"
          :external-filter="chartFilters[state.items[item.i].id]"
          @filter-change="handleFilterChange"
        />
      </grid-item>
    </grid-layout>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import { IGridLayoutItem, IGridLayoutState } from "@eimsnext/models";
import { DashboardDef, DashboardItemDef } from "@eimsnext/models";
import { dashboardDefService, dashboardItemDefService } from "@eimsnext/services";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useChartFilterLinkage } from "./useChartFilterLinkage";
import { escapeODataString } from "@/utils/odata";
const { t } = useI18n();
const route = useRoute();

const dashId = route.params.dashId?.toString() || "";

const state = reactive<IGridLayoutState>({
  layout: [],
  items: {},
  draggable: false,
  resizable: false,
});
const colNum = ref(24);
const colWidth = ref(150);
const rowHeight = ref(10);
const dashboard = ref<DashboardDef>();
const refreshTimer = ref<number>();
let loadTask: Promise<void> | undefined;
const { isFullscreen } = useFullscreen();

const { chartFilters, rebuildChartFilters, handleFilterChange } = useChartFilterLinkage(state);

const getMinWidth = (item: IGridLayoutItem) => {
  return 6;
};
const getMinHeight = (item: IGridLayoutItem) => {
  return 3;
};
const getMaxHeight = (item: IGridLayoutItem) => {
  return 60;
};

const loadDashboard = async () => {
  if (loadTask) return loadTask;
  loadTask = (async () => {
    try {
      const dash = await dashboardDefService.get<DashboardDef>(dashId);
      dashboard.value = dash;
      try {
        const parsedLayout = JSON.parse(dash.layout) || [];
        state.layout.splice(0, state.layout.length);
        state.layout.push(...parsedLayout);

        state.items = {};

        const itemDefs = await dashboardItemDefService.query<DashboardItemDef>(
          `?$filter=appId eq '${escapeODataString(dash.appId)}' and dashboardId eq '${escapeODataString(dash.id)}'`
        );
        if (itemDefs && itemDefs.length > 0) {
          itemDefs.forEach((x) => {
            state.items[x.layoutId] = x;
          });
          rebuildChartFilters();
        }
      } catch (e) {
        console.error("布局JSON解析失败：", e);
        state.layout.splice(0, state.layout.length);
      }
    } catch (e) {
      console.error("加载仪表盘失败：", e);
      ElMessage.error(t("admin.dashboardDesigner.loadFailed"));
    } finally {
      loadTask = undefined;
    }
  })();
  return loadTask;
};

function clearRefreshTimer() {
  if (refreshTimer.value) {
    window.clearInterval(refreshTimer.value);
    refreshTimer.value = undefined;
  }
}

function setupRefreshTimer() {
  clearRefreshTimer();
  if (!isFullscreen.value || !dashboard.value?.autoRefreshEnabled) {
    return;
  }

  const minutes = dashboard.value.autoRefreshIntervalMinutes || 15;
  refreshTimer.value = window.setInterval(() => {
    if (loadTask) return;
    loadDashboard();
  }, minutes * 60 * 1000);
}

watch(
  () => [isFullscreen.value, dashboard.value?.autoRefreshEnabled, dashboard.value?.autoRefreshIntervalMinutes] as const,
  setupRefreshTimer
);
onMounted(loadDashboard);
onBeforeUnmount(clearRefreshTimer);
</script>
<style lang="scss" scoped>
.dash-edit-layout {
  background: var(--et-bg-page);
}
</style>
