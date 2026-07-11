<template>
  <Layout>
    <div class="workbench-container">
      <div class="workbench-toolbar">
        <el-button
          v-if="hasCorpAdmin"
          type="primary"
          :icon="Setting"
          @click="router.push('/workbench/customize')"
        >
          {{ t("admin.workbench.customize") }}
        </el-button>
      </div>
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
      <div v-else class="workbench-loading">{{ t("admin.workbench.loading") }}</div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import type { WorkbenchLayoutItem } from "@eimsnext/models";
import { UserType } from "@eimsnext/models";
import { useUserStore } from "@eimsnext/store";
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import { Setting } from "@element-plus/icons-vue";
import Layout from "@/layout/index.vue";
import {
  cloneWorkbenchLayout,
  normalizeWorkbenchLayout,
  useWorkbenchStore,
} from "@/store";
import WorkbenchWidgetRenderer from "./components/WorkbenchWidgetRenderer.vue";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "Workbench",
  inheritAttrs: false,
});

const router = useRouter();
const userStore = useUserStore();
const workbenchStore = useWorkbenchStore();
const { t } = useI18n();
const { layout, loading } = storeToRefs(workbenchStore);
const runtimeLayout = ref<WorkbenchLayoutItem[]>([]);

const hasCorpAdmin = computed(() => {
  const userType = userStore.currentUser?.userType ?? 0;
  return (userType & UserType.CorpOwmer) !== 0 || (userType & UserType.CorpAdmin) !== 0;
});

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
.workbench-toolbar {
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--et-space-12);
}
</style>

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
