<template>
  <LayoutContainerCard
    v-if="itemDef.itemType === DashItemType.LayoutContainer"
    :item-def="itemDef"
    :layout="layout"
    :items="items"
    :is-view="isView"
    :is-public="isPublic"
    :public-token="publicToken"
    :external-filters="externalFilters"
    @update-layout="emit('update-layout', $event)"
    @update-setting="(...args) => emit('update-setting', ...args)"
    @edit="emit('edit', $event)"
    @delete="emit('delete', $event)"
    @filter-change="onFilterValueChanged"
    @update-realtime-setting="(...args) => emit('update-realtime-setting', ...args)"
    @update-image-setting="(...args) => emit('update-image-setting', ...args)"
    @update-text-setting="(...args) => emit('update-text-setting', ...args)"
  />
  <div v-else class="layout-grid-item">
    <div class="container-group-drag-handle"></div>
    <div v-if="!isView" class="container-header">
      <div class="header-action-container">
        <div class="header-action">
          <div class="action-btn" :title="t('admin.dashItem.hideOnDesktop')" @click="onHide">
            <et-icon icon="el-hide" />
          </div>
          <el-popover v-if="itemDef.itemType === DashItemType.RealTime && realTimeSetting" v-model:visible="realtimeSettingsVisible" placement="bottom-end" trigger="click" width="310">
            <RealTimeSettings :model-value="realTimeSetting" @updated="onRealTimeSettingUpdated" />
            <template #reference>
              <div class="action-btn" :title="t('common.edit')"><et-icon icon="el-editPen" /></div>
            </template>
          </el-popover>
          <el-popover v-else-if="itemDef.itemType === DashItemType.Image && imageSetting" v-model:visible="imageSettingsVisible" placement="bottom-end" trigger="click" width="360">
            <ImageSettings :model-value="imageSetting" @updated="onImageSettingUpdated" />
            <template #reference>
              <div class="action-btn" :title="t('common.edit')"><et-icon icon="el-editPen" /></div>
            </template>
          </el-popover>
          <div v-else-if="itemDef.itemType === DashItemType.Text && textSetting" class="action-btn" :title="t('common.edit')" @click="toggleTextEditing">
            <et-icon :icon="textEditing ? 'el-check' : 'el-editPen'" />
          </div>
          <div v-else class="action-btn" :title="t('common.edit')" @click="onEdit"><et-icon icon="el-editPen" /></div>
          <div class="action-btn" :title="t('admin.dashItem.copy')" @click="onCopy">
            <et-icon icon="el-documentCopy" />
          </div>
          <div class="action-btn" :title="t('common.delete')" @click="onDelete"><et-icon icon="el-delete" /></div>
          <span></span>
          <div class="action-btn custom-line-action"></div>
        </div>
      </div>
      <div class="header-title">
        <span class="title-text item-text">{{ itemTitle }}</span>
      </div>
    </div>
    <div class="container-content-wrapper" :class="{ interactive: isInteractiveContent }">
      <template v-if="itemDef.itemType == DashItemType.Chart && chartSetting && chartSettingValidate(chartSetting)">
        <e-charts-viewer
          :setting="chartSetting"
          :title="itemTitle"
          :show-header="isView"
          :external-filter="externalFilter"
          :is-public="isPublic"
          :public-token="publicToken"
          :item-def="itemDef"
        />
      </template>
      <template v-else-if="itemDef.itemType == DashItemType.DetailTable && detailTableSetting && detailTableSettingValidate(detailTableSetting)">
        <DetailTableViewer
          :setting="detailTableSetting"
          :title="itemTitle"
          :show-header="isView"
          :external-filter="externalFilter"
          :is-public="isPublic"
          :public-token="publicToken"
          :item-def="itemDef"
        />
      </template>
      <template v-else-if="itemDef.itemType == DashItemType.Filter">
        <FilterWidgetCard :item-def="itemDef" :is-public="isPublic" @change="onFilterValueChanged" />
      </template>
      <template v-else-if="itemDef.itemType == DashItemType.RealTime && realTimeSetting">
        <RealtimeViewer :setting="realTimeSetting" />
      </template>
      <template v-else-if="itemDef.itemType == DashItemType.Image && imageSetting">
        <ImageViewer :setting="imageSetting" />
      </template>
      <template v-else-if="itemDef.itemType == DashItemType.Text && textSetting">
        <TextEditor v-if="!isView && textEditing" v-model="textDraft" @blur="persistTextDraft" />
        <TextViewer v-else :setting="textSetting" />
      </template>
      <template v-else>
        <el-empty class="et-dash-empty">
          <div class="empty-wrapper">
            <i class="x-icon iconfont-fx-pc icon-info-o"></i>
            <div class="empty-text">{{ t("admin.dashItem.invalidConfig") }}</div>
          </div>
        </el-empty>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { DashboardItemDef, DashItemType } from "@eimsnext/models";
