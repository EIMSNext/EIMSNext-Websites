<template>
  <EtDrawer :model-value="modelValue" @close="close">
    <template #title>
      <el-input v-model="formName" class="title-editor" />
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
                <el-popover placement="right-start" trigger="hover"
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
                <Draggable :list="comps" :sort="false" ghost-class="ghost" @start="dragCompStart"
                  :group="{ name: 'comps', pull: 'clone', put: false }" item-key="id">
                  <template #item="{ element }">
                    <div class="menu-line">
                      <div class="line-content" unselectable="on">
                        <et-icon :icon="element.icon" class="line-icon" />
                        <div class="line-text">{{ element.label }}</div>
                      </div>
                    </div>
                  </template>
                </Draggable>
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
                <Draggable :list="tools" :sort="false" ghost-class="ghost" @start="dragToolStart"
                  :group="{ name: 'tools', pull: 'clone', put: false }" item-key="id">
                  <template #item="{ element }">
                    <div class="menu-line">
                      <div class="line-content" unselectable="on">
                        <et-icon :icon="element.icon" class="line-icon" />
                        <div class="line-text">{{ element.label }}</div>
                      </div>
                    </div>
                  </template>
                </Draggable>
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
          <grid-layout ref="gridRef" v-model:layout="dashItems" :col-num="colNum" :col-width="colWidth"
            :row-height="rowHeight" :is-draggable="true" :is-resizable="true" :is-mirrored="false"
            :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true">
            <grid-item v-for="item in dashItems" :ref="e => setItemRef(item, e)" :x="item.x" :y="item.y" :w="item.w"
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
  <DataSourceDialog v-model="showDataSourceDialog" :appId="appId" :dataSource="dataSource"></DataSourceDialog>
</template>
<script setup lang="ts">
import Draggable from "vuedraggable";
import { EtDrawer } from "@eimsnext/components/src/drawer";
import DashItemCard from "./components/DashItemCard.vue"
import { DashItemType, IDataSource, IDraggableItem, IGridLayoutItem } from "./type";
import { uniqueId } from "@eimsnext/utils";
import { GridLayout, GridItem } from "vue-grid-layout-v3";

defineOptions({
  name: "DashboardDesigner",
});

const props = defineProps<{
  modelValue: boolean;
  appId: string;
}>();

const formName = ref("未命名仪表盘");
const gridRef = ref<any>()

const charts = ref<IDraggableItem[]>([{ id: "", icon: "el-PieChart", label: "统计表", type: DashItemType.Chart }])
const comps = ref<IDraggableItem[]>([{ id: "", icon: "el-PieChart", label: "文本组件", type: DashItemType.Comp }])
const tools = ref<IDraggableItem[]>([{ id: "", icon: "el-PieChart", label: "筛选组件", type: DashItemType.Tool }])

const hoverMenu = ref(false)
const hoverMenuType = ref<DashItemType | "">("")

const showDataSourceDialog = ref(false)
const dataSource = ref<IDataSource>()
const draggingNode = ref<IDraggableItem | null>(null)

const dragChartStart = (e: any) => {
  e.preventDefault();
  draggingNode.value = e.item._underlying_vm_;
};

const dragCompStart = (e: any) => {
  e.preventDefault();
  draggingNode.value = e.item._underlying_vm_;
};

const dragToolStart = (e: any) => {
  e.preventDefault();
  draggingNode.value = e.item._underlying_vm_;
};

const handleDragOver = (e: DragEvent) => {
  console.log("handleDragOver", e, draggingNode.value)
  e.preventDefault(); // 必须阻止默认行为，否则 drop 事件不触发
  e.stopPropagation();
  e.dataTransfer!.dropEffect = "copy";
};

const handleDrop = (e: DragEvent) => {
  console.log("handleDrop", e, draggingNode.value)
  e.preventDefault();
  e.stopPropagation();
  if (!draggingNode.value) return;

  // 计算鼠标落点在布局容器中的位置（简化：默认从 (0,0) 开始，也可根据坐标计算）
  const newItem: IGridLayoutItem = {
    i: uniqueId(), // 唯一 ID
    x: 0, // 列起始位置
    y: dashItems.value.length * 5, // 行起始位置（避免重叠）
    w: 30, // 默认宽度
    h: 30, // 默认高度
    type: draggingNode.value.type,
    label: draggingNode.value.label,
    icon: draggingNode.value.icon,
    inEdit: false,
    drag: true
  };

  dashItems.value.push(newItem);
  draggingNode.value = null;
  console.log("dashItems", dashItems.value)
};

const dashItems = ref<IGridLayoutItem[]>([])
const dashItemsRef = ref<any>({})
const colNum = ref(60)
const colWidth = ref(150)
const rowHeight = ref(10)
const newWidth = 30
const newHeight = 30
const mouseXY = { x: -1, y: -1 };
const dragPos: IGridLayoutItem = { x: -1, y: -1, w: 1, h: 1, i: "" };

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
  showDataSourceDialog.value = true
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
  if (mouseInGrid === true && (dashItems.value.findIndex(item => item.i === 'drop')) === -1) {
    dashItems.value.push({
      x: (dashItems.value.length * 2) % (colNum.value || 60),
      y: dashItems.value.length + (colNum.value || 60),
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

  const index = dashItems.value.findIndex(item => item.i === 'drop');
  if (index !== -1) {
    if (dashItemsRef.value.drop?.el?.style) {
      dashItemsRef.value.drop.el.style.display = 'none';
    }
    const itemRef = dashItemsRef.value.drop;
    const new_pos = itemRef.calcXY(mouseXY.y - parentRect.top, mouseXY.x - parentRect.left);
    if (mouseInGrid === true) {
      gridRef.value.emitter.emit('dragEvent', ['dragstart', 'drop', new_pos.x, new_pos.y, 1, 1]);
      dragPos.i = uniqueId();
      dragPos.x = dashItems.value[index].x;
      dragPos.y = dashItems.value[index].y;
      dragPos.w = newWidth
      dragPos.h = newHeight
    }
    if (mouseInGrid === false) {
      gridRef.value.emitter.emit('dragEvent', ['dragend', 'drop', new_pos.x, new_pos.y, 1, 1]);
      dashItems.value = dashItems.value.filter(obj => obj.i !== 'drop');
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
    dashItems.value = dashItems.value.filter(obj => obj.i !== 'drop');

    dashItems.value.push({
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

const onSave = () => {
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

:deep(.grid-layout-container) {
  width: 100%;
  min-height: calc(100% - 40px);
  position: relative;
}

:deep(.vue-grid-item-resize-handle) {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  background: var(--et-color-primary);
  border-radius: 0 0 4px 0;
  cursor: se-resize;
}
</style>
