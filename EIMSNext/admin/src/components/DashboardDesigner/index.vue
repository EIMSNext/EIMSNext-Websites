<template>
  <EtDrawer :model-value="modelValue" @close="close">
    <template #title>
      <el-input v-model="dashDefRef.name" class="title-editor" />
    </template>
    <template #top-center>
      <el-tabs v-model="activeTab" class="nav-tabs">
        <el-tab-pane :label="t('admin.dashboard.design')" name="design" />
        <el-tab-pane :label="t('admin.dashboard.extension')" name="extension" />
        <el-tab-pane :label="t('admin.dashboard.publish')" name="publish" />
      </el-tabs>
    </template>
    <template #top-right>
      <el-button @click="onSave">{{ t("common.save") }}</el-button>
      <el-button @click="onPreview">{{ t("common.preview") }}</el-button>
    </template>
    <el-container v-show="activeTab === 'design'" class="design-container">
      <el-aside width="180px" class="left-aside">
        <div class="dash-designer-menu">
          <div class="menu-wrapper">
            <div>
              <div class="menu-label">{{ t("admin.dashboardDesigner.chart") }}</div>
              <div class="menu-group">
                <el-popover :visible="hoverMenu && hoverMenuType === DashItemType.Chart" placement="right-start"
                  trigger="hover" fit-content no-fade width="auto"
                  :class="{ 'line-hover': hoverMenu && hoverMenuType === DashItemType.Chart }">
                  <div class="menu-guide">
                    <div class="guide-title">{{ t("admin.dashboardDesigner.statsChart") }}</div>
                    <img src="@/assets/images/dsheditor/guide-chart.svg" />
                    <div class="guide-des">{{ t("admin.dashboardDesigner.statsChartDesc") }}</div>
                  </div>
                  <template #reference>
                    <div class="menu-line">
                      <div class="line-content" draggable="true"
                        @dragstart="dashItemDragStart($event, DashItemType.Chart)"
                        @drag="(dashItemDrag($event, DashItemType.Chart), (hoverMenu = false))"
                        @dragend="handlePaletteDrop($event, DashItemType.Chart)" unselectable="on"
                        @mouseover="setHoverMenu(true, DashItemType.Chart)" @mouseleave="hoverMenu = false">
                        <et-icon icon="el-PieChart" class="line-icon" />
                        <div class="line-text">{{ t("admin.dashboardDesigner.statsChart") }}</div>
                      </div>
                    </div>
                  </template>
                </el-popover>

                <el-popover :visible="hoverMenu && hoverMenuType === DashItemType.DetailTable" placement="right-start"
                  trigger="hover" fit-content no-fade width="auto"
                  :class="{ 'line-hover': hoverMenu && hoverMenuType === DashItemType.DetailTable }">
                  <div class="menu-guide">
                    <div class="guide-title">{{ t("admin.dashboardDesigner.detailTable") }}</div>
                    <img src="@/assets/images/dsheditor/guide-chart.svg" />
                    <div class="guide-des">{{ t("admin.dashboardDesigner.detailTableDesc") }}</div>
                  </div>
                  <template #reference>
                    <div class="menu-line">
                      <div class="line-content" draggable="true"
                        @dragstart="dashItemDragStart($event, DashItemType.DetailTable)"
                        @drag="dashItemDrag($event, DashItemType.DetailTable), (hoverMenu = false)"
                        @dragend="handlePaletteDrop($event, DashItemType.DetailTable)" unselectable="on"
                        @mouseover="setHoverMenu(true, DashItemType.DetailTable)" @mouseleave="hoverMenu = false">
                        <et-icon icon="el-Grid" class="line-icon" />
                        <div class="line-text">{{ t("admin.dashboardDesigner.detailTable") }}</div>
                      </div>
                    </div>
                  </template>
                </el-popover>
                <!-- <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-table"></i></div>
                    <div class="line-text">明细表</div>
                  </div>
                </div> -->
                <!--  <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-manage-table"></i></div>
                    <div class="line-text">数据管理表</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-point-map"></i></div>
                    <div class="line-text">点地图</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-widget-datetime"></i></div>
                    <div class="line-text">日历</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-gantt"></i></div>
                    <div class="line-text">甘特图</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-form-publish-auth-list"></i></div>
                    <div class="line-text">数据列表</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-func-bpa"></i></div>
                    <div class="line-text">流程分析表</div>
                  </div>
                </div> -->
              </div>
            </div>
            <div>
              <div class="menu-label">组件</div>
              <div class="menu-group">
                <div class="menu-line">
                  <div class="line-content" draggable="true" @dragstart="dashItemDragStart($event, DashItemType.Image)"
                    @drag="dashItemDrag($event, DashItemType.Image)" @dragend="handlePaletteDrop($event, DashItemType.Image)" unselectable="on">
                    <et-icon icon="el-Picture" class="line-icon" />
                    <div class="line-text">{{ t("admin.dashboardDesigner.imageComponent") }}</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" @dragstart="dashItemDragStart($event, DashItemType.Text)"
                    @drag="dashItemDrag($event, DashItemType.Text)" @dragend="handlePaletteDrop($event, DashItemType.Text)" unselectable="on">
                    <et-icon icon="el-Document" class="line-icon" />
                    <div class="line-text">{{ t("admin.dashboardDesigner.textComponent") }}</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" @dragstart="dashItemDragStart($event, DashItemType.LayoutContainer)"
                    @drag="dashItemDrag($event, DashItemType.LayoutContainer)" @dragend="handlePaletteDrop($event, DashItemType.LayoutContainer)" unselectable="on">
                    <et-icon icon="el-Grid" class="line-icon" />
                    <div class="line-text">布局容器</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" @dragstart="dashItemDragStart($event, DashItemType.RealTime)"
                    @drag="dashItemDrag($event, DashItemType.RealTime)" @dragend="handlePaletteDrop($event, DashItemType.RealTime)" unselectable="on">
                    <et-icon icon="el-Clock" class="line-icon" />
                    <div class="line-text">{{ t("admin.dashboardDesigner.realTime") }}</div>
                  </div>
                </div>
                <!-- <el-popover :visible="hoverMenu && hoverMenuType === DashItemType.Comp" placement="right-start"
                  trigger="hover" fit-content no-fade width="auto"
                  :class="{ 'line-hover': hoverMenu && hoverMenuType === DashItemType.Comp }">
                  <div class="menu-guide">
                    <div class="guide-title">文本组件</div>
                    <img src="@/assets/images/dsheditor/guide-chart.svg" />
                    <div class="guide-des">提供多种图表样式，对数据进行汇总统计</div>
                  </div>
                  <template #reference>
                    <div class="menu-line">
                      <div class="line-content" draggable="true"
                        @dragstart="dashItemDragStart($event, DashItemType.Comp)"
                        @drag="dashItemDrag($event, DashItemType.Comp), (hoverMenu = false)"
                        @dragend="dashItemDrop($event, openSourceDialog)" unselectable="on"
                        @mouseover="setHoverMenu(true, DashItemType.Comp)" @mouseleave="hoverMenu = false">
                        <et-icon icon="el-PieChart" class="line-icon" />
                        <div class="line-text">文本组件</div>
                      </div>
                    </div>
                  </template>
                </el-popover> -->

                <!-- <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-widget-image"></i></div>
                    <div class="line-text">图片组件</div>
                  </div>
                </div>

                <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-flow-time"></i></div>
                    <div class="line-text">实时时间</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-signpost"></i></div>
                    <div class="line-text">快捷入口</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-html-code"></i></div>
                    <div class="line-text">嵌入页面</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-dash-group-container"></i></div>
                    <div class="line-text">布局容器</div>
                  </div>
                </div> -->
              </div>
            </div>
            <div>
              <div class="menu-label">{{ t("admin.dashboardDesigner.tools") }}</div>
              <div class="menu-group">
                <!-- <el-popover :visible="hoverMenu && hoverMenuType === DashItemType.Filter" placement="right-start"
                  trigger="hover" fit-content no-fade width="auto"
                  :class="{ 'line-hover': hoverMenu && hoverMenuType === DashItemType.Filter }">
                  <div class="menu-guide">
                    <div class="guide-title">筛选组件</div>
                    <img src="@/assets/images/dsheditor/guide-chart.svg" />
                    <div class="guide-des">提供多种图表样式，对数据进行汇总统计</div>
                  </div>
                  <template #reference>
                    <div class="menu-line">
                      <div class="line-content" draggable="true"
                        @dragstart="dashItemDragStart($event, DashItemType.Filter)"
                        @drag="dashItemDrag($event, DashItemType.Filter), (hoverMenu = false)"
                        @dragend="dashItemDrop($event, openSourceDialog)" unselectable="on"
                        @mouseover="setHoverMenu(true, DashItemType.Filter)" @mouseleave="hoverMenu = false">
                        <et-icon icon="el-PieChart" class="line-icon" />
                        <div class="line-text">筛选组件</div>
                      </div>
                    </div>
                  </template>
                </el-popover> -->
                <div class="menu-line">
                  <div class="line-content" draggable="true" @dragstart="dashItemDragStart($event, DashItemType.Filter)"
                    @drag="dashItemDrag($event, DashItemType.Filter)" @dragend="handlePaletteDrop($event, DashItemType.Filter)" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-filter"></i></div>
                    <div class="line-text">{{ t("admin.dashboardDesigner.filterWidget") }}</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" @dragstart="dashItemDragStart($event, DashItemType.QuickFilter)"
                    @drag="dashItemDrag($event, DashItemType.QuickFilter)" @dragend="handlePaletteDrop($event, DashItemType.QuickFilter)" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-combine-filter"></i></div>
                    <div class="line-text">{{ t("admin.dashboardDesigner.quickFilter") }}</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" @dragstart="dashItemDragStart($event, DashItemType.FilterButton)"
                    @drag="dashItemDrag($event, DashItemType.FilterButton)" @dragend="handlePaletteDrop($event, DashItemType.FilterButton)" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-filter-add"></i></div>
                    <div class="line-text">{{ t("admin.dashboardDesigner.filterButton") }}</div>
                  </div>
                </div>
              </div>
            </div>
            <!-- <div class="sidebar-toggle"><i class="x-icon iconfont-fx-pc icon-sidebar"></i></div> -->
          </div>
        </div>
      </el-aside>
      <el-main class="designer-main">
        <div class="dash-edit-layout custom-scroll" @dragover="gridDragOver">
          <grid-layout ref="gridRef" v-model:layout="rootLayout" :col-num="colNum" :col-width="colWidth"
            :row-height="rowHeight" :is-draggable="state.draggable" :is-resizable="state.resizable" :is-mirrored="false"
            :is-bounded="true" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true"
            :responsive="true" resize-ignore-from=".no-drag">
            <grid-item v-for="item in rootLayout" :ref="(e) => setItemRef(item, e)" :x="item.x" :y="item.y"
              :w="item.w" :h="item.h" :i="item.i" :key="item.i" @resize="resizeEvent" @resized="resizedEvent"
              @moved="movedEvent" @container-resized="containerResizedEvent" :minW="getMinWidth(item)"
              :minH="getMinHeight(item)" :maxW="60" :maxH="getMaxHeight(item)" drag-ignore-from=".no-drag"
              resize-ignore-from=".no-drag"
              :class="{ edited: item.inEdit, gridNoTran: item.drag }" :style="{ 'z-index': getZIndex(item) }">
              <DashItemCard v-if="state.items[item.i]" :item-def="state.items[item.i]" :layout="state.layout" :items="state.items" :height="item.h" :width="item.w"
                :is-view="false" @hide="handleItemHide($event)" @edit="handleItemEdit($event)"
                @copy="handleItemCopy($event)" @delete="handleItemDelete($event)"
                @update-layout="updateNestedLayout" @update-setting="updateContainerSetting"
                @update-realtime-setting="updateRealTimeSetting" @update-image-setting="updateImageSetting"
                @update-text-setting="updateTextSetting" />
            </grid-item>
          </grid-layout>
        </div>
      </el-main>
    </el-container>
    <ExtensionSettings v-if="activeTab === 'extension'" :dash-def="dashDefRef" @updated="handleDashUpdated" />
    <PublishSettings v-if="activeTab === 'publish'" :dash-def="dashDefRef" @updated="handleDashUpdated" />
  </EtDrawer>
  <DataSourceDialog v-model="showDataSourceDialog" :appId="dashDef.appId" :dataSource="dataSource"
    @cancel="handleSourceCancel" @ok="handleSourceOk"></DataSourceDialog>
  <EChartsDesigner v-if="dashItemDefRef" v-model="showChartEditor" :dash-item-def="dashItemDefRef" />
  <DetailTableDesigner v-if="dashItemDefRef" v-model="showDetailTableEditor" :dash-item-def="dashItemDefRef" />
  <FilterDesigner v-if="dashItemDefRef" v-model="showFilterEditor" :dash-item-def="dashItemDefRef"
    :chart-targets="chartTargets" :binding-candidates="bindingCandidates" />
  <QuickFilterSettings v-if="dashItemDefRef && quickFilterSettingRef" v-model="showQuickFilterEditor" :setting="quickFilterSettingRef"
    :chart-targets="chartTargets" :binding-candidates="bindingCandidates" @updated="updateQuickFilterSetting" />