import { onBeforeUnmount } from "vue";
import { useLocale } from "element-plus";
import { chartSettingValidate, IChartSetting } from "../ECharts/type";
import EChartsViewer from "../ECharts/EChartsViewer.vue";
import FilterWidgetCard from "./FilterWidgetCard.vue";
import DetailTableViewer from "../DetailTable/DetailTableViewer.vue";
import { detailTableSettingValidate, IDetailTableSetting, parseDetailTableSetting } from "../DetailTable/type";
import LayoutContainerCard from "../LayoutContainer/LayoutContainerCard.vue";
import { IGridLayoutItem } from "@eimsnext/models";
import RealtimeViewer from "../RealTime/RealtimeViewer.vue";
import RealTimeSettings from "../RealTime/RealTimeSettings.vue";
import { parseRealTimeSetting, IRealTimeSetting } from "../RealTime/type";
import ImageViewer from "../Image/ImageViewer.vue";
import ImageSettings from "../Image/ImageSettings.vue";
import { IDashboardImageSetting, parseDashboardImageSetting } from "../Image/type";
import TextViewer from "../Text/TextViewer.vue";
import TextEditor from "../Text/TextEditor.vue";
import { IDashboardTextSetting, parseDashboardTextSetting, sanitizeDashboardHtml } from "../Text/type";
const { t } = useLocale();

defineOptions({
  name: "DashItemCard",
});

const props = withDefaults(
  defineProps<{
    itemDef: DashboardItemDef;
    isView?: boolean;
    isPublic?: boolean;
    publicToken?: string;
    height?: number;
    width?: number;
    externalFilter?: any;
    externalFilters?: Record<string, any>;
    layout?: IGridLayoutItem[];
    items?: Record<string, DashboardItemDef>;
  }>(),
  {
    isView: false,
    isPublic: false,
    externalFilters: () => ({}),
    layout: () => [],
    items: () => ({}),
  }
);

const chartSetting = computed<IChartSetting | undefined>(() => {
  if (props.itemDef.itemType != DashItemType.Chart) {
    return undefined;
  }

  try {
    return JSON.parse(props.itemDef.details || "{}") as IChartSetting;
  } catch {
    return undefined;
  }
});

const detailTableSetting = computed<IDetailTableSetting | undefined>(() => {
  if (props.itemDef.itemType != DashItemType.DetailTable) {
    return undefined;
  }

  return parseDetailTableSetting(props.itemDef.details);
});

const realTimeSetting = computed<IRealTimeSetting | undefined>(() => parseRealTimeSetting(props.itemDef.details));
const realtimeSettingsVisible = ref(false);
const imageSetting = computed<IDashboardImageSetting | undefined>(() => parseDashboardImageSetting(props.itemDef.details));
const imageSettingsVisible = ref(false);
const textSetting = computed<IDashboardTextSetting | undefined>(() => parseDashboardTextSetting(props.itemDef.details));
const textEditing = ref(false);
const textDraft = ref("");
const lastSavedText = ref("");

const itemTitle = computed(() => {
  if (props.itemDef.name) {
    return props.itemDef.name;
  }

  if (props.itemDef.itemType == DashItemType.DetailTable) {
    return t("admin.untitledDetailTable");
  }

  if (props.itemDef.itemType == DashItemType.Filter) {
    return t("admin.dashboardDesigner.filterWidgetName");
  }

  if (props.itemDef.itemType == DashItemType.Image) {
    return t("admin.dashboardDesigner.imageComponent");
  }

  if (props.itemDef.itemType == DashItemType.Text) {
    return t("admin.dashboardDesigner.textComponent");
  }

  return t("admin.untitledChart");
});

const isInteractiveContent = computed(() => {
  return props.itemDef.itemType === DashItemType.Text || (props.isView && [DashItemType.Filter, DashItemType.DetailTable].includes(props.itemDef.itemType));
});

const emit = defineEmits(["hide", "edit", "copy", "delete", "filter-change", "update-layout", "update-setting", "update-realtime-setting", "update-image-setting", "update-text-setting"]);
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
const onFilterValueChanged = (payload: { itemId: string; value: any }) => {
  emit("filter-change", payload);
};
const onRealTimeSettingUpdated = (setting: IRealTimeSetting) => {
  realtimeSettingsVisible.value = false;
  emit("update-realtime-setting", props.itemDef, setting);
};
const onImageSettingUpdated = (setting: IDashboardImageSetting) => {
  emit("update-image-setting", props.itemDef, setting);
};
const beginTextEditing = () => {
  if (!textSetting.value) return;
  textDraft.value = textSetting.value.html;
  lastSavedText.value = textSetting.value.html;
  textEditing.value = true;
};
const persistTextDraft = () => {
  if (!textSetting.value) return;
  const html = sanitizeDashboardHtml(textDraft.value);
  textDraft.value = html;
  if (html === lastSavedText.value) return;
  lastSavedText.value = html;
  emit("update-text-setting", props.itemDef, { version: 1, kind: "text", html } as IDashboardTextSetting);
};
const toggleTextEditing = () => {
  if (textEditing.value) {
    persistTextDraft();
    textEditing.value = false;
    return;
  }
  beginTextEditing();
};
onBeforeUnmount(() => {
  if (textEditing.value) persistTextDraft();
});
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

    &.interactive {
      pointer-events: auto;
    }

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

    .tool-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--et-space-8);
      color: var(--et-text-secondary);
      pointer-events: none;
    }
  }
}
</style>
