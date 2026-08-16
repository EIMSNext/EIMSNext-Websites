<template>
  <div class="layout-container-card" :class="{ 'is-view': isView }">
    <div v-if="!isView" class="container-actions no-drag">
      <el-popover v-model:visible="settingsVisible" placement="bottom-end" trigger="click" width="312">
        <LayoutContainerSettings :model-value="setting" :title="itemDef.name" :tab-has-items="tabHasItems" @updated="updateSetting" />
        <template #reference>
          <el-button link :title="t('common.edit')"><et-icon icon="el-editPen" /></el-button>
        </template>
      </el-popover>
      <el-tooltip :disabled="!hasChildren" content="容器内存在组件，不能删除" placement="top">
        <span>
          <el-button link :disabled="hasChildren" :title="t('common.delete')" @click="emit('delete', itemDef)"><et-icon icon="el-delete" /></el-button>
        </span>
      </el-tooltip>
    </div>

    <div v-if="setting.showTitle || !isView" class="container-title">{{ itemDef.name || '未命名布局容器' }}</div>
    <div class="container-body no-drag" :class="{ 'has-title': setting.showTitle || !isView }">
      <el-tabs v-if="setting.mode === 'tabs'" v-model="activeTab" class="container-tabs" :class="`style-${setting.tabStyle}`">
        <el-tab-pane v-for="tab in setting.tabs" :key="tab.id" :label="tab.name" :name="tab.id">
          <ContainerGrid v-if="activeTab === tab.id" :layout="activeLayout" />
        </el-tab-pane>
      </el-tabs>
      <ContainerGrid v-else :layout="activeLayout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, ref, watch, type PropType } from "vue";
import { useLocale } from "element-plus";
import { GridItem, GridLayout } from "vue-grid-layout-v3";
import { DashboardItemDef, IGridLayoutItem } from "@eimsnext/models";
import DashItemCard from "../components/DashItemCard.vue";
import LayoutContainerSettings from "./LayoutContainerSettings.vue";
import { ILayoutContainerSetting, parseLayoutContainerSetting } from "./type";

const { t } = useLocale();
const props = withDefaults(defineProps<{
  itemDef: DashboardItemDef;
  layout: IGridLayoutItem[];
  items: Record<string, DashboardItemDef>;
  isView?: boolean;
  isPublic?: boolean;
  publicToken?: string;
  externalFilters?: Record<string, any>;
}>(), { isView: false, isPublic: false, externalFilters: () => ({}) });
const emit = defineEmits<{
  "update-layout": [layout: IGridLayoutItem[]];
  "update-setting": [item: DashboardItemDef, setting: ILayoutContainerSetting, name: string];
  "update-realtime-setting": [item: DashboardItemDef, setting: Record<string, any>];
  "update-image-setting": [item: DashboardItemDef, setting: Record<string, any>];
  "update-text-setting": [item: DashboardItemDef, setting: Record<string, any>];
  edit: [item: DashboardItemDef];
  delete: [item: DashboardItemDef];
  "filter-change": [payload: { itemId: string; value: any }];
  "quick-filter-change": [payload: { itemId: string; option?: any }];
  "apply-filters": [payload: { itemId: string }];
}>();

const settingsVisible = ref(false);
const setting = computed(() => parseLayoutContainerSetting(props.itemDef.details));
const activeTab = ref("");
const hasChildren = computed(() => props.layout.some((item) => item.parentLayoutId === props.itemDef.layoutId));
const activeLayout = computed<IGridLayoutItem[]>({
  get: () => props.layout.filter((item) => item.parentLayoutId === props.itemDef.layoutId && (setting.value.mode === "normal" || item.tabId === activeTab.value)),
  set: (updated) => {
    const ids = new Set(updated.map((item) => item.i));
    emit("update-layout", props.layout.map((item) => ids.has(item.i) ? updated.find((entry) => entry.i === item.i)! : item));
  },
});

const tabHasItems = (tabId: string) => props.layout.some((item) => item.parentLayoutId === props.itemDef.layoutId && item.tabId === tabId);
const updateSetting = ({ name, setting: value }: { name: string; setting: ILayoutContainerSetting }) => {
  emit("update-setting", props.itemDef, value, name);
  settingsVisible.value = false;
};

watch(setting, (value) => {
  if (value.mode === "tabs" && !value.tabs.some((tab) => tab.id === activeTab.value)) activeTab.value = value.tabs[0]?.id || "";
  if (value.mode === "normal") activeTab.value = "";
}, { immediate: true, deep: true });