</template>
<script setup lang="ts">
import { buildFieldListItems, EtDrawer, IFormFieldDef } from "@eimsnext/components";
import DashItemCard from "./components/DashItemCard.vue";
import { getDashboardItemMinSize, IDataSource, IDraggableItem, IGridLayoutItem, IGridLayoutState } from "./type";
import { uniqueId } from "@eimsnext/utils";
import { useContextStore } from "@eimsnext/store";
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import { IFormItem } from "@eimsnext/components";
import {
  DashboardDef,
  DashboardDefRequest,
  DashboardItemDef,
  DashboardItemDefRequest,
  DashItemType,
} from "@eimsnext/models";
import { dashboardDefService, dashboardItemDefService } from "@eimsnext/services";
import EChartsDesigner from "./ECharts/EChartsDesigner.vue";
import FilterDesigner from "./FilterDesigner/FilterDesigner.vue";
import DetailTableDesigner from "./DetailTable/DetailTableDesigner.vue";
import ExtensionSettings from "./ExtensionSettings.vue";
import PublishSettings from "./PublishSettings.vue";
import { useI18n } from "vue-i18n";
import { useFormStore } from "@eimsnext/store";
import { IDashboardBindingCandidate, IDashboardChartTarget } from "./FilterDesigner/type";
import { createDefaultDetailTableSetting } from "./DetailTable/type";
import { useDashboardDragDrop } from "./useDashboardDragDrop";
import { escapeODataString } from "@/utils/odata";
import { createDefaultLayoutContainerSetting, ILayoutContainerSetting, parseLayoutContainerSetting } from "./LayoutContainer/type";
import { createDefaultRealTimeSetting, IRealTimeSetting } from "./RealTime/type";
import { createDefaultDashboardImageSetting, IDashboardImageSetting } from "./Image/type";
import { createDefaultDashboardTextSetting, IDashboardTextSetting } from "./Text/type";
import QuickFilterSettings from "./QuickFilter/QuickFilterSettings.vue";
import { createDefaultFilterButtonSetting, createDefaultQuickFilterSetting, parseQuickFilterSetting } from "./QuickFilter/type";
import { DashboardQuickFilterSetting } from "@eimsnext/models";
const { t } = useI18n();

