<template>
  <div ref="listRef" class="mytasks-container" @scroll="handleScroll">
    <et-dialog
      v-model="showDetailsDialog"
      class="formdatadialog"
      :title="selectedTask?.formName"
      :show-footer="false"
      width="800px"
      :destroy-on-close="true"
    >
      <div class="form-container">
        <WfApprovalLogView :approvalLog="selectedTask!"></WfApprovalLogView>
      </div>
    </et-dialog>
    <el-space v-if="dataRef.length > 0" direction="vertical" class="task-space">
      <template v-for="task in dataRef" :key="task.id">
        <et-card class="task-card" @click="viewLog(task)">
          <template #header>
            <div class="flex-y-center">
              <div class="flow-header">
                <div class="app-name" :title="task.formName">
                  <span>{{ task.formName }}</span>
                </div>
                <div class="current-node" :title="task.nodeName">
                  <et-icon icon="tree" />
                  <span class="node-name">{{ task.nodeName }}</span>
                </div>
              </div>
            </div>
            <div class="">
              <div class="flow-time">
                <span>{{ task.approvalTime }}</span>
              </div>
            </div>
          </template>
          <div class="flow-content">
            <div class="creator-info">
              <et-icon icon="el-user" size="14px"></et-icon>
              <span class="creator-name" :title="task.approver?.label">
                {{ task.approver?.label }}
              </span>
            </div>
            <ul class="flow-brief">
              <template
                v-for="(item, index) in task.dataBrief.filter((x, i) => i < 3)"
                :key="`${task.id}-left-${index}`"
              >
                <li class="brief-item">
                  <div class="brief-label">{{ item.title }}</div>
                  <span class="sep">：</span>
                  <div class="brief-val">{{ item.value }}</div>
                </li>
              </template>
            </ul>
            <ul class="flow-brief">
              <template
                v-for="(item, index) in task.dataBrief.filter((x, i) => i > 2)"
                :key="`${task.id}-right-${index}`"
              >
                <li class="brief-item">
                  <div class="brief-label">{{ item.title }}</div>
                  <span class="sep">：</span>
                  <div class="brief-val">{{ item.value }}</div>
                </li>
              </template>
            </ul>
          </div>
        </et-card>
      </template>
    </el-space>

    <div v-else-if="!isLoading && !loadError" class="list-empty">
      <el-empty description="暂无审批数据" />
    </div>

    <div v-if="loadError" class="list-empty">
      <el-empty description="审批数据加载失败">
        <el-button type="primary" @click="retryLoad">重试</el-button>
      </el-empty>
    </div>

    <div v-if="isLoadingMore" class="list-status">加载中...</div>
    <div v-else-if="!hasMore && dataRef.length > 0" class="list-status">没有更多了</div>

    <button v-if="showTopButton" class="top-button" type="button" @click="scrollToTop">
      <et-icon icon="backtop" size="20px" />
    </button>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: "WfApprovalLogs",
});

import { useRoute } from "vue-router";
import { nextTick, ref, watch } from "vue";
import { WfApprovalLog } from "@eimsnext/models";
import { wfApprovalLogService } from "@eimsnext/services";
import { EtDialog } from "@eimsnext/components";
import buildQuery from "odata-query";
import WfApprovalLogView from "./WfApprovalLogView.vue";

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD = 120;

const props = withDefaults(
  defineProps<{
    filter: any;
  }>(),
  {}
);

const showDetailsDialog = ref(false);
const route = useRoute();
const listRef = ref<HTMLElement | null>(null);
const dataRef = ref<WfApprovalLog[]>([]);
const selectedTask = ref<WfApprovalLog>();
const filterRef = ref(props.filter);
const pageRef = ref(1);
const hasMore = ref(true);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const showTopButton = ref(false);
const loadError = ref(false);

const resetScroll = () => {
  const container = listRef.value;
  if (!container) {
    return;
  }

  container.scrollTop = 0;
  showTopButton.value = false;
};

const getSecondPageOffset = () => {
  const container = listRef.value;
  if (!container) {
    return Number.POSITIVE_INFINITY;
  }

  const taskCards = container.querySelectorAll<HTMLElement>(".task-card");
  const secondPageFirstCard = taskCards[PAGE_SIZE];
  if (!secondPageFirstCard) {
    return Number.POSITIVE_INFINITY;
  }

  const containerRect = container.getBoundingClientRect();
  const cardRect = secondPageFirstCard.getBoundingClientRect();
  return cardRect.top - containerRect.top + container.scrollTop;
};

const updateTopButtonVisibility = () => {
  const container = listRef.value;
  if (!container) {
    showTopButton.value = false;
    return;
  }

  const secondPageOffset = getSecondPageOffset();
  showTopButton.value = Number.isFinite(secondPageOffset)
    && container.scrollTop >= Math.max(secondPageOffset - SCROLL_THRESHOLD, SCROLL_THRESHOLD);
};