let rotateTimer: number | undefined;
const clearTimer = () => { if (rotateTimer) { window.clearInterval(rotateTimer); rotateTimer = undefined; } };
const setupTimer = () => {
  clearTimer();
  if (!props.isView || !setting.value.autoRotate || setting.value.mode !== "tabs" || setting.value.tabs.length < 2) return;
  rotateTimer = window.setInterval(() => {
    const tabs = setting.value.tabs;
    activeTab.value = tabs[(Math.max(0, tabs.findIndex((tab) => tab.id === activeTab.value)) + 1) % tabs.length].id;
  }, 5000);
};
watch(() => [props.isView, setting.value.autoRotate, setting.value.mode, setting.value.tabs.length], setupTimer, { immediate: true });
onBeforeUnmount(clearTimer);

const ContainerGrid = defineComponent({
  props: { layout: { type: Array as PropType<IGridLayoutItem[]>, required: true } },
  setup(gridProps) {
    return () => h(GridLayout, {
      layout: gridProps.layout,
      "onUpdate:layout": (value: IGridLayoutItem[]) => { activeLayout.value = value; },
      colNum: 24,
      colWidth: 20,
      rowHeight: 10,
      isDraggable: !props.isView,
      isResizable: !props.isView,
      isBounded: true,
      verticalCompact: true,
      margin: [8, 8],
      responsive: true,
      dragIgnoreFrom: ".no-drag",
      class: "container-grid",
      "data-layout-container-id": props.itemDef.layoutId,
      "data-tab-id": setting.value.mode === "tabs" ? activeTab.value : undefined,
    }, {
      default: () => gridProps.layout.map((layoutItem) => h(GridItem, {
        key: layoutItem.i, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h, i: layoutItem.i,
        minW: 6, minH: 3, maxW: 24, maxH: 60, dragIgnoreFrom: ".no-drag",
      }, {
        default: () => props.items[layoutItem.i] ? h(DashItemCard, {
          itemDef: props.items[layoutItem.i], isView: props.isView, isPublic: props.isPublic, publicToken: props.publicToken,
          externalFilter: props.externalFilters[props.items[layoutItem.i].id], layout: props.layout, items: props.items,
          onEdit: (item: DashboardItemDef) => emit("edit", item), onDelete: (item: DashboardItemDef) => emit("delete", item),
          onFilterChange: (payload: { itemId: string; value: any }) => emit("filter-change", payload),
          onQuickFilterChange: (payload: { itemId: string; option?: any }) => emit("quick-filter-change", payload),
          onApplyFilters: (payload: { itemId: string }) => emit("apply-filters", payload),
          onUpdateRealtimeSetting: (item: DashboardItemDef, setting: Record<string, any>) => emit("update-realtime-setting", item, setting),
          onUpdateImageSetting: (item: DashboardItemDef, setting: Record<string, any>) => emit("update-image-setting", item, setting),
          onUpdateTextSetting: (item: DashboardItemDef, setting: Record<string, any>) => emit("update-text-setting", item, setting),
        }) : null,
      }))
    });
  },
});
</script>

<style scoped lang="scss">
.layout-container-card { position: relative; width: 100%; height: 100%; background: var(--et-bg-container); border: 2px solid var(--et-color-primary); box-sizing: border-box; overflow: hidden; }
.container-title { height: 40px; display: flex; align-items: center; padding: 0 var(--et-space-12); font-weight: 700; color: var(--et-text-primary); box-sizing: border-box; }
.container-actions { position: absolute; top: 6px; right: 8px; z-index: 20; display: flex; gap: var(--et-space-4); padding: 0 var(--et-space-4); background: var(--et-bg-container); box-shadow: var(--et-shadow-overlay); }
.container-body { height: 100%; overflow: hidden; }.container-body.has-title { height: calc(100% - 40px); }
.container-tabs { height: 100%; padding: 0 var(--et-space-8); }.container-tabs :deep(.el-tabs__header) { margin: 0; }.container-tabs :deep(.el-tabs__content), .container-tabs :deep(.el-tab-pane) { height: calc(100% - 40px); }
.container-tabs.style-boxed :deep(.el-tabs__item) { border: 1px solid var(--et-border-color); margin-right: 4px; }.container-tabs.style-filled :deep(.el-tabs__item.is-active) { color: #fff; background: var(--et-color-primary); border-radius: var(--et-radius-3); }.container-tabs.style-scroll :deep(.el-tabs__nav-wrap) { padding: 0 24px; }.container-tabs.style-scroll :deep(.el-tabs__nav-next), .container-tabs.style-scroll :deep(.el-tabs__nav-prev) { display: block; }
.container-grid { min-height: 100%; }.container-grid :deep(.vue-grid-item) { overflow: hidden; }
</style>
