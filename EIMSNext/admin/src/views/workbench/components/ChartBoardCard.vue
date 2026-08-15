<template>
  <div class="chart-board-card">
    <et-card class="chart-board-shell" data-workbench-card-root>
      <template #header>
        <div class="workbench-card-header">
          <span class="workbench-card-title">{{ t("admin.workbench.myChart") }}</span>
          <el-button v-if="allowManage" link type="primary" @click.stop="$emit('add-chart')">
            <et-icon icon="el-plus" />
            {{ t("common.add") }}
          </el-button>
        </div>
      </template>
      <grid-layout
        v-if="chartLayout.length"
        v-model:layout="chartLayout"
        class="my-charts-grid"
        data-workbench-height-content
        :col-num="24"
        :row-height="24"
        :margin="[12, 12]"
        :is-draggable="Boolean(allowManage)"
        :is-resizable="Boolean(allowManage)"
        :is-bounded="false"
        :vertical-compact="true"
        :use-css-transforms="true"
        @layout-updated="handleLayoutUpdated"
      >
        <grid-item
          v-for="chart in chartLayout"
          :key="chart.i"
          :x="chart.x"
          :y="chart.y"
          :w="chart.w"
          :h="chart.h"
          :i="chart.i"
          :minW="chart.minW || 6"
          :minH="chart.minH || 5"
          :drag-allow-from="'.my-chart-item'"
          :drag-ignore-from="'.no-drag'"
        >
          <MyChartItem :chart="chart" :allow-manage="allowManage" @remove="$emit('remove-chart', chart.i)" />
        </grid-item>
      </grid-layout>
      <div v-else class="chart-board-empty" data-workbench-height-content>
        <i class="x-icon iconfont-fx-pc icon-info-o"></i>
        <div>{{ t("admin.workbench.chartNotConfigured") }}</div>
      </div>
    </et-card>
  </div>
</template>

<script setup lang="ts">
import type { WorkbenchChartLayoutItem, WorkbenchLayoutItem } from "@eimsnext/models";
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import MyChartItem from "./MyChartItem.vue";
import { useI18n } from "vue-i18n";

defineOptions({ name: "WorkbenchChartBoardCard" });

const props = defineProps<{
  item: WorkbenchLayoutItem;
  allowManage?: boolean;
}>();
const emit = defineEmits<{
  (e: "add-chart"): void;
  (e: "remove-chart", chartId: string): void;
  (e: "update-charts", charts: WorkbenchChartLayoutItem[]): void;
  (e: "content-change"): void;
}>();
const { t } = useI18n();
const chartLayout = ref<WorkbenchChartLayoutItem[]>([]);

const copyCharts = (charts: WorkbenchChartLayoutItem[] = []) => charts.map((chart) => ({ ...chart }));

const notifyContentChange = () => {
  nextTick(() => requestAnimationFrame(() => emit("content-change")));
};

watch(
  () => props.item.config?.charts,
  (charts) => {
    chartLayout.value = copyCharts(charts);
    notifyContentChange();
  },
  { immediate: true, deep: true }
);

const handleLayoutUpdated = (updatedLayout: WorkbenchChartLayoutItem[]) => {
  const currentCharts = new Map(chartLayout.value.map((chart) => [chart.i, chart]));
  const nextCharts = updatedLayout.map((chart) => ({
    ...currentCharts.get(chart.i),
    ...chart,
  })) as WorkbenchChartLayoutItem[];
  chartLayout.value = nextCharts;
  emit("update-charts", copyCharts(nextCharts));
  notifyContentChange();
};
</script>

<style lang="scss" scoped>
.chart-board-card {
  height: auto;
  width: 100%;
}

:deep(.vue-grid-item > .vue-resizable-handle) {
  height: var(--et-size-24);
  width: var(--et-size-24);
  z-index: 20;
}

.chart-board-shell {
  height: auto;

  :deep(> .el-card__header) { flex: 0 0 auto; }

  :deep(> .el-card__body) {
    box-sizing: border-box;
    overflow: visible;
    padding: 0;
  }
}

.workbench-card-header {
  align-items: center;
  display: flex;
  gap: var(--et-space-10);
  padding-top: var(--et-space-12);
  padding-bottom: var(--et-space-4);
}

.workbench-card-title {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-16);
  font-weight: 700;
}

.chart-board-empty {
  align-items: center;
  color: var(--et-text-tertiary);
  display: flex;
  flex-direction: column;
  gap: var(--et-space-8);
  justify-content: center;
  min-height: var(--et-size-160);
  text-align: center;
}
</style>
