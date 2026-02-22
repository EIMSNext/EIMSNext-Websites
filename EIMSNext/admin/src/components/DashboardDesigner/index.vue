<template>
  <EtDrawer :model-value="modelValue" @close="close">
    <template #title>
      <el-input v-model="dashDefRef.name" class="title-editor" />
    </template>
    <template #top-right>
      <el-button @click="onSave">保存</el-button>
      <el-button @click="onPreview">预览</el-button>
    </template>
    <el-container class="design-container">
      <el-aside width="180px" class="left-aside">
        <div class="dash-designer-menu">
          <div class="menu-wrapper">
            <div>
              <div class="menu-label">图表</div>
              <div class="menu-group">
                <el-popover :visible="hoverMenu && hoverMenuType === DashItemType.Chart" placement="right-start"
                  trigger="hover" fit-content no-fade width="auto"
                  :class="{ 'line-hover': hoverMenu && hoverMenuType === DashItemType.Chart }">
                  <div class="menu-guide">
                    <div class="guide-title">统计表</div>
                    <img src="@/assets/images/dsheditor/guide-chart.svg" />
                    <div class="guide-des">提供多种图表样式，对数据进行汇总统计</div>
                  </div>
                  <template #reference>
                    <div class="menu-line">
                      <div class="line-content" draggable="true"
                        @dragstart="dashItemDragStart($event, DashItemType.Chart)"
                        @drag="dashItemDrag($event, DashItemType.Chart), (hoverMenu = false)"
                        @dragend="dashItemDrop($event, openSourceDialog)" unselectable="on"
                        @mouseover="setHoverMenu(true, DashItemType.Chart)" @mouseleave="hoverMenu = false">
                        <et-icon icon="el-PieChart" class="line-icon" />
                        <div class="line-text">统计表</div>
                      </div>
                    </div>
                  </template>
                </el-popover>

                <!--  <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-table"></i></div>
                    <div class="line-text">明细表</div>
                  </div>
                </div>
                <div class="menu-line">
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
                <el-popover :visible="hoverMenu && hoverMenuType === DashItemType.Comp" placement="right-start"
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
                </el-popover>

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
              <div class="menu-label">工具</div>
              <div class="menu-group">
                <el-popover :visible="hoverMenu && hoverMenuType === DashItemType.Tool" placement="right-start"
                  trigger="hover" fit-content no-fade width="auto"
                  :class="{ 'line-hover': hoverMenu && hoverMenuType === DashItemType.Tool }">
                  <div class="menu-guide">
                    <div class="guide-title">筛选组件</div>
                    <img src="@/assets/images/dsheditor/guide-chart.svg" />
                    <div class="guide-des">提供多种图表样式，对数据进行汇总统计</div>
                  </div>
                  <template #reference>
                    <div class="menu-line">
                      <div class="line-content" draggable="true"
                        @dragstart="dashItemDragStart($event, DashItemType.Tool)"
                        @drag="dashItemDrag($event, DashItemType.Tool), (hoverMenu = false)"
                        @dragend="dashItemDrop($event, openSourceDialog)" unselectable="on"
                        @mouseover="setHoverMenu(true, DashItemType.Tool)" @mouseleave="hoverMenu = false">
                        <et-icon icon="el-PieChart" class="line-icon" />
                        <div class="line-text">筛选组件</div>
                      </div>
                    </div>
                  </template>
                </el-popover>
                <!-- <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-filter"></i></div>
                    <div class="line-text">筛选组件</div>
                  </div>
                </div>
                <div class="menu-line">
                  <div class="line-content" draggable="true" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-combine-filter"></i></div>
                    <div class="line-text">快捷筛选</div>
                  </div>
                </div>
                <div class="menu-line disable">
                  <div class="line-content" draggable="false" unselectable="on">
                    <div class="line-thumb"><i class="x-icon iconfont-fx-pc icon-filter-add"></i></div>
                    <div class="line-text">筛选按钮</div>
                  </div>
                </div> -->
              </div>
            </div>
            <!-- <div class="sidebar-toggle"><i class="x-icon iconfont-fx-pc icon-sidebar"></i></div> -->
          </div>
        </div>
      </el-aside>
      <el-main style="min-width: 460px">
        <div class="dash-edit-layout custom-scroll" style="background: rgb(244, 246, 249);" @dragover="gridDragOver">
          <grid-layout ref="gridRef" v-model:layout="state.layout" :col-num="colNum" :col-width="colWidth"
            :row-height="rowHeight" :is-draggable="state.draggable" :is-resizable="state.resizable" :is-mirrored="false"
            :is-bounded="true" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true" :responsive="true"
            :breakpoints="{ xs: 0, sm: 576, md: 768, lg: 992, xl: 1200 }"
            :layout-breakpoints="{ xs: 6, sm: 12, md: 18, lg: 24, xl: 24 }">
            <grid-item v-for="item in state.layout" :ref="e => setItemRef(item, e)" :x="item.x" :y="item.y" :w="item.w"
              :h="item.h" :i="item.i" :key="item.i" @resize="resizeEvent" @resized="resizedEvent" @moved="movedEvent"
              @container-resized="containerResizedEvent" :minW="getMinWidth(item)" :minH="getMinHeight(item)" :maxW="60"
              :maxH="getMaxHeight(item)" drag-ignore-from=".no-drag"
              :class="{ edited: item.inEdit, gridNoTran: item.drag, }" :style="{ 'z-index': getZIndex(item), }">
              <DashItemCard v-if="dashItemsRef[item.i]" :item-def="dashItemsRef[item.i]" :height="item.h"
                :width="item.w" :is-view="false" @hide="handleItemHide" @edit="handleItemEdit" @copy="handleItemCopy"
                @delete="handleItemDelete" />
            </grid-item>
          </grid-layout>
        </div>
      </el-main>
    </el-container>
  </EtDrawer>
  <DataSourceDialog v-model="showDataSourceDialog" :appId="dashDef.appId" :dataSource="dataSource"
    @cancel="handleSourceCancel" @ok="handleSourceOk"></DataSourceDialog>
  <EChartDesigner v-if="dashItemDefRef" v-model="showChartEditor" :dash-item-def="dashItemDefRef" />

