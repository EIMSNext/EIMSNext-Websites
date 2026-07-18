<template>
  <div class="public-page">
    <component :is="renderToolbar" />

    <div v-if="loading" class="public-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t("common.loading") }}</span>
    </div>

    <div v-else-if="accessCodeGate" class="access-code-gate">
      <el-card class="access-code-card">
        <h3>{{ t("publicpublish.accessCodeGateTitle") }}</h3>
        <el-input
          v-model="accessCodeInput"
          type="password"
          :placeholder="t('publicpublish.accessCodePlaceholder')"
          @keyup.enter="submitAccessCode"
        />
        <el-button type="primary" :loading="accessCodeSubmitting" @click="submitAccessCode">
          {{ t("common.confirm") }}
        </el-button>
        <p v-if="accessCodeError" class="access-code-error">{{ t("publicpublish.accessCodeInvalid") }}</p>
      </el-card>
    </div>

    <PublicNotFound v-else-if="!dashboard" :description="t('admin.dashboard.notAvailable')" />

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
            :is-public="true"
            :public-token="publicHttp.token.value || undefined"
            :external-filter="chartFilters[state.items[item.i].id]"
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
import {
  DashboardDef,
  DashboardItemDef,
  IGridLayoutState,
  PublicScope,
} from "@eimsnext/models";
import DashItemCard from "@/components/DashboardDesigner/components/DashItemCard.vue";
import { useChartFilterLinkage } from "@/views/dash/useChartFilterLinkage";
import {
  PublicNotFound,
  bootstrapWithToken,
  renderPrintFullscreenToolbar,
  toAccessCodeError,
  usePublicHttp,
} from "./shared";
import { ref, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { escapeODataString } from "@/utils/odata";

defineOptions({ name: "DashLinkView" });

const route = useRoute();
const { t } = useI18n();
const dashboardId = computed(() => route.params.dashboardId?.toString() || "");

const publicHttp = usePublicHttp();

const loading = ref(false);
const dashboard = ref<DashboardDef>();
const accessCodeGate = ref(false);
const accessCodeInput = ref("");
const accessCodeSubmitting = ref(false);
const accessCodeError = ref(false);
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

const renderToolbar = () => renderPrintFullscreenToolbar();

watch(
  dashboardId,
  async (id) => {
    if (!id) {
      dashboard.value = undefined;
      return;
    }
    await bootstrap();
  },
  { immediate: true },
);

async function bootstrap(accessCode?: string) {
  loading.value = true;
  accessCodeError.value = false;
  try {
    if (!publicHttp.token.value) {
      await bootstrapWithToken(publicHttp, dashboardId.value, PublicScope.DashLink, accessCode);
    }
    accessCodeGate.value = false;
    await loadDashboard();
  } catch (err: any) {
    if (toAccessCodeError(err)) {
      accessCodeGate.value = true;
      accessCodeError.value = !!accessCode;
    } else {
      dashboard.value = undefined;
    }
  } finally {
    loading.value = false;
  }
}

async function loadDashboard() {
  const dash = await publicHttp.odata.get<DashboardDef>("DashboardDef", dashboardId.value);
  dashboard.value = dash;
  state.layout.splice(0, state.layout.length);
  state.layout.push(...(JSON.parse(dash.layout || "[]") || []));
  state.items = {};
  const items = await publicHttp.odata.query<DashboardItemDef>(
    "DashboardItemDef",
    `?$filter=appId eq '${escapeODataString(dash.appId)}' and dashboardId eq '${escapeODataString(dash.id)}'`,
  );
  (items || []).forEach((item: DashboardItemDef) => {
    state.items[item.layoutId] = item;
  });
  rebuildChartFilters();
}

async function submitAccessCode() {
  if (!accessCodeInput.value) return;
  accessCodeSubmitting.value = true;
  try {
    await bootstrap(accessCodeInput.value);
    if (!accessCodeGate.value) {
      accessCodeInput.value = "";
    }
  } finally {
    accessCodeSubmitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.dash-edit-layout {
  min-height: 100vh;
  background: var(--et-bg-page, #f5f7fa);
}
</style>