defineOptions({
  name: "DashboardDesigner",
});

const props = defineProps<{
  modelValue: boolean;
  dashDef: DashboardDef;
}>();

const contextStore = useContextStore();
const formStore = useFormStore();
const dashDefRef = ref<DashboardDef>(props.dashDef);
const dashItemDefRef = ref<DashboardItemDef>();
const gridRef = ref<any>();
const activeTab = ref<"design" | "extension" | "publish">("design");

const hoverMenu = ref(false);
const hoverMenuType = ref<DashItemType | "">("");

const showDataSourceDialog = ref(false);
const dataSource = ref<IDataSource>();

const showChartEditor = ref(false);
const showDetailTableEditor = ref(false);
const showFilterEditor = ref(false);
const showQuickFilterEditor = ref(false);
const quickFilterSettingRef = computed(() => dashItemDefRef.value?.itemType === DashItemType.QuickFilter
  ? parseQuickFilterSetting(dashItemDefRef.value.details)
  : undefined);

const state = reactive<IGridLayoutState>({
  layout: [],
  items: {},
  draggable: true,
  resizable: true,
});
const rootLayout = computed<IGridLayoutItem[]>({
  get: () => state.layout.filter((item) => !item.parentLayoutId),
  set: (updated) => {
    const nested = state.layout.filter((item) => item.parentLayoutId);
    state.layout.splice(0, state.layout.length, ...updated, ...nested);
  },
});
const pendingDrop = ref<(IGridLayoutItem & { parentLayoutId?: string; tabId?: string }) | undefined>();