</template>
<script setup lang="ts">
import { EtDrawer } from "@eimsnext/components/src/drawer";
import DashItemCard from "./components/DashItemCard.vue"
import { DatasourceType, IDataSource, IDraggableItem, IGridLayoutItem, IGridLayoutState } from "./type";
import { uniqueId } from "@eimsnext/utils";
import { useContextStore } from "@eimsnext/store";
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import { IFormItem } from "@eimsnext/components";
import { DashboardDef, DashboardDefRequest, DashboardItemDef, DashboardItemDefRequest, DashItemType } from "@eimsnext/models";
import { dashboardDefService, dashboardItemDefService } from "@eimsnext/services";
import EChartDesigner from "./EChartDesigner/index.vue"
import { useI18n } from "vue-i18n";
const { t } = useI18n()

defineOptions({
  name: "DashboardDesigner",
});

const props = defineProps<{
  modelValue: boolean;
  dashDef: DashboardDef
}>();

const contextStore = useContextStore()
const dashDefRef = ref<DashboardDef>(props.dashDef)
const dashItemDefRef = ref<DashboardItemDef>()
const gridRef = ref<any>()

const hoverMenu = ref(false)
const hoverMenuType = ref<DashItemType | "">("")

const showDataSourceDialog = ref(false)
const dataSource = ref<IDataSource>()

const showChartEditor = ref(false)

const state = reactive<IGridLayoutState>({
  layout: [],
  draggable: true,
  resizable: true,
});

const dashItemsRef = ref<any>({})
const colNum = ref(24)
const colWidth = ref(150)
const rowHeight = ref(10)
const newWidth = 12
const newHeight = 12
const mouseXY = { x: -1, y: -1 };
const dragPos: IGridLayoutItem = { x: -1, y: -1, w: 1, h: 1, i: "" };
const draggingItemType = ref<DashItemType>()

const resizeEvent = (i: string | number, newH: number, newW: number, newHPx: number, newWPx: number) => { }
const resizedEvent = (i: string | number, newH: number, newW: number, newHPx: number, newWPx: number) => { }
const movedEvent = (i: string | number, x: number, y: number) => { }
const containerResizedEvent = (i: string | number, newH: number, newW: number, newHPx: number, newWPx: number) => { }

const getMinWidth = (item: IGridLayoutItem) => { return 6 }
const getMinHeight = (item: IGridLayoutItem) => { return 3 }
const getMaxHeight = (item: IGridLayoutItem) => { return 60 }
const getZIndex = (item: IGridLayoutItem) => { return 99999 }

const openSourceDialog = (b: boolean, type: DashItemType) => {
  // console.log("openSourceDialog", b, type)
  draggingItemType.value = type
  showDataSourceDialog.value = true
}

