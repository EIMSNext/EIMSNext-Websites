<template>
    <et-drawer v-model="drawerVisible" :closing="beforeClose" @close="close">
      <template #title>
        <span class="drawer-title">{{ t("admin.workbench.customize") }}</span>
      </template>
      <template #top-right>
        <el-link type="primary" :underline="false" class="drawer-help">{{ t("admin.workbench.help") }}</el-link>
        <!-- <el-button-group>
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
        </el-button> -->
        <el-button @click="preview">{{ t("common.preview") }}</el-button>
        <el-button type="primary" :loading="saving" @click="save">{{ t("common.save") }}</el-button>
      </template>
      <div class="workbench-designer">

        <div class="designer-body">
          <aside class="component-panel">
            <div class="panel-title">{{ t("admin.workbench.pageComponents") }}</div>
            <div
              v-for="component in enabledComponents"
              :key="component.type"
              class="component-item"
              :class="{ disabled: !canAdd(component.type) }"
              @click="handleItemClick(component.type)"
            >
              <et-icon :icon="component.icon" />
              <span>{{ component.label }}</span>
            </div>
            <div class="panel-separator" />
            <el-tooltip
              v-for="component in disabledComponents"
              :key="component.label"
              :content="t('admin.workbench.comingSoon')"
              placement="right"
            >
              <div class="component-item disabled">
                <et-icon :icon="component.icon" />
                <span>{{ component.label }}</span>
              </div>
            </el-tooltip>
          </aside>

          <main class="canvas-wrap">
            <div class="canvas">
              <grid-layout
                v-model:layout="editableLayout"
                class="workbench-designer-grid"
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
                  />
                </grid-item>
              </grid-layout>
            </div>
          </main>
        </div>
      </div>
    </et-drawer>
    <el-drawer v-model="previewVisible" class="workbench-preview-drawer" direction="btt" size="95%" append-to-body :with-header="false" :show-close="false">
      <div class="workbench-preview-shell">
        <div class="workbench-preview-toolbar">
          <div class="workbench-preview-device" role="group">
            <button
              type="button"
              :class="{ active: previewDevice === 'pc' }"
              :title="t('props.pc')"
              :aria-label="t('props.pc')"
              @click="previewDevice = 'pc'"
            >
              <et-icon icon="el-Monitor" />
            </button>
            <button
              type="button"
              :class="{ active: previewDevice === 'mobile' }"
              :title="t('props.mobile')"
              :aria-label="t('props.mobile')"
              @click="previewDevice = 'mobile'"
            >
              <et-icon icon="el-Iphone" />
            </button>
          </div>
          <button type="button" class="workbench-preview-close" :title="t('common.close')" :aria-label="t('common.close')" @click="previewVisible = false">
            <et-icon icon="el-Close" size="20px" />
          </button>
        </div>
        <div class="workbench-preview-body" :class="{ 'is-mobile': previewDevice === 'mobile' }">
          <div class="workbench-preview-viewport">
            <div class="workbench-preview">
              <grid-layout v-model:layout="previewLayout" class="workbench-preview-grid" :col-num="24" :row-height="24" :margin="[16, 16]" :is-draggable="false" :is-resizable="false" :is-bounded="true" :vertical-compact="true" :use-css-transforms="true" :responsive="false">
                <grid-item v-for="item in previewLayout" :key="item.i" v-bind="item" :minW="item.minW || 5" :minH="1" :maxW="24" :maxH="999">
                  <WorkbenchWidgetRenderer :item="item" preview @content-height="syncPreviewHeight(item.i, $event)" />
                </grid-item>
              </grid-layout>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
</template>

<script setup lang="ts">
import type { WorkbenchLayoutItem, WorkbenchWidgetType } from "@eimsnext/models";
import { UserType } from "@eimsnext/models";
import { useUserStore } from "@eimsnext/store";
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import {
  cloneWorkbenchLayout,
  createWorkbenchWidget,
  isFixedWorkbenchWidget,
  normalizeWorkbenchLayout,
  useWorkbenchStore,
  WIDGET_FIXED_HEIGHT,
} from "@/store";
import WorkbenchWidgetRenderer from "./components/WorkbenchWidgetRenderer.vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "WorkbenchCustomize",
  inheritAttrs: false,
});