const {
  colNum,
  mouseXY,
  dragPos,
  draggingItemType,
  elItemsRef,
  setItemRef,
  dashItemDragStart,
  gridDragOver,
  dashItemDrag,
  dashItemDrop,
  getMaxHeight,
  getZIndex,
  setupMouseTracking,
} = useDashboardDragDrop(state, gridRef);

const colWidth = ref(150);
const rowHeight = ref(10);

const chartTargets = computed<IDashboardChartTarget[]>(() => Object.values(state.items)
  .filter((item) => [DashItemType.Chart, DashItemType.DetailTable].includes(item.itemType))
  .map((item) => {
    const details = JSON.parse(item.details || "{}");
    return {
      id: item.id,
      name: item.name,
      dataSource: details.datasource,
    };
  })
  .filter((item) => item.dataSource?.id));
const bindingCandidates = ref<IDashboardBindingCandidate[]>([]);

const resizeEvent = (
  i: string | number,
  newH: number,
  newW: number,
  newHPx: number,
  newWPx: number
) => { };
const resizedEvent = (
  i: string | number,
  newH: number,
  newW: number,
  newHPx: number,
  newWPx: number
) => { };
const movedEvent = (i: string | number, x: number, y: number) => { };
const containerResizedEvent = (
  i: string | number,
  newH: number,
  newW: number,
  newHPx: number,
  newWPx: number
) => { };

