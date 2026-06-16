<template>
  <div class="public-dash-page">
    <div v-if="loading" class="public-dash-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t("common.loading") }}</span>
    </div>
    <el-empty v-else-if="!dashboard" class="public-dash-state" :description="t('admin.dashboard.notAvailable')" />
    <div v-else class="dash-edit-layout custom-scroll">
      <grid-layout
        ref="gridRef"
        v-model:layout="state.layout"
        :col-num="colNum"
        :col-width="colWidth"
        :row-height="rowHeight"
        :is-draggable="false"
        :is-resizable="false"
        :is-mirrored="false"
        :is-bounded="true"
        :vertical-compact="true"
        :margin="[10, 10]"
        :use-css-transforms="true"
        :responsive="true"
      >
        <grid-item
          v-for="item in state.layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :minW="6"
          :minH="3"
          :maxW="60"
          :maxH="60"
        >
          <DashItemCard
            v-if="state.items[item.i]"
            :item-def="state.items[item.i]"
            :height="item.h"
            :width="item.w"
            :is-view="true"
            :external-filter="chartFilters[state.items[item.i].id]"
            :public-token="token"
            @filter-change="handleFilterChange"
          />
        </grid-item>
      </grid-layout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from "@element-plus/icons-vue";
import { GridItem, GridLayout } from "vue-grid-layout-v3";
import { DashboardDef, DashboardItemDef, IGridLayoutState } from "@eimsnext/models";
import { dashboardPublicService } from "@eimsnext/services";
import DashItemCard from "@/components/DashboardDesigner/components/DashItemCard.vue";
import { useChartFilterLinkage } from "./useChartFilterLinkage";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "DashboardPublicView",
});

const route = useRoute();
const { t } = useI18n();
const token = computed(() => route.params.token?.toString() || "");
const loading = ref(false);
const dashboard = ref<DashboardDef>();
const state = reactive<IGridLayoutState>({
  layout: [],
  items: {},
  draggable: false,
  resizable: false,
});
const colNum = ref(24);
const colWidth = ref(150);
const rowHeight = ref(10);
const { chartFilters, rebuildChartFilters, handleFilterChange } = useChartFilterLinkage(state);

const loadDashboard = async () => {
  if (!token.value) {
    dashboard.value = undefined;
    return;
  }

  loading.value = true;
  try {
    const payload = await dashboardPublicService.getDashboard(token.value);
    dashboard.value = payload.dashboard;
    state.layout.splice(0, state.layout.length);
    state.layout.push(...(JSON.parse(payload.dashboard.layout || "[]") || []));
    state.items = {};
    (payload.items || []).forEach((item: DashboardItemDef) => {
      state.items[item.layoutId] = item;
    });
    rebuildChartFilters();
  } catch {
    dashboard.value = undefined;
    state.layout.splice(0, state.layout.length);
    state.items = {};
  } finally {
    loading.value = false;
  }
};

watch(token, loadDashboard, { immediate: true });
</script>

<style scoped lang="scss">
.public-dash-page {
  min-height: 100vh;
  background: var(--et-bg-page);
}

.dash-edit-layout {
  min-height: 100vh;
  background: var(--et-bg-page);
}

.public-dash-state {
  align-items: center;
  color: var(--et-text-secondary);
  display: flex;
  gap: var(--et-space-8);
  justify-content: center;
  min-height: 100vh;
}
</style>
