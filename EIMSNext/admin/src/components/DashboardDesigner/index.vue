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
      <el-aside width="250px" class="left-aside">
        <div class="dash-designer-menu">
          <div class="menu-wrapper">
            <div>
              <div class="menu-label">图表</div>
              <div class="menu-group">
                <Draggable :list="charts" :sort="false" ghost-class="ghost" @start="dragChartStart"
                  :group="{ name: 'charts', pull: 'clone', put: false }" item-key="id">
                  <template #item="{ element }">
                    <div class="menu-line">
                      <div class="line-content" unselectable="on">
                        <et-icon :icon="element.icon" class="line-icon" />
                        <div class="line-text">{{ element.label }}</div>
                      </div>
                    </div>
                  </template>
                </Draggable>
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
          <div class="grid-layout" style="height: 310px;">
            <DashItemCard />
          </div>
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
import { IDataSource, IDraggableItem } from "./type";

defineOptions({
  name: "DashboardDesigner",
});

const props = defineProps<{
  modelValue: boolean;
  appId: string;
}>();

const formName = ref("未命名仪表盘");

const charts = ref<IDraggableItem[]>([{ id: "", icon: "el-icon-PieChart", label: "统计表" }])
const comps = ref<IDraggableItem[]>([{ id: "", icon: "el-icon-PieChart", label: "文本组件" }])
const tools = ref<IDraggableItem[]>([{ id: "", icon: "el-icon-PieChart", label: "筛选组件" }])

const showDataSourceDialog = ref(false)
const dataSource = ref<IDataSource>()
const draggingNode = ref<IDraggableItem>()

const dragChartStart = (e: any) => {
  e.preventDefault();
  draggingNode.value = e.originalEvent.srcElement._underlying_vm_;
};

const dragCompStart = (e: any) => {
  e.preventDefault();
  draggingNode.value = e.originalEvent.srcElement._underlying_vm_;
};

const dragToolStart = (e: any) => {
  e.preventDefault();
  draggingNode.value = e.originalEvent.srcElement._underlying_vm_;
};


const onSave = () => {
}
const onPreview = () => {
}

const emit = defineEmits(["update:modelValue", "close"]);
const close = () => {
  emit("update:modelValue", false)
  emit("close");
}
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
</style>