const getItemType = (item: IGridLayoutItem) => item.type ?? state.items[item.i]?.itemType;
const getMinWidth = (item: IGridLayoutItem) => getDashboardItemMinSize(getItemType(item)).w;
const getMinHeight = (item: IGridLayoutItem) => getDashboardItemMinSize(getItemType(item)).h;

const handleSourceCancel = async () => {
  showDataSourceDialog.value = false;
  pendingDrop.value = undefined;
  state.layout = state.layout.filter((obj) => obj.i !== "drop");
  await nextTick();
};
const handleSourceOk = async (source: IDataSource) => {
  dataSource.value = source;
  showDataSourceDialog.value = false;

  const target = pendingDrop.value;
  if (!target?.type) return;
  let details = target.type == DashItemType.DetailTable
    ? createDefaultDetailTableSetting(dataSource.value)
    : { datasource: dataSource.value };
  let layoutId = uniqueId();

  state.layout.push({
    x: target.x,
    y: target.y,
    w: target.w,
    h: target.h,
    i: layoutId,
    type: target.type,
    parentLayoutId: target.parentLayoutId,
    tabId: target.tabId,
  });

  await createNewDashItem(target.type, JSON.stringify(details), layoutId);

  await nextTick();
  if (!target.parentLayoutId) gridRef.value.emitter.emit("dragEvent", [
    "dragend",
    dragPos.i,
    dragPos.x,
    dragPos.y,
    dragPos.h,
    dragPos.w,
  ]);

  showChartEditor.value = false;
  showDetailTableEditor.value = false;
  if (target.type == DashItemType.DetailTable) {
    showDetailTableEditor.value = true;
  } else {
    showChartEditor.value = true;
  }
  pendingDrop.value = undefined;
};

const loadBindingCandidates = async () => {
  const sourceIds = Array.from(new Set(chartTargets.value.map((item) => item.dataSource.id)));
  const items: IDashboardBindingCandidate[] = [];
  for (const sourceId of sourceIds) {
    const form = await formStore.get(sourceId);
    if (!form) {
      continue;
    }
    const fields = buildFieldListItems(sourceId, form.content?.items || [], !!form.usingWorkflow, undefined, { t } as any)
      .map((item) => item.data)
      .filter(Boolean) as IFormFieldDef[];
    items.push({
      dataSourceId: sourceId,
      dataSourceLabel: form.name,
      fields,
    });
  }
  bindingCandidates.value = items;
};

