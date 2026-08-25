<template>
  <div
    ref="widgetRef"
    class="workbench-widget"
    :class="{ editable, preview, 'dynamic-height': isDynamicHeight, [item.type]: true }"
  >
    <MyTasksCard v-if="item.type === 'flowCenter'" />
    <MyAppsCard v-else-if="item.type === 'myApps'" />
    <RecentCard v-else-if="item.type === 'recent'" :design-mode="editable && !preview" :removable="!item.locked" @remove="$emit('remove')" />
    <FavoritesCard v-else-if="item.type === 'favorites'" :allow-manage="!editable && !preview" :design-mode="editable && !preview" :removable="!item.locked" @add="$emit('add-favorite')" @remove="$emit('remove')" />
    <ChartBoardCard
      v-else-if="item.type === 'chartBoard'"
      :item="item"
      :allow-manage="!editable && !preview"
      :design-mode="editable && !preview"
      :removable="!item.locked"
      @add-chart="$emit('add-chart')"
      @remove-chart="$emit('remove-chart', $event)"
      @remove="$emit('remove')"
      @update-charts="$emit('update-charts', $event)"
      @content-change="scheduleContentHeight"
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
  preview?: boolean;
}>();
const { t } = useI18n();
const emit = defineEmits<{
  (e: "remove"): void;
  (e: "add-favorite"): void;
  (e: "add-chart"): void;
  (e: "remove-chart", chartId: string): void;
  (e: "update-charts", charts: import("@eimsnext/models").WorkbenchChartLayoutItem[]): void;
  (e: "content-height", height: number): void;
}>();

const widgetRef = ref<HTMLElement>();
const isDynamicHeight = computed(() =>
  ["myApps", "favorites", "recent", "chartBoard"].includes(props.item.type)
);
let resizeObserver: ResizeObserver | undefined;
let mutationObserver: MutationObserver | undefined;
let observedContent: HTMLElement | undefined;

const getHeightContent = () =>
  widgetRef.value?.querySelector<HTMLElement>("[data-workbench-height-content]") ?? undefined;

const observeHeightContent = () => {
  const content = getHeightContent();
  if (!resizeObserver || content === observedContent) return;
  if (observedContent) resizeObserver.unobserve(observedContent);
  observedContent = content;
  if (observedContent) resizeObserver.observe(observedContent);
};

const reportContentHeight = () => {
  if (!isDynamicHeight.value || !widgetRef.value) return;
  const card = widgetRef.value.querySelector<HTMLElement>("[data-workbench-card-root]");
  if (!card) return;
  const header = card.querySelector<HTMLElement>(":scope > .el-card__header");
  const body = card.querySelector<HTMLElement>(":scope > .el-card__body");
  if (header && body) {
    const content = body.querySelector<HTMLElement>("[data-workbench-height-content]");
    const bodyStyle = getComputedStyle(body);
    const paddingHeight =
      (Number.parseFloat(bodyStyle.paddingTop) || 0) +
      (Number.parseFloat(bodyStyle.paddingBottom) || 0);
    const naturalBodyHeight = content
      ? Math.max(content.scrollHeight, content.offsetHeight) + paddingHeight
      : body.scrollHeight;
    const maxHeight = Number.parseFloat(getComputedStyle(body).maxHeight);
    const bodyHeight = Number.isFinite(maxHeight)
      ? Math.min(naturalBodyHeight, maxHeight)
      : naturalBodyHeight;
    const borderHeight = card.offsetHeight - card.clientHeight;
    emit("content-height", Math.ceil(header.offsetHeight + bodyHeight + borderHeight));
    return;
  }
  emit("content-height", Math.ceil(card.getBoundingClientRect().height));
};

const scheduleContentHeight = () => {
  nextTick(() => {
    observeHeightContent();
    requestAnimationFrame(() => requestAnimationFrame(reportContentHeight));
  });
};

watch(
  () => props.item.config?.charts,
  () => {
    if (props.item.type === "chartBoard") scheduleContentHeight();
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();
  reportContentHeight();
  const card = widgetRef.value?.querySelector<HTMLElement>("[data-workbench-card-root]");
  if (!card || typeof ResizeObserver === "undefined") return;
  resizeObserver = new ResizeObserver(reportContentHeight);
  resizeObserver.observe(card);
  const body = card.querySelector<HTMLElement>(":scope > .el-card__body");
  if (body) {
    resizeObserver.observe(body);
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(() => {
        scheduleContentHeight();
      });
      mutationObserver.observe(body, { childList: true, subtree: true });
    }
  }
  observeHeightContent();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
  observedContent = undefined;
});

</script>

<style lang="scss" scoped>
.workbench-widget {
  height: 100%;
  position: relative;
  width: 100%;

  &.dynamic-height {
    height: 100%;
    min-height: 100%;

    :deep([data-workbench-card-root]) {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    :deep([data-workbench-card-root] > .el-card__body) {
      flex: 1 1 auto;
      min-height: 0;
    }
  }

  &.editable {
    cursor: move;

    :deep([data-workbench-card-root]) { pointer-events: none; }
    :deep(.workbench-card-delete) { pointer-events: auto; }
    :deep(.chart-board-card) {
      pointer-events: none;
    }
  }

  &.preview :deep([data-workbench-card-root]) { pointer-events: none; }
}

</style>