const router = useRouter();
const { t } = useI18n();
const userStore = useUserStore();
const workbenchStore = useWorkbenchStore();
const { layout } = storeToRefs(workbenchStore);
const editableLayout = ref<WorkbenchLayoutItem[]>([]);
const saving = ref(false);
const isDirty = ref(false);
const drawerVisible = ref(true);
const previewVisible = ref(false);
const previewLayout = ref<WorkbenchLayoutItem[]>([]);
const previewDevice = ref<"pc" | "mobile">("pc");
const skipRouteLeave = ref(false);
const GRID_ROW_HEIGHT = 24;
const GRID_ROW_GAP = 16;

const enabledComponents = computed<{ type: WorkbenchWidgetType; label: string; icon: string }[]>(() => [
  { type: "flowCenter", label: t("admin.flowcenter"), icon: "icon-flowdefault" },
  { type: "myApps", label: t("admin.myApp"), icon: "icon-appdefault" },
  { type: "recent", label: t("admin.workbench.recent"), icon: "el-clock" },
  { type: "favorites", label: t("admin.workbench.favorites"), icon: "el-star" },
  { type: "chartBoard", label: t("admin.workbench.myChart"), icon: "el-DataAnalysis" },
]);

const disabledComponents = computed(() => [
  { label: t("admin.workbench.quickLink"), icon: "el-link" },
  { label: t("admin.workbench.richText"), icon: "el-document" },
  { label: t("admin.workbench.carousel"), icon: "el-picture" },
  { label: t("admin.workbench.myChart"), icon: "el-DataAnalysis" },
  { label: t("admin.workbench.externalApp"), icon: "el-OfficeBuilding" },
  { label: t("admin.workbench.greeting"), icon: "el-MagicStick" },
]);

const existingTypes = computed(
  () => new Set(editableLayout.value.map((item) => item.type))
);

const canAdd = (type: WorkbenchWidgetType) => {
  if (type === "flowCenter" || type === "myApps") return false;
  if (type === "recent" || type === "favorites" || type === "chartBoard") {
    return !existingTypes.value.has(type);
  }
  return true;
};

const handleItemClick = (type: WorkbenchWidgetType) => {
  if (!canAdd(type)) return;
  addWidget(type);
};

const suppressDirty = ref(false);
const syncLayout = () => {
  const cloned = cloneWorkbenchLayout(normalizeWorkbenchLayout(layout.value));
  suppressDirty.value = true;
  editableLayout.value = cloned;
  nextTick(() => {
    suppressDirty.value = false;
  });
};

const addWidget = (type: WorkbenchWidgetType) => {
  if (!canAdd(type)) return;

  const bottom = editableLayout.value.reduce((value, item) => Math.max(value, item.y + item.h), 0);
  editableLayout.value.push(createWorkbenchWidget(type, { y: bottom }));

};

const removeWidget = (item: WorkbenchLayoutItem) => {
  if (isFixedWorkbenchWidget(item.type)) return;
  editableLayout.value = editableLayout.value.filter((current) => current.i !== item.i);
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
    isDirty.value = false;
    ElMessage.success(t("common.saveSuccess"));
  } catch (e) {
    ElMessage.error(t("common.saveFailed"));
  } finally {
    saving.value = false;
  }
};

const preview = async () => {
  previewLayout.value = cloneWorkbenchLayout(editableLayout.value);
  previewDevice.value = "pc";
  previewVisible.value = true;
};

const syncPreviewHeight = (id: string, height: number) => {
  const item = previewLayout.value.find((current) => current.i === id);
  if (!item) return;
  const nextHeight = Math.max(
    1,
    Math.ceil((height + GRID_ROW_GAP) / (GRID_ROW_HEIGHT + GRID_ROW_GAP))
  );
  if (item.h === nextHeight) return;

  const nextLayout = previewLayout.value.map((current) =>
    current.i === id ? { ...current, h: nextHeight } : { ...current }
  );
  const ordered = [...nextLayout].sort((left, right) => left.y - right.y || left.x - right.x);
  const placed: WorkbenchLayoutItem[] = [];
  ordered.forEach((current) => {
    current.y = placed.reduce((nextY, previous) => {
      const overlapsX =
        current.x < previous.x + previous.w && previous.x < current.x + current.w;
      return overlapsX ? Math.max(nextY, previous.y + previous.h) : nextY;
    }, 0);
    placed.push(current);
  });
  previewLayout.value = nextLayout;
};