const setHoverMenu = (b: boolean, type: DashItemType) => {
  hoverMenu.value = b;
  hoverMenuType.value = type;
};

const handlePaletteDrop = async (e: DragEvent, type: DashItemType) => {
  const result = await dashItemDrop(e, null);
  if (!result) return;
  const target = { ...result, type } as IGridLayoutItem & { parentLayoutId?: string; tabId?: string };
  if (type === DashItemType.Chart || type === DashItemType.DetailTable) {
    pendingDrop.value = target;
    draggingItemType.value = type;
    showDataSourceDialog.value = true;
    return;
  }
  const layoutId = uniqueId();
  state.layout.push({ ...target, i: layoutId });
  let details = "{}";
  if (type === DashItemType.LayoutContainer) details = JSON.stringify(createDefaultLayoutContainerSetting());
  if (type === DashItemType.RealTime) details = JSON.stringify(createDefaultRealTimeSetting());
  if (type === DashItemType.Image) details = JSON.stringify(createDefaultDashboardImageSetting());
  if (type === DashItemType.Text) details = JSON.stringify(createDefaultDashboardTextSetting());
  if (type === DashItemType.QuickFilter) details = JSON.stringify(createDefaultQuickFilterSetting(t("admin.dashboardDesigner.quickFilter")));
  if (type === DashItemType.FilterButton) details = JSON.stringify(createDefaultFilterButtonSetting());
  await createNewDashItem(type, details, layoutId);
};

const createNewDashItem = async (itemType: DashItemType, details: string, layoutId: string) => {
  let req: DashboardDefRequest = {
    id: props.dashDef.id,
    layout: JSON.stringify(state.layout),
  };

  dashDefRef.value = await dashboardDefService.patch<DashboardDef>(req.id, req);

  let name = "";
  switch (itemType) {
    case DashItemType.Chart:
      name = t("admin.untitledChart");
      break;
    case DashItemType.DetailTable:
      name = t("admin.untitledDetailTable");
      break;
    case DashItemType.Filter:
      name = t("admin.dashboardDesigner.filterWidgetName");
      break;
    case DashItemType.LayoutContainer:
      name = "未命名布局容器";
      break;
    case DashItemType.RealTime:
      name = t("admin.dashboardDesigner.realTime");
      break;
    case DashItemType.Image:
      name = t("admin.dashboardDesigner.imageComponent");
      break;
    case DashItemType.Text:
      name = t("admin.dashboardDesigner.textComponent");
      break;
    case DashItemType.QuickFilter:
      name = t("admin.dashboardDesigner.quickFilter");
      break;
    case DashItemType.FilterButton:
      name = t("admin.dashboardDesigner.filterButton");
      break;
    default:
      name = t("admin.untitledChart");
      break;
  }

  let itemReq: DashboardItemDefRequest = {
    id: "",
    appId: dashDefRef.value.appId,
    dashboardId: dashDefRef.value.id,
    itemType: itemType,
    layoutId: layoutId,
    name: name,
    details: details || "{}",
  };

  dashItemDefRef.value = await dashboardItemDefService.post<DashboardItemDef>(itemReq);
  state.items[layoutId] = dashItemDefRef.value;
};

const onSave = async () => {
  var layout = JSON.stringify(state.layout);

  let req: DashboardDefRequest = {
    id: dashDefRef.value.id,
    appId: dashDefRef.value.appId,
    name: dashDefRef.value.name,
    layout: layout,
  };

  let resp = await dashboardDefService.patch<DashboardDef>(req.id, req);
  dashDefRef.value = resp;
  contextStore.setAppChanged(); //reload 菜单
};

const handleDashUpdated = (dash: DashboardDef) => {
  dashDefRef.value = { ...dash };
  contextStore.setAppChanged();
};

const onPreview = async () => {
  await onSave();
  close();
};

const emit = defineEmits(["update:modelValue", "close"]);
const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const cleanupMouseTracking = setupMouseTracking();
onUnmounted(() => cleanupMouseTracking());

