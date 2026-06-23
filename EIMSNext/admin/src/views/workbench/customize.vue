<template>
  <Layout>
    <div class="workbench-designer">
      <div class="designer-header">
        <div class="header-title">
          <el-button link @click="router.push('/workbench')">
            <et-icon icon="el-arrowLeft" />
          </el-button>
          <span>{{ t("admin.workbench.customize") }}</span>
        </div>
        <el-link type="primary" :underline="false">{{ t("admin.workbench.help") }}</el-link>
        <div class="header-actions">
          <el-button-group>
            <el-button type="primary" plain>
              <et-icon icon="el-Monitor" />
            </el-button>
            <el-button plain>
              <et-icon icon="el-Iphone" />
            </el-button>
          </el-button-group>
          <el-button disabled>
            <et-icon icon="el-document" />
            {{ t("admin.workbench.pageStyle") }}
          </el-button>
          <el-button @click="preview">{{ t("common.preview") }}</el-button>
          <el-button type="primary" :loading="saving" @click="save">{{ t("common.save") }}</el-button>
        </div>
      </div>

      <div class="designer-body">
        <aside class="component-panel">
          <div class="panel-title">{{ t("admin.workbench.pageComponents") }}</div>
          <div
            v-for="component in enabledComponents"
            :key="component.type"
            class="component-item"
            :class="{ disabled: !canAdd(component.type) }"
            @click="addWidget(component.type)"
          >
            <et-icon :icon="component.icon" />
            <span>{{ component.label }}</span>
          </div>
          <div class="panel-separator" />
          <div v-for="component in disabledComponents" :key="component.label" class="component-item disabled">
            <et-icon :icon="component.icon" />
            <span>{{ component.label }}</span>
          </div>
        </aside>

        <main class="canvas-wrap">
          <div class="canvas">
            <grid-layout
              v-model:layout="editableLayout"
              :col-num="24"
              :row-height="24"
              :is-draggable="true"
              :is-resizable="true"
              :is-mirrored="false"
              :is-bounded="true"
              :vertical-compact="true"
              :margin="[16, 16]"
              :use-css-transforms="true"
              :responsive="false"
            >
              <grid-item
                v-for="item in editableLayout"
                :key="item.i"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                :minW="item.minW || 5"
                :minH="getMinHeight(item)"
                :maxW="24"
                :maxH="getMaxHeight(item)"
                drag-ignore-from=".no-drag"
                resize-ignore-from=".no-drag"
                @resized="handleResized"
              >
                <WorkbenchWidgetRenderer
                  :item="item"
                  editable
                  @remove="removeWidget(item)"
                  @configure-chart="openChartDialog(item)"
                  @add-favorite="showFavoriteDialog = true"
                />
              </grid-item>
            </grid-layout>
          </div>
        </main>
      </div>
    </div>
    <AddFavoriteDialog v-model="showFavoriteDialog" />
    <ChartSelectDialog
      v-model="showChartDialog"
      :dashboard-item-id="activeChartItem?.config?.dashboardItemId"
      @select="handleChartSelected"
    />
  </Layout>
</template>

<script setup lang="ts">
import type { WorkbenchLayoutItem, WorkbenchWidgetType } from "@eimsnext/models";
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import Layout from "@/layout/index.vue";
import {
  cloneWorkbenchLayout,
  createWorkbenchWidget,
  isFixedWorkbenchWidget,
  normalizeWorkbenchLayout,
  useWorkbenchStore,
  WIDGET_FIXED_HEIGHT,
} from "@/store";
import WorkbenchWidgetRenderer from "./components/WorkbenchWidgetRenderer.vue";
import AddFavoriteDialog from "./components/AddFavoriteDialog.vue";
import ChartSelectDialog from "./components/ChartSelectDialog.vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "WorkbenchCustomize",
  inheritAttrs: false,
});

const router = useRouter();
const { t } = useI18n();
const workbenchStore = useWorkbenchStore();
const { layout } = storeToRefs(workbenchStore);
const editableLayout = ref<WorkbenchLayoutItem[]>([]);
const saving = ref(false);
const showFavoriteDialog = ref(false);
const showChartDialog = ref(false);
const activeChartItem = ref<WorkbenchLayoutItem>();

const enabledComponents = computed<{ type: WorkbenchWidgetType; label: string; icon: string }[]>(() => [
  { type: "flowCenter", label: t("admin.flowcenter"), icon: "icon-flow" },
  { type: "myApps", label: t("admin.myApp"), icon: "icon-appdefault" },
  { type: "chartBoard", label: t("admin.workbench.chartBoard"), icon: "el-DataAnalysis" },
  { type: "recent", label: t("admin.workbench.recent"), icon: "el-clock" },
  { type: "favorites", label: t("admin.workbench.favorites"), icon: "el-star" },
]);

const disabledComponents = computed(() => [
  { label: t("admin.workbench.quickLink"), icon: "el-link" },
  { label: t("admin.workbench.richText"), icon: "el-document" },
  { label: t("admin.workbench.carousel"), icon: "el-picture" },
  { label: t("admin.workbench.myChart"), icon: "el-DataAnalysis" },
  { label: t("admin.workbench.externalApp"), icon: "el-OfficeBuilding" },
  { label: t("admin.workbench.greeting"), icon: "el-MagicStick" },
]);