const beforeClose = async (): Promise<boolean> => {
  if (isDirty.value) {
    try {
      await ElMessageBox.confirm(
        t("admin.workbench.unsavedChanges"),
        t("common.confirm"),
        { type: "warning" }
      );
    } catch {
      return false;
    }
  }
  return true;
};

const close = () => {
  skipRouteLeave.value = true;
  router.push("/workbench");
};

onBeforeRouteLeave(async (_to, _from, next) => {
  if (skipRouteLeave.value || (await beforeClose())) {
    next();
  } else {
    next(false);
  }
});

const beforeUnload = (e: BeforeUnloadEvent) => {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = "";
  }
};

onMounted(async () => {
  const userType = userStore.currentUser?.userType ?? 0;
  const isCorpAdmin =
    (userType & UserType.CorpOwmer) !== 0 || (userType & UserType.CorpAdmin) !== 0;
  if (!isCorpAdmin) {
    ElMessage.error(t("admin.errorPage.noPermission"));
    router.replace("/401");
    return;
  }

  await workbenchStore.load();
  await workbenchStore.loadCatalog();
  syncLayout();

  window.addEventListener("beforeunload", beforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeUnload);
});

watch(
  editableLayout,
  () => {
    if (suppressDirty.value) return;
    isDirty.value = true;
  },
  { deep: true }
);

watch(layout, syncLayout, { deep: true });
</script>

<style lang="scss" scoped>
.workbench-designer {
  background: var(--et-bg-page);
  height: 100%;
  min-height: 0;
}

.workbench-preview {
  background: var(--et-bg-page);
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: auto;
}

.workbench-preview-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.workbench-preview-toolbar {
  align-items: center;
  background: var(--et-bg-container);
  border-bottom: 1px solid var(--et-border-color);
  box-sizing: border-box;
  display: flex;
  flex: 0 0 50px;
  justify-content: center;
  position: relative;
}

.workbench-preview-device {
  align-items: center;
  background: var(--et-bg-page);
  border-radius: var(--et-radius-4);
  display: flex;
  gap: 2px;
  padding: 2px;
}

.workbench-preview-device > button {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--et-radius-4);
  color: var(--et-text-secondary);
  cursor: pointer;
  display: inline-flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  width: 72px;
}

.workbench-preview-device > button.active {
  background: var(--et-bg-container);
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
  color: var(--et-color-primary);
}

.workbench-preview-body {
  align-items: stretch;
  background: var(--et-bg-page);
  display: flex;
  flex: 1 1 auto;
  justify-content: stretch;
  min-height: 0;
  overflow: hidden;
  padding: var(--et-space-10);
}

.workbench-preview-viewport {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.workbench-preview-body.is-mobile {
  align-items: center;
  justify-content: center;
  padding: var(--et-space-10);
}

.workbench-preview-body.is-mobile .workbench-preview-viewport {
  border: 6px solid var(--et-border-color);
  border-radius: 24px;
  box-sizing: border-box;
  flex: 0 1 350px;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
}

.workbench-preview-grid { min-height: 100%; }

.workbench-preview-close {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--et-text-primary);
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: var(--et-space-6);
  position: absolute;
  right: var(--et-space-16);
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

:global(.workbench-preview-drawer.el-drawer) {
  border-radius: 0;
  padding: 0;
}

:global(.workbench-preview-drawer .el-drawer__body) {
  overflow: hidden;
  padding: 0;
}

.drawer-title {
  color: var(--et-text-primary);
  font-size: var(--et-font-size-16);
  font-weight: 700;
}

.drawer-help {
  margin-right: var(--et-space-12);
}

.designer-body {
  display: flex;
  height: 100%;
  min-height: 0;
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
  padding: 0;
}

.canvas {
  min-height: 100%;
}

.workbench-designer-grid {
  min-height: 100%;
}

:deep(.workbench-designer-grid > .vue-grid-item) {
  overflow: visible;
}
</style>
