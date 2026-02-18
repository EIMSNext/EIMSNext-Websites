<template>
  <EtDrawer :model-value="modelValue" @close="close">
    <template #title>
      <el-input v-model="dashName" class="title-editor" />
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
                      <div class="line-content" draggable="true" @click="openSourceDialog(true, DashItemType.Chart)"
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
                      <div class="line-content" draggable="true" @click="openSourceDialog(true, DashItemType.Comp)"
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
                      <div class="line-content" draggable="true" @click="openSourceDialog(true, DashItemType.Tool)"
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
        <div class="dash-edit-layout custom-scroll" style="background: rgb(244, 246, 249);">
          <grid-layout ref="gridRef" v-model:layout="state.layout" :col-num="colNum" :col-width="colWidth"
            :row-height="rowHeight" :is-draggable="state.draggable" :is-resizable="state.resizable" :is-mirrored="false"
            :is-bounded="true" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true">
            <grid-item v-for="item in state.layout" :ref="e => setItemRef(item, e)" :x="item.x" :y="item.y" :w="item.w"
              :h="item.h" :i="item.i" :key="item.i" @resize="resizeEvent" @resized="resizedEvent" @moved="movedEvent"
              @container-resized="containerResizedEvent" :minW="getMinWidth(item)" :minH="getMinHeight(item)" :maxW="60"
              :maxH="getMaxHeight(item)" drag-ignore-from=".no-drag" :class="{
                edited: item.inEdit,
                gridNoTran: item.drag,
              }" :style="{
                'z-index': getZIndex(item),
              }">
              <DashItemCard />
            </grid-item>
          </grid-layout>
        </div>
      </el-main>
    </el-container>
  </EtDrawer>
  <DataSourceDialog v-model="showDataSourceDialog" :appId="appId" :dataSource="dataSource" @cancel="handleSourceCancel"
    @ok="handleSourceOk"></DataSourceDialog>
  <EChartDesigner v-if="dashItemDefRef" v-model="dashItemDefRef" :app-id="appId" :data-source="dataSource!" />

</template>
<script setup lang="ts">
import { EtDrawer } from "@eimsnext/components/src/drawer";
import DashItemCard from "./components/DashItemCard.vue"
import { DataSourceType, IDataSource, IDraggableItem, IGridLayoutItem, IGridLayoutState } from "./type";
import { uniqueId } from "@eimsnext/utils";
import { useContextStore } from "@eimsnext/store";
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import { DataItemType, IFormItem } from "@eimsnext/components";
import { DashboardDef, DashboardItemDef, DashItemType } from "@eimsnext/models";
import { dashboardDefService } from "@eimsnext/services";
import EChartDesigner from "./EChartDesigner/index.vue"

defineOptions({
  name: "DashboardDesigner",
});

const props = defineProps<{
  modelValue: boolean;
  appId: string;
  dashDef: DashboardDef
}>();

const contextStore = useContextStore()
const dashName = ref("未命名仪表盘");
const dashDefRef = ref<DashboardDef>(props.dashDef)
const dashItemDefRef = ref<DashboardItemDef>()
const gridRef = ref<any>()

const hoverMenu = ref(false)
const hoverMenuType = ref<DashItemType | "">("")

const showDataSourceDialog = ref(false)
const dataSource = ref<IDataSource>()

const state = reactive<IGridLayoutState>({
  layout: [],
  draggable: true,
  resizable: true,
});

const dashItemsRef = ref<any>({})
const colNum = ref(60)
const colWidth = ref(150)
const rowHeight = ref(10)
const newWidth = 30
const newHeight = 30
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
  console.log("openSourceDialog", b, type)
  draggingItemType.value = type
  showDataSourceDialog.value = true
}
const handleSourceCancel = async () => {
  showDataSourceDialog.value = false
  state.layout = state.layout.filter(obj => obj.i !== 'drop');
  await nextTick();
}
const handleSourceOk = (source: IFormItem) => {
  dataSource.value = { id: source.id, type: DataSourceType.Form, label: source.label! };
  showDataSourceDialog.value = false
}

const setHoverMenu = (b: boolean, type: DashItemType) => {
  hoverMenu.value = b;
  hoverMenuType.value = type;
}

const setItemRef = (item: IGridLayoutItem, e: any) => {
  console.log("setItemRef", item, e)
  dashItemsRef.value[item.i] = e;
}

const dashItemDrag = async (e: DragEvent, type: DashItemType) => {
  console.log("dashItemDrag", e, type, gridRef.value)
  let parentRect = gridRef.value!.$el.getBoundingClientRect();
  let mouseInGrid = false;

  if (((mouseXY.x > parentRect.left) && (mouseXY.x < parentRect.right)) && ((mouseXY.y > parentRect.top) && (mouseXY.y < parentRect.bottom))) {
    mouseInGrid = true;
  }
  if (mouseInGrid === true && (state.layout.findIndex(item => item.i === 'drop')) === -1) {
    state.layout.push({
      x: (state.layout.length * 2) % (colNum.value || 60),
      y: state.layout.length + (colNum.value || 60),
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
      gridRef.value.emitter.emit('dragEvent', ['dragstart', 'drop', new_pos.x, new_pos.y, 1, 1]);
      dragPos.i = uniqueId();
      dragPos.x = state.layout[index].x;
      dragPos.y = state.layout[index].y;
      dragPos.w = newWidth
      dragPos.h = newHeight
    }
    if (mouseInGrid === false) {
      gridRef.value.emitter.emit('dragEvent', ['dragend', 'drop', new_pos.x, new_pos.y, 1, 1]);
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

    state.layout.push({
      x: dragPos.x,
      y: dragPos.y,
      w: dragPos.w,
      h: dragPos.h,
      i: dragPos.i,
      type: dragPos.type,
    });
    await nextTick();
    gridRef.value.emitter.emit('dragEvent', ['dragend', dragPos.i, dragPos.x, dragPos.y, dragPos.h, dragPos.w]);
    if (callback) {
      callback(true, dragPos.type)
    }
  }
}

const onSave = async () => {
  var layout = JSON.stringify(state.layout)

  let req = {
    id: props.dashDef.id,
    appId: props.dashDef.appId,
    name: dashName.value,
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
</script>
<style lang="scss" scoped>
.design-container {
  height: 100%;
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
          cursor: move;
          display: flex;
          line-height: 36px;
          padding: 0 16px;

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
  overflow: auto;
  position: relative;
  padding-bottom: 10px;
}

.vue-grid-layout {
  min-height: 200px;
}

:deep(.vue-resizable-handle) {
  z-index: 1000;
}

:deep(.vue-grid-item.vue-grid-placeholder) {
  background: #b5b5b5;
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
