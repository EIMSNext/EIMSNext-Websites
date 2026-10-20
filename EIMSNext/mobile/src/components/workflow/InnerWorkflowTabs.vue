<template>
  <van-tabs :active="currentTab" @update:active="switchTab">
    <van-tab :title="t('mobile.workflow.task')" name="task" />
    <van-tab :title="t('mobile.workflow.started')" name="started" />
    <van-tab :title="t('mobile.workflow.processed')" name="approved" />
    <van-tab :title="t('mobile.workflow.cced')" name="cced" />
  </van-tabs>
  <div class="workflow-list-wrap">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loadingMore" :finished="finished" finished-text="" :error="loadError" :error-text="t('common.retry')" @load="onLoadMore" @update:error="onRetry">
        <div v-if="initialLoading" class="workflow-empty">{{ t('common.loading') }}</div>
        <div v-else-if="!loadError && list.length === 0" class="workflow-empty">{{ t('common.noData') }}</div>
        <div v-else class="workflow-list">
          <MobileCard
            v-for="item in list"
            :key="item.id"
            class="workflow-card"
            @click="currentTab === 'task' ? emit('open-approval', item) : emit('open-detail', item)"
          >
            <div class="workflow-card-header">
              <div class="workflow-form-name">{{ item.formName }}</div>
              <div class="workflow-time">{{ formatDateTime(item.time, false) || "-" }}</div>
            </div>
            <div class="workflow-node">{{ item.nodeName || t('mobile.workflow.record') }}</div>
            <div class="workflow-starter">{{ t('mobile.workflow.starter') }}: {{ item.starterLabel || '-' }}</div>
            <div class="workflow-brief">
              <span v-for="brief in item.dataBrief" :key="brief.field" class="brief-item">
                <span class="brief-label">{{ brief.title }}:</span> {{ brief.value }}
              </span>
            </div>
          </MobileCard>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import MobileCard from "@/components/base/MobileCard.vue";
import { type WorkflowTaskItem, workflowServiceMobile } from "@/services/mobileService";
import { formatDateTime } from "@/utils/format";
import { markErrorHandled } from "@/utils/httpFeedback";

const PAGE_SIZE = 20;

const props = defineProps<{
  activeTab: string;
  appId?: string;
}>();

const emit = defineEmits<{
  "change-tab": [tab: string];
  "open-approval": [item: WorkflowTaskItem];
  "open-detail": [item: WorkflowTaskItem];
}>();

const { t } = useI18n();
const currentTab = ref(props.activeTab);
const refreshing = ref(false);
const initialLoading = ref(false);
const loadingMore = ref(false);
const finished = ref(false);
const loadError = ref(false);
const list = ref<WorkflowTaskItem[]>([]);
let inflight = false;
let pendingReset = false;

const fetchPage = async (skip: number) => {
  const appId = props.appId || undefined;
  if (currentTab.value === "task") {
    return workflowServiceMobile.getTasks(appId, skip, PAGE_SIZE);
  }
  if (currentTab.value === "started") {
    return workflowServiceMobile.getMyStarted(appId, skip, PAGE_SIZE);
  }
  if (currentTab.value === "approved") {
    return workflowServiceMobile.getApproved(appId, skip, PAGE_SIZE);
  }
  return workflowServiceMobile.getCced(appId, skip, PAGE_SIZE);
};

const load = async (reset: boolean) => {
  // 加载中被丢弃的重置请求（快速切 tab/下拉刷新）排队补执行，否则新 tab 会停在旧数据上
  if (inflight) {
    if (reset) pendingReset = true;
    return;
  }
  inflight = true;
  if (reset) {
    initialLoading.value = true;
    loadError.value = false;
  }
  try {
    const skip = reset ? 0 : list.value.length;
    const page = await fetchPage(skip);
    list.value = reset ? page : [...list.value, ...page];
    finished.value = page.length < PAGE_SIZE;
  } catch (error) {
    markErrorHandled(error);
    loadError.value = true;
  } finally {
    inflight = false;
    initialLoading.value = false;
    loadingMore.value = false;
    refreshing.value = false;
    if (pendingReset) {
      pendingReset = false;
      void load(true);
    }
  }
};

const onRefresh = () => {
  void load(true);
};

const onLoadMore = () => {
  if (finished.value || loadError.value) {
    loadingMore.value = false;
    return;
  }
  void load(false);
};

// van-list 错误态点击重试：关闭错误并继续加载（空列表时从头加载）
const onRetry = () => {
  loadError.value = false;
  void load(list.value.length === 0);
};

const switchTab = (tab: string | number) => {
  const value = String(tab);
  if (value === currentTab.value) return;
  currentTab.value = value;
  emit("change-tab", value);
};

// 单一驱动：currentTab 变化统一走 load，切 tab 不再双请求
watch(
  currentTab,
  () => {
    // 深滚动后切 tab 回到顶部，避免新列表停在旧滚动位置
    document.querySelector(".page-main")?.scrollTo({ top: 0 });
    void load(true);
  },
  { immediate: true }
);

// 外部（路由 query.tab / 父组件）同步进来的 tab 只在真正变化时生效
watch(
  () => props.activeTab,
  (value) => {
    if (value && value !== currentTab.value) currentTab.value = value;
  }
);
</script>

<style scoped lang="scss">
.workflow-list-wrap {
  padding: 12px;
}

.workflow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workflow-card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

// 触屏无 hover：整卡可点击，用按压反馈替代
.workflow-card:active {
  opacity: 0.7;
}

.workflow-form-name {
  color: var(--mobile-text-primary);
  font-size: 15px;
  font-weight: 600;
}

.workflow-time,
.workflow-node,
.workflow-starter,
.workflow-brief {
  color: var(--mobile-text-secondary);
  font-size: 12px;
}

.workflow-node,
.workflow-starter {
  margin-bottom: 6px;
}

.workflow-brief {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;

  .brief-item {
    min-width: 0;
  }

  .brief-label {
    color: var(--mobile-text-tertiary);
  }
}

.workflow-empty {
  padding: 40px 0;
  color: var(--mobile-text-tertiary);
  text-align: center;
}
</style>
