<template>
  <van-tabs :active="currentTab" @update:active="switchTab">
    <van-tab :title="t('mobile.workflow.todo')" name="todo" />
    <van-tab :title="t('mobile.workflow.started')" name="started" />
    <van-tab :title="t('mobile.workflow.processed')" name="approved" />
    <van-tab :title="t('mobile.workflow.cced')" name="cced" />
  </van-tabs>
  <div class="workflow-list-wrap">
    <van-pull-refresh v-model="refreshing" @refresh="load">
      <div v-if="loading" class="workflow-empty">{{ t('common.loading') }}</div>
      <div v-else-if="list.length === 0" class="workflow-empty">{{ t('common.noData') }}</div>
      <div v-else class="workflow-list">
        <MobileCard
          v-for="task in list"
          :key="task.id"
          class="workflow-card"
          @click="currentTab === 'todo' ? emit('open-approval', task) : emit('open-detail', task)"
        >
          <div class="workflow-card-header">
            <div class="workflow-form-name">{{ task.formName }}</div>
            <div class="workflow-time">{{ task.approveNodeStartTime || task.createTime || task.updateTime }}</div>
          </div>
          <div class="workflow-node">{{ task.approveNodeName || t('mobile.workflow.record') }}</div>
          <div class="workflow-starter">{{ t('mobile.workflow.starter') }}: {{ task.starter?.label || '-' }}</div>
          <div class="workflow-brief">
            <div v-for="item in task.dataBrief?.slice(0, 2)" :key="item.field">{{ item.title }}: {{ item.value }}</div>
          </div>
        </MobileCard>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { WfTodo } from "@eimsnext/models";
import MobileCard from "@/components/base/MobileCard.vue";
import { todoServiceMobile, workflowServiceMobile } from "@/services/mobileService";

const props = defineProps<{
  activeTab: string;
  appId?: string;
}>();

const emit = defineEmits<{
  "change-tab": [tab: string];
  "open-approval": [task: WfTodo];
  "open-detail": [task: WfTodo];
}>();

const { t } = useI18n();
const currentTab = ref(props.activeTab);
const refreshing = ref(false);
const loading = ref(false);
const list = ref<WfTodo[]>([]);

const load = async () => {
  loading.value = true;
  try {
    if (currentTab.value === "todo") {
      list.value = await todoServiceMobile.query(props.appId || undefined, 0, 20);
    } else if (currentTab.value === "started") {
      list.value = await workflowServiceMobile.getMyStarted(props.appId || undefined, 0, 20);
    } else if (currentTab.value === "approved") {
      list.value = await workflowServiceMobile.getApproved(props.appId || undefined, 0, 20);
    } else {
      list.value = await workflowServiceMobile.getCced(props.appId || undefined, 0, 20);
    }
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

const switchTab = (tab: string | number) => {
  const value = String(tab);
  currentTab.value = value;
  emit("change-tab", value);
  void load();
};

watch(
  () => props.activeTab,
  (value) => {
    currentTab.value = value;
    void load();
  },
  { immediate: true }
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

.workflow-empty {
  padding: 40px 0;
  color: var(--mobile-text-tertiary);
  text-align: center;
}
</style>
