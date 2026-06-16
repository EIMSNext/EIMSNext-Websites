<template>
  <Layout>
    <div class="workbench-container">
      <grid-layout
        v-if="!loading"
        v-model:layout="runtimeLayout"
        :col-num="24"
        :row-height="24"
        :is-draggable="false"
        :is-resizable="false"
        :is-mirrored="false"
        :is-bounded="true"
        :vertical-compact="true"
        :margin="[16, 16]"
        :use-css-transforms="true"
        :responsive="false"
      >
        <grid-item
          v-for="item in runtimeLayout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :minW="item.minW || 5"
          :minH="item.minH || 5"
          :maxW="24"
          :maxH="60"
        >
          <WorkbenchWidgetRenderer :item="item" />
        </grid-item>
      </grid-layout>
      <div v-else class="workbench-loading">工作台加载中...</div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import type { WorkbenchLayoutItem } from "@eimsnext/models";
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import Layout from "@/layout/index.vue";
import {
  cloneWorkbenchLayout,
  normalizeWorkbenchLayout,
  useWorkbenchStore,
} from "@/store";
import WorkbenchWidgetRenderer from "./components/WorkbenchWidgetRenderer.vue";

defineOptions({
  name: "Workbench",
  inheritAttrs: false,
});

const workbenchStore = useWorkbenchStore();
const { layout, loading } = storeToRefs(workbenchStore);
const runtimeLayout = ref<WorkbenchLayoutItem[]>([]);

watch(
  layout,
  (value) => {
    runtimeLayout.value = cloneWorkbenchLayout(normalizeWorkbenchLayout(value));
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  await workbenchStore.load();
});
</script>

<style lang="scss" scoped>
.workbench-container {
  background: var(--et-bg-page);
  min-height: calc(100vh - var(--et-size-50));
  padding: var(--et-space-24);
}

.workbench-loading {
  align-items: center;
  color: var(--et-text-tertiary);
  display: flex;
  height: var(--et-size-180);
  justify-content: center;
}

:deep(.vue-grid-layout) {
  min-height: calc(100vh - var(--et-size-120));
}

:deep(.vue-grid-item) {
  overflow: visible;
}
</style>