watch(
  () => props.filter,
  (newFilter) => {
    filterRef.value = { ...newFilter };
    updateFilterWithAppId();
    loadData(true);
  },
  { deep: true }
);

const getAppId = () => {
  const appIdFromParams = route.params.appId;
  const appIdFromQuery = route.query.appId;
  return appIdFromParams?.toString() || appIdFromQuery?.toString();
};

const updateFilterWithAppId = () => {
  const appId = getAppId();
  if (appId) {
    filterRef.value.appId = appId;
  } else {
    delete filterRef.value.appId;
  }
};

updateFilterWithAppId();

const loadData = async (reset = false) => {
  if (isLoading.value || isLoadingMore.value) {
    return;
  }

  if (!reset && !hasMore.value) {
    return;
  }

  if (reset) {
    isLoading.value = true;
    pageRef.value = 1;
    hasMore.value = true;
    loadError.value = false;
  } else {
    isLoadingMore.value = true;
  }

  const currentPage = pageRef.value;
  const query = buildQuery({
    filter: filterRef.value,
    skip: (currentPage - 1) * PAGE_SIZE,
    top: PAGE_SIZE,
  });

  try {
    const res = await wfApprovalLogService.query<WfApprovalLog>(query);
    dataRef.value = reset ? res : [...dataRef.value, ...res];
    hasMore.value = res.length === PAGE_SIZE;
    loadError.value = false;
    if (hasMore.value) {
      pageRef.value = currentPage + 1;
    }
  } catch (error: any) {
    console.error("loadData error:", error);
    loadError.value = true;
    if (reset) {
      dataRef.value = [];
      hasMore.value = false;
    }
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }

  await nextTick();
  const container = listRef.value;
  updateTopButtonVisibility();
  if (container && hasMore.value && container.scrollHeight <= container.clientHeight + SCROLL_THRESHOLD) {
    loadData();
  }
};

const viewLog = async (task: WfApprovalLog) => {
  selectedTask.value = task;
  showDetailsDialog.value = true;
};

const handleScroll = () => {
  const container = listRef.value;
  if (!container) {
    return;
  }

  updateTopButtonVisibility();

  const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
  if (distanceToBottom <= SCROLL_THRESHOLD) {
    loadData();
  }
};

const scrollToTop = () => {
  listRef.value?.scrollTo({ top: 0, behavior: "smooth" });
};

const retryLoad = () => {
  loadData(true);
};

watch(
  () => [route.params.appId, route.query.appId],
  () => {
    updateFilterWithAppId();
    resetScroll();
    loadData(true);
  },
  { immediate: true }
);
</script>
<style lang="scss" scoped>
.mytasks-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  position: relative;

  .task-space {
    width: 100%;
    align-items: normal !important;
  }

  .task-card {
    cursor: pointer;
    width: 100%;

    .flow-header {
      display: flex;

      .app-name {
        font-size: var(--et-font-size-15);
        font-weight: 600;
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .current-node {
        color: var(--et-text-secondary);
        font-size: var(--et-font-size-12);
        margin-left: var(--et-space-12);
        width: fit-content;
        display: flex;
        align-items: center;

        .node-name {
          margin-left: var(--et-space-5);
        }
      }
    }

    .flow-content {
      display: flex;
      font-size: var(--et-font-size-13);
      padding: var(--et-space-10) var(--et-space-20);

      .creator-info {
        align-self: center;
        flex-shrink: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 20%;
        display: flex;
        align-items: center;

        .creator-name {
          margin-left: var(--et-space-5);
        }
      }

      .flow-brief {
        flex-shrink: 0;
        height: var(--et-size-72);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 34%;

        .brief-item {
          align-items: center;
          display: flex;
          font-size: var(--et-font-size-13);
          height: var(--et-size-24);
          line-height: var(--et-line-height-22);
          padding: 0 var(--et-space-12);

          .brief-label {
            color: var(--et-text-secondary);
            display: inline-block;
            flex: none;
            max-width: var(--et-size-100);
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: top;
            white-space: nowrap;
          }

          .sep {
            color: var(--et-text-secondary);
          }

          .brief-val {
            display: inline-block;
            flex: auto;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .list-status {
    color: var(--et-text-secondary);
    display: flex;
    justify-content: center;
    padding: var(--et-space-12) 0 var(--et-space-20);
  }

  .list-empty {
    display: flex;
    justify-content: center;
    padding: var(--et-space-48) 0;
  }

  .top-button {
    position: sticky;
    align-self: flex-end;
    bottom: var(--et-space-20);
    margin-right: var(--et-space-8);
    margin-bottom: var(--et-space-20);
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.24);
    color: var(--et-text-on-primary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    transition: background-color 0.2s ease;
  }

  .top-button:hover {
    background-color: rgba(0, 0, 0, 0.36);
  }
}
</style>