const handleItemHide = (item: DashboardItemDef) => { };
const handleItemEdit = (item: DashboardItemDef) => {
  if (item.itemType === DashItemType.LayoutContainer) return;
  dashItemDefRef.value = item;
  showChartEditor.value = false;
  showDetailTableEditor.value = false;
  showFilterEditor.value = false;
  showQuickFilterEditor.value = false;
  if (item.itemType == DashItemType.Filter) {
    loadBindingCandidates();
    showFilterEditor.value = true;
  } else if (item.itemType === DashItemType.QuickFilter) {
    loadBindingCandidates();
    showQuickFilterEditor.value = true;
  } else if (item.itemType === DashItemType.FilterButton) {
    return;
  } else if (item.itemType == DashItemType.DetailTable) {
    showDetailTableEditor.value = true;
  } else {
    showChartEditor.value = true;
  }
};
const handleItemCopy = (item: DashboardItemDef) => { };
const handleItemDelete = async (item: DashboardItemDef) => {
  const childLayoutIds = new Set<string>();
  const collectChildren = (parentId: string) => {
    state.layout.forEach((layout) => {
      if (layout.parentLayoutId !== parentId || childLayoutIds.has(layout.i)) return;
      childLayoutIds.add(layout.i);
      collectChildren(layout.i);
    });
  };
  collectChildren(item.layoutId);
  const hasChildren = childLayoutIds.size > 0;
  if (item.itemType === DashItemType.LayoutContainer && hasChildren) return;
  await dashboardItemDefService.delete(item.id);
  state.layout = state.layout.filter((layout) => layout.i !== item.layoutId && !childLayoutIds.has(layout.i));
  delete state.items[item.layoutId];
  childLayoutIds.forEach((layoutId) => delete state.items[layoutId]);
  await onSave();
};
const updateNestedLayout = (layout: IGridLayoutItem[]) => {
  state.layout.splice(0, state.layout.length, ...layout);
};
const updateContainerSetting = async (item: DashboardItemDef, setting: ILayoutContainerSetting, name: string) => {
  const previous = parseLayoutContainerSetting(item.details);
  if (previous.mode !== setting.mode) {
    state.layout.forEach((layout) => {
      if (layout.parentLayoutId !== item.layoutId) return;
      layout.tabId = setting.mode === "tabs" ? setting.tabs[0]?.id : undefined;
    });
    await onSave();
  }
  const updated = await dashboardItemDefService.patch<DashboardItemDef>(item.id, { id: item.id, name, details: JSON.stringify(setting) });
  state.items[item.layoutId] = updated;
};
const updateRealTimeSetting = async (item: DashboardItemDef, setting: IRealTimeSetting) => {
  const updated = await dashboardItemDefService.patch<DashboardItemDef>(item.id, {
    id: item.id,
    details: JSON.stringify(setting),
  });
  state.items[item.layoutId] = updated;
};
const updateImageSetting = async (item: DashboardItemDef, setting: IDashboardImageSetting) => {
  const updated = await dashboardItemDefService.patch<DashboardItemDef>(item.id, {
    id: item.id,
    details: JSON.stringify(setting),
  });
  state.items[item.layoutId] = updated;
};
const updateTextSetting = async (item: DashboardItemDef, setting: IDashboardTextSetting) => {
  const updated = await dashboardItemDefService.patch<DashboardItemDef>(item.id, {
    id: item.id,
    details: JSON.stringify(setting),
  });
  state.items[item.layoutId] = updated;
};
const updateQuickFilterSetting = async (setting: DashboardQuickFilterSetting) => {
  const item = dashItemDefRef.value;
  if (!item) return;
  const updated = await dashboardItemDefService.patch<DashboardItemDef>(item.id, {
    id: item.id,
    name: setting.name,
    details: JSON.stringify(setting),
  });
  dashItemDefRef.value = updated;
  state.items[updated.layoutId] = updated;
};