const handleSourceCancel = async () => {
  showDataSourceDialog.value = false
  state.layout = state.layout.filter(obj => obj.i !== 'drop');
  await nextTick();
}
const handleSourceOk = async (source: IFormItem) => {
  // console.log("handleSourceOk", dragPos)
  dataSource.value = { id: source.id, type: DatasourceType.Form, label: source.label! };
  showDataSourceDialog.value = false

  let details = { datasource: dataSource.value }
  let layoutId = uniqueId();

  state.layout.push({
    x: dragPos.x,
    y: dragPos.y,
    w: dragPos.w,
    h: dragPos.h,
    i: layoutId,
    type: dragPos.type,
  });

  await createNewDashItem(dragPos.type!, JSON.stringify(details), layoutId);

  await nextTick();
  gridRef.value.emitter.emit('dragEvent', ['dragend', dragPos.i, dragPos.x, dragPos.y, dragPos.h, dragPos.w]);

  showChartEditor.value = true
}

const setHoverMenu = (b: boolean, type: DashItemType) => {
  hoverMenu.value = b;
  hoverMenuType.value = type;
}

const setItemRef = (item: IGridLayoutItem, e: any) => {
  // console.log("setItemRef", item, e)
  dashItemsRef.value[item.i] = e;
}
const dashItemDragStart = (e: DragEvent, type: DashItemType) => {
  if (!e.dataTransfer) return;
  e.dataTransfer.dropEffect = 'copy';
  e.dataTransfer.setData('text', JSON.stringify({ type }));
  // e.dataTransfer.setDragImage(new Image(), 0, 0);
}
const gridDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"
}

const dashItemDrag = async (e: DragEvent, type: DashItemType) => {
  // console.log("dashItemDrag", e, type, gridRef.value)
  let parentRect = gridRef.value!.$el.getBoundingClientRect();
  let mouseInGrid = false;

  if (((mouseXY.x > parentRect.left) && (mouseXY.x < parentRect.right)) && ((mouseXY.y > parentRect.top) && (mouseXY.y < parentRect.bottom))) {
    mouseInGrid = true;
  }
  if (mouseInGrid === true && (state.layout.findIndex(item => item.i === 'drop')) === -1) {
    state.layout.push({
      x: (state.layout.length * 2) % (colNum.value),
      y: state.layout.length + (colNum.value),
      w: newWidth,
      h: newHeight,
      i: 'drop',
      type: type,
      inEdit: false,
      drag: true
    });
    await nextTick();
  }

  if (!dashItemsRef.value.drop) {
    return;
  }

  const index = state.layout.findIndex(item => item.i === 'drop');
  if (index !== -1) {
    if (dashItemsRef.value.drop?.el?.style) {
      dashItemsRef.value.drop.el.style.display = 'none';
    }
    const itemRef = dashItemsRef.value.drop;
    const new_pos = itemRef.calcXY(mouseXY.y - parentRect.top, mouseXY.x - parentRect.left);
    if (mouseInGrid === true) {
      gridRef.value.emitter.emit('dragEvent', ['dragstart', 'drop', new_pos.x, new_pos.y, state.layout[index].h, state.layout[index].w]);
      dragPos.i = "drop";
      dragPos.x = state.layout[index].x;
      dragPos.y = state.layout[index].y;
      dragPos.h = newWidth;
      dragPos.w = newHeight;
      dragPos.type = state.layout[index].type
    }
    if (mouseInGrid === false) {
      gridRef.value.emitter.emit('dragEvent', ['dragend', 'drop', new_pos.x, new_pos.y, state.layout[index].h, state.layout[index].w]);
      state.layout = state.layout.filter(obj => obj.i !== 'drop');
      await nextTick();
    }
  }
}
const dashItemDrop = async (e: DragEvent, callback: any) => {
  const parentRect = gridRef.value!.$el.getBoundingClientRect();
  let mouseInGrid = false;
  if (
    e.clientX > parentRect.left - 10 &&
    e.clientX < parentRect.right + 10 &&
    e.clientY > parentRect.top - 10 &&
    e.clientY < parentRect.bottom + 10
  ) {
    mouseInGrid = true;
  }
  if (((mouseXY.x > parentRect.left) && (mouseXY.x < parentRect.right)) && ((mouseXY.y > parentRect.top) && (mouseXY.y < parentRect.bottom))) {
    mouseInGrid = true;
  }
  if (mouseInGrid === true) {
    gridRef.value.emitter.emit('dragEvent', ['dragend', 'drop', dragPos.x, dragPos.y, dragPos.h, dragPos.w]);
    state.layout = state.layout.filter(obj => obj.i !== 'drop');

    if (callback) {
      // console.log("dashItemDrop", dragPos)
      callback(true, dragPos.type)
    }
    else {
      let layoutId = uniqueId();
      state.layout.push({
        x: dragPos.x,
        y: dragPos.y,
        w: dragPos.w,
        h: dragPos.h,
        i: layoutId,
        type: dragPos.type,
      });
      await createNewDashItem(dragPos.type!, "", layoutId);

      await nextTick();
      gridRef.value.emitter.emit('dragEvent', ['dragend', dragPos.i, dragPos.x, dragPos.y, dragPos.h, dragPos.w]);
    }
  }
}

