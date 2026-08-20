<template>
    <et-drawer v-model="drawerVisible" :closing="beforeClose" @close="close">
      <template #title>
        <span class="drawer-title">{{ t("admin.workbench.customize") }}</span>
      </template>
      <template #top-right>
        <el-link type="primary" :underline="false" class="drawer-help">{{ t("admin.workbench.help") }}</el-link>
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
const skipRouteLeave = ref(false);

const enabledComponents = computed<{ type: WorkbenchWidgetType; label: string; icon: string }[]>(() => [
  { type: "flowCenter", label: t("admin.flowcenter"), icon: "icon-flow" },
  { type: "myApps", label: t("admin.myApp"), icon: "icon-appdefault" },
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

const existingTypes = computed(
  () => new Set(editableLayout.value.map((item) => item.type))
);

const canAdd = (type: WorkbenchWidgetType) => {
  if (type === "flowCenter" || type === "myApps") return false;
  if (type === "recent" || type === "favorites") {
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
  await save();
  router.push("/workbench");
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
