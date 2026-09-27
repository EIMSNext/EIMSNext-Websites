<template>
  <div ref="chartRef" class="my-chart-item">
    <DashItemCard v-if="chartItem" :item-def="chartItem" :is-view="true">
      <template #header-actions>
        <div
          v-if="allowManage"
          class="header-btn no-drag workbench-chart-action"
          :title="t('admin.formData.fullscreen')"
          @click.stop="toggleFullscreen"
        >
          <et-icon icon="fullscreen" size="16px" />
        </div>
        <div
          v-if="allowManage"
          class="header-btn no-drag workbench-chart-action danger"
          :title="t('common.delete')"
          @click.stop="$emit('remove')"
        >
          <et-icon icon="el-delete" size="16px" />
        </div>
      </template>
    </DashItemCard>
    <div v-if="loading" class="my-chart-state">{{ t("admin.workbench.chartLoading") }}</div>
    <div v-else-if="errorText" class="my-chart-state">{{ errorText }}</div>
  </div>
</template>

<script setup lang="ts">
import type { WorkbenchChartItem, WorkbenchChartLayoutItem } from "@eimsnext/models";
import { workbenchService } from "@eimsnext/services";
import DashItemCard from "@/components/DashboardDesigner/components/DashItemCard.vue";
import { useI18n } from "vue-i18n";

defineOptions({ name: "WorkbenchMyChartItem" });

const props = defineProps<{
  chart: WorkbenchChartLayoutItem;
  allowManage?: boolean;
}>();
defineEmits<{ (e: "remove"): void }>();

const { t } = useI18n();
const chartRef = ref<HTMLElement>();
const chartItem = ref<WorkbenchChartItem>();
const loading = ref(false);
const errorText = ref("");
let loadSequence = 0;

const loadChart = async () => {
  const sequence = ++loadSequence;
  loading.value = true;
  chartItem.value = undefined;
  errorText.value = "";
  try {
    const result = await workbenchService.getChartItem(props.chart.dashboardItemId);
    if (sequence === loadSequence) chartItem.value = result;
  } catch {
    if (sequence === loadSequence) errorText.value = t("admin.dashItem.invalidConfig");
  } finally {
    if (sequence === loadSequence) loading.value = false;
  }
};

const toggleFullscreen = async () => {
  const target = chartRef.value;
  if (!target) return;
  if (document.fullscreenElement === target) {
    await document.exitFullscreen?.();
  } else {
    await target.requestFullscreen?.();
  }
};

watch(
  () => props.chart.dashboardItemId,
  () => loadChart(),
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.my-chart-item {
  background: var(--et-bg-container);
  border: 1px solid var(--et-border-color);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;

  :deep(.viewer-container .header-actions) {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  &:hover :deep(.viewer-container .header-actions) {
    opacity: 1;
    pointer-events: auto;
  }
}

:deep(.header-actions .workbench-chart-action) {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  height: var(--et-size-30);
  justify-content: center;
  vertical-align: top;
  width: var(--et-size-30);

  &:hover { color: var(--et-color-primary); }
  &.danger:hover { color: var(--et-color-danger); }
}

.my-chart-state {
  align-items: center;
  color: var(--et-text-tertiary);
  display: flex;
  height: 100%;
  justify-content: center;
}
</style>
