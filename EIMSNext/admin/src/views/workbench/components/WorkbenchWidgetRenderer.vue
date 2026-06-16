<template>
  <div class="workbench-widget" :class="{ editable }">
    <div v-if="editable" class="widget-toolbar" @mousedown.stop @click.stop>
      <span class="widget-title">{{ widgetTitle }}</span>
      <div class="widget-actions">
        <el-button v-if="item.type === 'favorites'" link type="primary" @click="$emit('add-favorite')">
          添加
        </el-button>
        <el-button v-if="item.type === 'chartBoard'" link type="primary" @click="$emit('configure-chart')">
          配置
        </el-button>
        <el-button v-if="!item.locked" link type="danger" @click="$emit('remove')">
          删除
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

defineOptions({
  name: "WorkbenchWidgetRenderer",
});

const props = defineProps<{
  item: WorkbenchLayoutItem;
  editable?: boolean;
}>();

defineEmits<{
  (e: "remove"): void;
  (e: "configure-chart"): void;
  (e: "add-favorite"): void;
}>();

const widgetTitle = computed(() => {
  if (props.item.type === "chartBoard") {
    return props.item.config?.title || "图表看板";
  }
  const titleMap: Record<string, string> = {
    flowCenter: "流程中心",
    myApps: "我的应用",
    recent: "最近使用",
    favorites: "我的收藏",
  };
  return titleMap[props.item.type] || "组件";
});
</script>

<style lang="scss" scoped>
.workbench-widget {
  height: 100%;
  position: relative;
  width: 100%;

  &.editable {
    cursor: move;
    padding-top: var(--et-size-26);

    :deep(.et-card),
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
