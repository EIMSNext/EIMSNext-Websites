<template>
  <div class="workbench-widget" :class="{ editable }">
    <div v-if="editable" class="widget-toolbar" @mousedown.stop @click.stop>
      <span class="widget-title">{{ widgetTitle }}</span>
      <div class="widget-actions">
        <el-button v-if="item.type === 'favorites'" link type="primary" @click="$emit('add-favorite')">
          {{ t("common.add") }}
        </el-button>
        <el-button v-if="item.type === 'chartBoard'" link type="primary" @click="$emit('configure-chart')">
          {{ t("common.configure") }}
        </el-button>
        <el-button v-if="!item.locked" link type="danger" @click="$emit('remove')">
          {{ t("common.delete") }}
        </el-button>
      </div>
    </div>

    <MyTasksCard v-if="item.type === 'flowCenter'" />
    <MyAppsCard v-else-if="item.type === 'myApps'" />
    <RecentCard v-else-if="item.type === 'recent'" />
    <FavoritesCard v-else-if="item.type === 'favorites'" :editable="editable" @add="$emit('add-favorite')" />
    <ChartBoardCard
      v-else-if="item.type === 'chartBoard'"
      :item="item"
      :editable="editable"
      @configure="$emit('configure-chart')"
    />
  </div>
</template>

<script setup lang="ts">
import type { WorkbenchLayoutItem } from "@eimsnext/models";
import MyAppsCard from "./MyAppsCard.vue";
import MyTasksCard from "./MyTasksCard.vue";
import FavoritesCard from "./FavoritesCard.vue";
import RecentCard from "./RecentCard.vue";
import ChartBoardCard from "./ChartBoardCard.vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "WorkbenchWidgetRenderer",
});

const props = defineProps<{
  item: WorkbenchLayoutItem;
  editable?: boolean;
}>();
const { t } = useI18n();

defineEmits<{
  (e: "remove"): void;
  (e: "configure-chart"): void;
  (e: "add-favorite"): void;
}>();

const widgetTitle = computed(() => {
  if (props.item.type === "chartBoard") {
    return props.item.config?.title || t("admin.workbench.chartBoard");
  }
  const titleMap: Record<string, string> = {
    flowCenter: t("admin.flowcenter"),
    myApps: t("admin.myApp"),
    recent: t("admin.workbench.recent"),
    favorites: t("admin.workbench.favorites"),
  };
  return titleMap[props.item.type] || t("common.component");
});
</script>

<style lang="scss" scoped>
.workbench-widget {
  height: 100%;
  position: relative;
  width: 100%;

  &.editable {
    cursor: move;

    :deep(.et-card) {
      pointer-events: none;
      padding-top: calc(var(--et-card-padding, var(--et-space-16)) + var(--et-size-26));
    }
    :deep(.chart-board-card) {
      pointer-events: none;
    }
  }
}

.widget-toolbar {
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--et-border-color);
  border-bottom: none;
  border-radius: var(--et-radius-6) var(--et-radius-6) 0 0;
  box-shadow: var(--et-shadow-sm);
  display: flex;
  height: var(--et-size-26);
  justify-content: space-between;
  left: 0;
  padding: 0 var(--et-space-8);
  position: absolute;
  right: 0;
  top: 0;
  z-index: 4;
  cursor: default;
  pointer-events: auto;
}

.widget-title {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-12);
  font-weight: 600;
}

.widget-actions {
  align-items: center;
  display: flex;
  gap: var(--et-space-4);
}
</style>
