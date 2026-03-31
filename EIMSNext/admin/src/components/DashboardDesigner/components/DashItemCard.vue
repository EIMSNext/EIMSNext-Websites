<template>
  <div class="layout-grid-item">
    <div class="container-group-drag-handle"></div>
    <div v-if="!isView" class="container-header">
      <div class="header-action-container">
        <div class="header-action">
          <div class="action-btn" title="在桌面端隐藏该组件" @click="onHide">
            <et-icon icon="el-hide" />
          </div>
          <div class="action-btn" title="编辑" @click="onEdit"><et-icon icon="el-editPen" /></div>
          <div class="action-btn" title="复制" @click="onCopy">
            <et-icon icon="el-documentCopy" />
          </div>
          <div class="action-btn" title="删除" @click="onDelete"><et-icon icon="el-delete" /></div>
          <span></span>
          <div class="action-btn custom-line-action"></div>
        </div>
      </div>
      <div class="header-title">
        <span class="title-text item-text">未命名统计表</span>
      </div>
    </div>
    <div class="container-content-wrapper">
      <template v-if="chartSetting && chartSettingValidate(chartSetting)">
        <e-charts-viewer :setting="chartSetting" :title="itemDef.name" :show-header="isView" />
      </template>
      <template v-else>
        <el-empty class="et-dash-empty">
          <div class="empty-wrapper">
            <i class="x-icon iconfont-fx-pc icon-info-o"></i>
            <div class="empty-text">组件配置异常</div>
          </div>
        </el-empty>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { DashboardItemDef } from "@eimsnext/models";
import { useLocale } from "element-plus";
import { chartSettingValidate, IChartSetting } from "../ECharts/type";
import EChartsViewer from "../ECharts/EChartsViewer.vue";
const { t } = useLocale();

defineOptions({
  name: "DashItemCard",
});

const props = withDefaults(
  defineProps<{
    itemDef: DashboardItemDef;
    isView?: boolean;
    height?: number;
    width?: number;
  }>(),
  {
    isView: false,
  }
);

const chartSetting = ref<IChartSetting>(JSON.parse(props.itemDef.details));

const emit = defineEmits(["hide", "edit", "copy", "delete"]);
const onHide = () => {
  emit("hide", props.itemDef);
};
const onEdit = () => {
  emit("edit", props.itemDef);
};
const onCopy = () => {
  emit("copy", props.itemDef);
};
const onDelete = () => {
  emit("delete", props.itemDef);
};
</script>
<style lang="scss" scoped>
// 核心card容器
.layout-grid-item {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--et-bg-container);
  box-shadow: var(--et-shadow-md);
  z-index: 10;
  transition:
    left,
    top 0.2s ease;

  // 关键：强制开启hover触发，不受子层拦截影响
  &:hover {
    .header-action-container {
      opacity: 1 !important;
      visibility: visible !important;
    }
  }

  // 拖拽层：允许穿透鼠标事件（核心修复，不再拦截hover）
  .container-group-drag-handle {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    cursor: move;
    z-index: 1;
    pointer-events: none; // 新增：穿透鼠标事件，让hover能触发到父容器
  }

  // 卡片头部
  .container-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--et-size-40);
    padding: var(--et-space-4);
    line-height: var(--et-line-height-30);
    z-index: 2;
    box-sizing: border-box; // 新增：盒模型防偏移

    // 操作按钮容器（核心样式重置）
    .header-action-container {
      position: absolute;
      top: 50%;
      right: var(--et-space-8);
      z-index: 99; // 大幅提高层级，避免任何遮挡
      transform: translateY(-50%); // 垂直居中，对齐头部
      display: flex;
      align-items: center;
      color: var(--et-text-secondary);
      cursor: pointer;
      // 默认隐藏（双重保障，hover强制显示）
      opacity: 0;
      visibility: hidden;
      pointer-events: auto;
      // 平滑过渡，无闪跳
      transition:
        opacity 0.2s ease,
        visibility 0.2s ease,
        transform 0.2s ease;

      // 按钮组外层
      .header-action {
        display: flex;
        align-items: center;
        background: var(--et-bg-container);
        border-radius: var(--et-radius-3);
        box-shadow: var(--et-shadow-overlay);
        padding: var(--et-space-2) 0;

        // 通用操作按钮
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--et-size-30);
          height: var(--et-size-30);
          min-width: var(--et-size-30);
          line-height: var(--et-line-height-30);
          text-align: center;
          border-radius: var(--et-radius-2);
          transition: all 0.2s ease;

          // 按钮hover高亮
          &:hover {
            color: var(--et-color-primary);
            background: var(--et-bg-hover);
          }
        }

        // 自定义线条按钮（保留原有定位，不影响主按钮）
        .action-btn.custom-line-action {
          position: absolute;
          top: var(--et-size-30);
          right: 0;
          width: 0;
          height: 0;
          pointer-events: none;
        }
      }
    }

    // 标题容器
    .header-title {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 var(--et-space-12);
      font-weight: 700;
      color: var(--et-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      pointer-events: none; // 标题无需点击，穿透事件

      .title-text {
        flex: 0 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  // 卡片内容区
  .container-content-wrapper {
    position: absolute;
    top: var(--et-space-0);
    left: var(--et-space-10);
    right: var(--et-space-10);
    bottom: var(--et-space-10);
    overflow: hidden;
    pointer-events: none;
    box-sizing: border-box;

    .et-dash-empty {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;

      .empty-wrapper {
        text-align: center;
        color: var(--et-text-tertiary);

        .empty-text {
          margin-top: var(--et-space-10);
        }
      }
    }
  }
}
</style>