watch(
  () => props.dashDef,
  async (newVal) => {
    if (newVal && newVal.layout) {
      dashDefRef.value = { ...newVal };
      try {
        const parsedLayout = JSON.parse(newVal.layout) || [];
        state.layout.splice(0, state.layout.length);
        state.layout.push(...parsedLayout);

        state.items = {};

        let itemDefs = await dashboardItemDefService.query<DashboardItemDef>(
          `?$filter=appId eq '${escapeODataString(newVal.appId)}' and dashboardId eq '${escapeODataString(newVal.id)}'`
        );
        if (itemDefs && itemDefs.length > 0) {
          itemDefs.forEach((x) => {
            state.items[x.layoutId] = x;
          });
        }
      } catch (e) {
        console.error(t("admin.dashboardDesigner.layoutParseFailed"), e);
        state.layout.splice(0, state.layout.length); // 解析失败则清空布局
      }
    } else if (newVal) {
      dashDefRef.value = { ...newVal };
      state.layout.splice(0, state.layout.length); // layout为空时清空
    }
  },
  { immediate: true, deep: true }
);
</script>
<style lang="scss" scoped>
.design-container {
  height: 100%;
  display: flex;
}

.title-editor {
  width: var(--et-size-260);
}

:global(.top-nav-bar) .nav-tabs {
  height: var(--et-size-60);
}

:global(.top-nav-bar) .nav-tabs :deep(.el-tabs__header) {
  margin: 0;
}

:global(.top-nav-bar) .nav-tabs :deep(.el-tabs__nav) {
  align-items: center;
  height: var(--et-size-60);
}

:global(.top-nav-bar) .nav-tabs :deep(.el-tabs__content) {
  display: none;
}

.left-aside {
  flex-shrink: 0;
}

.el-main {
  flex: 1;
  padding: 0 !important;
}

.dash-designer-menu {
  height: 100%;
  padding: var(--et-space-20) 0;
  font-size: var(--et-font-size-14);

  .menu-wrapper {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;

    .menu-label {
      color: var(--et-text-secondary);
      line-height: var(--et-line-height-36);
      overflow: hidden;
      padding-left: var(--et-space-16);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menu-group {
      margin-bottom: var(--et-space-10);

      .menu-line {
        padding: 0 var(--et-space-4);

        .line-content {
          align-items: center;
          border-radius: var(--et-radius-4);
          cursor: copy;
          display: flex;
          line-height: var(--et-line-height-36);
          padding: 0 var(--et-space-16);

          &:hover {
            background: var(--et-bg-hover);
          }

          .line-icon {
            color: var(--et-text-secondary);
            flex: 0 0 var(--et-size-20);
            font-size: var(--et-font-size-16);
          }

          .line-text {
            overflow: hidden;
            padding-left: var(--et-space-10);
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
}

.dash-edit-layout {
  height: 100%;
  width: 100%;
  overflow: auto;
  position: relative;
  padding: var(--et-space-10);
  box-sizing: border-box;
  background: var(--et-bg-page);
}

:deep(.vue-grid-layout) {
  width: 100% !important;
  min-height: calc(100% - var(--et-space-20));
  box-sizing: border-box;
}

:deep(.vue-resizable-handle) {
  z-index: 1000;
}

:deep(.vue-grid-item.vue-grid-placeholder) {
  background: var(--et-color-primary-outline);
  border: 1px dashed var(--et-color-primary);
}

:deep(.vue-grid-item:not(.vue-grid-placeholder).checked) {
  box-shadow: 0 0 0 var(--et-space-2) var(--et-color-primary);
}

:deep(.vue-grid-item:not(.vue-grid-placeholder):hover) {
  box-shadow: 0 0 0 var(--et-space-2) var(--et-color-primary);
}

.menu-guide {
  width: var(--et-size-264);

  .guide-title {
    font-size: var(--et-font-size-14);
    font-weight: 700;
    color: var(--et-text-primary);
    padding: 0 0 var(--et-space-10) 0;

    &.title-down {
      margin-bottom: calc(var(--et-size-35) * -1);
    }
  }

  .guide-des {
    font-size: var(--et-font-size-14);
    color: var(--et-text-primary);
    padding: var(--et-space-10) 0;
    text-align: left;
    line-height: 1.5em;
  }

  img {
    width: 100%;
    display: block;
  }
}

.designer-main {
  min-width: var(--et-size-460);
}
</style>