const oneOffTypes: WorkbenchWidgetType[] = ["flowCenter", "myApps", "recent", "favorites"];

const canAdd = (type: WorkbenchWidgetType) => {
  if (type === "flowCenter" || type === "myApps") {
    return false;
  }
  return !oneOffTypes.includes(type) || !editableLayout.value.some((item) => item.type === type);
};

const syncLayout = () => {
  editableLayout.value = cloneWorkbenchLayout(normalizeWorkbenchLayout(layout.value));
};

const addWidget = (type: WorkbenchWidgetType) => {
  if (!canAdd(type)) return;

  const bottom = editableLayout.value.reduce((value, item) => Math.max(value, item.y + item.h), 0);
  const item = createWorkbenchWidget(type, { y: bottom });
  editableLayout.value.push(item);

  if (type === "chartBoard") {
    openChartDialog(item);
  }
};

const removeWidget = (item: WorkbenchLayoutItem) => {
  if (isFixedWorkbenchWidget(item.type)) return;
  editableLayout.value = editableLayout.value.filter((current) => current.i !== item.i);
};

const openChartDialog = (item: WorkbenchLayoutItem) => {
  if (item.type !== "chartBoard") return;
  activeChartItem.value = item;
  showChartDialog.value = true;
};

const handleChartSelected = (value: { dashboardId: string; dashboardItemId: string; title: string }) => {
  if (!activeChartItem.value) return;
  activeChartItem.value.config = {
    ...activeChartItem.value.config,
    dashboardId: value.dashboardId,
    dashboardItemId: value.dashboardItemId,
    title: value.title,
  };
};

const getMinHeight = (item: WorkbenchLayoutItem) => {
  return item.type === "chartBoard" ? item.minH || 5 : WIDGET_FIXED_HEIGHT[item.type] || item.h;
};

const getMaxHeight = (item: WorkbenchLayoutItem) => {
  return item.type === "chartBoard" ? 60 : WIDGET_FIXED_HEIGHT[item.type] || item.h;
};

const handleResized = (i: string | number, newH: number, newW: number) => {
  const item = editableLayout.value.find((current) => current.i === String(i));
  if (!item) return;
  item.w = newW;
  if (item.type !== "chartBoard") {
    const fixedHeight = WIDGET_FIXED_HEIGHT[item.type] || item.h;
    item.h = fixedHeight;
    item.minH = fixedHeight;
    item.maxH = fixedHeight;
  } else {
    item.h = newH;
  }
};

const save = async () => {
  saving.value = true;
  try {
    await workbenchStore.saveLayout(editableLayout.value);
    syncLayout();
    ElMessage.success(t("common.saveSuccess"));
  } finally {
    saving.value = false;
  }
};

const preview = async () => {
  await save();
  router.push("/workbench");
};

onMounted(async () => {
  await workbenchStore.load();
  await workbenchStore.loadCatalog();
  syncLayout();
});

watch(layout, syncLayout, { deep: true });
</script>

<style lang="scss" scoped>
.workbench-designer {
  background: var(--et-bg-page);
  min-height: calc(100vh - var(--et-size-50));
}

.designer-header {
  align-items: center;
  background: var(--et-bg-container);
  border-bottom: 1px solid var(--et-border-color);
  display: flex;
  gap: var(--et-space-24);
  height: var(--et-size-56);
  padding: 0 var(--et-space-18);
}

.header-title {
  align-items: center;
  color: var(--et-text-primary);
  display: flex;
  font-size: var(--et-font-size-16);
  font-weight: 700;
  gap: var(--et-space-8);
}

.header-actions {
  align-items: center;
  display: flex;
  gap: var(--et-space-10);
  margin-left: auto;
}

.designer-body {
  display: flex;
  min-height: calc(100vh - var(--et-size-106));
}

.component-panel {
  background: var(--et-bg-container);
  border-right: 1px solid var(--et-border-color);
  flex: 0 0 var(--et-size-180);
  padding: var(--et-space-12) var(--et-space-8);
}

.panel-title {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-14);
  font-weight: 700;
  margin-bottom: var(--et-space-8);
  padding: 0 var(--et-space-8);
}

.component-item {
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--et-radius-4);
  color: var(--et-text-primary);
  cursor: pointer;
  display: flex;
  gap: var(--et-space-10);
  height: var(--et-size-38);
  margin: var(--et-space-6) 0;
  padding: 0 var(--et-space-10);

  &:hover {
    background: var(--et-bg-page);
    border-color: var(--et-border-color);
  }

  &.disabled {
    color: var(--et-text-disabled);
    cursor: not-allowed;

    &:hover {
      background: transparent;
      border-color: transparent;
    }
  }
}

.panel-separator {
  border-top: 1px solid var(--et-border-color);
  margin: var(--et-space-12) 0;
}

.canvas-wrap {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: var(--et-space-24);
}

.canvas {
  min-height: calc(100vh - var(--et-size-160));
}

:deep(.vue-grid-layout) {
  min-height: calc(100vh - var(--et-size-160));
}

:deep(.vue-grid-item) {
  overflow: visible;
}
</style>
