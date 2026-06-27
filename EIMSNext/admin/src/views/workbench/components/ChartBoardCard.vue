<template>
  <div class="chart-board-card">
    <DashItemCard v-if="chartItem" :item-def="chartItem" :is-view="true" />
    <et-card v-else :title="t('admin.workbench.chartBoard')" class="chart-board-empty-card">
      <div class="chart-board-empty">
        <template v-if="loading">{{ t("admin.workbench.chartLoading") }}</template>
        <template v-else>
          <i class="x-icon iconfont-fx-pc icon-info-o"></i>
          <div>{{ errorText || t("admin.workbench.chartNotConfigured") }}</div>
          <el-button v-if="editable" class="mt-3" type="primary" @click.stop="$emit('configure')">
            {{ t("admin.workbench.chooseChart") }}
          </el-button>
        </template>
      </div>
    </et-card>
  </div>
</template>

<script setup lang="ts">
import type { WorkbenchChartItem, WorkbenchLayoutItem } from "@eimsnext/models";
import { workbenchService } from "@eimsnext/services";
import DashItemCard from "@/components/DashboardDesigner/components/DashItemCard.vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "WorkbenchChartBoardCard",
});

const props = defineProps<{
  item: WorkbenchLayoutItem;
  editable?: boolean;
}>();
const { t } = useI18n();

defineEmits<{
  (e: "configure"): void;
}>();

const loading = ref(false);
const errorText = ref("");
const chartItem = ref<WorkbenchChartItem>();

const loadChart = async () => {
  const dashboardItemId = props.item.config?.dashboardItemId;
  chartItem.value = undefined;
  errorText.value = "";

  if (!dashboardItemId) {
    return;
  }

  loading.value = true;
  try {
    chartItem.value = await workbenchService.getChartItem(dashboardItemId);
  } catch {
    errorText.value = t("admin.dashItem.invalidConfig");
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.item.config?.dashboardItemId,
  () => loadChart(),
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.chart-board-card {
  height: 100%;
  min-height: 100%;
  position: relative;
  width: 100%;

  :deep(.layout-grid-item) {
    height: 100%;
  }
}

.chart-board-empty-card {
  height: 100%;
}

.chart-board-empty {
  align-items: center;
  color: var(--et-text-tertiary);
  display: flex;
  flex-direction: column;
  gap: var(--et-space-8);
  height: 100%;
  justify-content: center;
  min-height: var(--et-size-160);
  text-align: center;
}
</style>