const createNewDashItem = async (itemType: DashItemType, details: string, layoutId: string) => {
  // console.log("state.layout", state.layout, JSON.stringify(state.layout))
  let req: DashboardDefRequest = {
    id: props.dashDef.id,
    layout: JSON.stringify(state.layout)
  };

  dashDefRef.value = await dashboardDefService.patch<DashboardDef>(req.id, req);

  let name = "";
  switch (itemType) {
    case DashItemType.Chart:
      name = t("admin.untitledChart");
      break;
    default:
      name = t("admin.untitledChart")
      break;
  }

  let itemReq: DashboardItemDefRequest = {
    id: "",
    appId: dashDefRef.value.appId,
    dashboardId: dashDefRef.value.id,
    itemType: itemType,
    layoutId: layoutId,
    name: name,
    details: details || "{}"
  };

  dashItemDefRef.value = await dashboardItemDefService.post<DashboardItemDef>(itemReq);
}

const onSave = async () => {
  var layout = JSON.stringify(state.layout)

  let req = {
    id: props.dashDef.id,
    appId: props.dashDef.appId,
    name: props.dashDef.name,
    layout: layout
  };

  let resp = await dashboardDefService.patch<DashboardDef>(req.id, req);
  dashDefRef.value = resp
  contextStore.setAppChanged(); //reload 菜单
}

const onPreview = () => {
}

const emit = defineEmits(["update:modelValue", "close"]);
const close = () => {
  emit("update:modelValue", false)
  emit("close");
}

document.addEventListener('dragover', (e) => {
  mouseXY.x = e.clientX;
  mouseXY.y = e.clientY;
}, false);

const handleItemHide = (item: DashboardItemDef) => { }
const handleItemEdit = (item: DashboardItemDef) => {
  dashItemDefRef.value = item
  showChartEditor.value = true
}
const handleItemCopy = (item: DashboardItemDef) => { }
const handleItemDelete = (item: DashboardItemDef) => { }

watch(() => props.dashDef, (newVal) => {
  if (newVal && newVal.layout) {
    dashDefRef.value = { ...newVal };
    try {
      const parsedLayout = JSON.parse(newVal.layout) || [];
      state.layout.splice(0, state.layout.length);
      state.layout.push(...parsedLayout);
    } catch (e) {
      console.error('布局JSON解析失败：', e);
      state.layout.splice(0, state.layout.length); // 解析失败则清空布局
    }
  } else if (newVal) {
    dashDefRef.value = { ...newVal };
    state.layout.splice(0, state.layout.length); // layout为空时清空
  }
},
  { immediate: true, deep: true }
)
</script>
<style lang="scss" scoped>
.design-container {
  height: 100%;
  display: flex;
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
  padding: 20px 0;
  font-size: 14px;

  .menu-wrapper {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;

    .menu-label {
      color: var(--et-color-text-secondary);
      line-height: 36px;
      overflow: hidden;
      padding-left: 16px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menu-group {
      margin-bottom: 10px;

      .menu-line {
        padding: 0 4px;

        .line-content {
          align-items: center;
          border-radius: 4px;
          cursor: copy;
          display: flex;
          line-height: 36px;
          padding: 0 16px;

          &:hover {
            background: var(--et-color-bg-hover);
          }

          .line-icon {
            color: var(--et-color-text-secondary);
            flex: 0 0 20px;
            font-size: 16px;
          }

          .line-text {
            overflow: hidden;
            padding-left: 10px;
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
  padding: 10px;
  box-sizing: border-box;
}

:deep(.vue-grid-layout) {
  width: 100% !important;
  min-height: calc(100% - 20px);
  box-sizing: border-box;
}

:deep(.vue-resizable-handle) {
  z-index: 1000;
}

:deep(.vue-grid-item.vue-grid-placeholder) {
  background: rgba(106, 131, 252, 0.2);
  border: 1px dashed #6a83fc;
}

:deep(.vue-grid-item:not(.vue-grid-placeholder).checked) {
  box-shadow: 0 0 0 2px rgba(106, 131, 252, 1);
}

:deep(.vue-grid-item:not(.vue-grid-placeholder):hover) {
  box-shadow: 0 0 0 2px rgba(106, 131, 252, 1);
}

.menu-guide {
  width: 264px;

  .guide-title {
    font-size: 14px;
    font-weight: 700;
    color: #333;
    padding: 0 0 10px 0;

    &.title-down {
      margin-bottom: -35px;
    }
  }

  .guide-des {
    font-size: 14px;
    color: #333;
    padding: 10px 0;
    text-align: left;
    line-height: 1.5em;
  }

  img {
    width: 100%;
    display: block;
  }
}
</style>
