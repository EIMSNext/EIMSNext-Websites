<template>
  <MobilePage :title="task?.formName || '审批'" @back="goBack">
    <div class="approval-page">
      <div v-if="loading" class="approval-loading">加载中...</div>
      <MobileCard v-else-if="task" class="approval-card">
        <div class="approval-title">{{ task.formName }}</div>
        <div class="approval-meta">当前节点：{{ task.approveNodeName }}</div>
        <div class="approval-meta">提交人：{{ task.starter?.label || '-' }}</div>
        <div class="approval-meta">提交时间：{{ task.approveNodeStartTime }}</div>
        <div class="approval-json">{{ JSON.stringify(task, null, 2) }}</div>
      </MobileCard>
    </div>

    <template #footer>
      <div class="approval-actions">
        <van-button block type="danger" :loading="approving" @click="handleReject">拒绝</van-button>
        <van-button block type="primary" :loading="approving" @click="handleApprove">同意</van-button>
      </div>
    </template>
  </MobilePage>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast } from "vant";
import { ApproveAction, type WfTodo } from "@eimsnext/models";
import MobileCard from "@/components/base/MobileCard.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { todoServiceMobile } from "@/services/mobileService";

const router = useRouter();
const route = useRoute();
const taskId = route.params.taskId as string;

const loading = ref(false);
const approving = ref(false);
const task = ref<WfTodo>();

const goBack = () => router.back();

const runApprove = async (action: ApproveAction, successText: string) => {
  if (!task.value) return;
  approving.value = true;
  try {
    await todoServiceMobile.approve(task.value.dataId, action, "");
    showToast(successText);
    router.back();
  } catch {
    showToast("操作失败");
  } finally {
    approving.value = false;
  }
};

const handleApprove = () => runApprove(ApproveAction.Approve, "审批通过");
const handleReject = () => runApprove(ApproveAction.Reject, "已拒绝");

const loadTask = async () => {
  loading.value = true;
  task.value = await todoServiceMobile.get(taskId);
  loading.value = false;
};

onMounted(() => {
  void loadTask();
});
</script>

<style scoped lang="scss">
.approval-page {
  padding: 12px;
}

.approval-loading {
  padding: 40px 0;
  text-align: center;
  color: var(--mobile-text-tertiary);
}

.approval-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--mobile-text-primary);
}

.approval-meta {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--mobile-text-secondary);
}

.approval-json {
  margin-top: 12px;
  font-size: 12px;
  color: var(--mobile-text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
}

.approval-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px 16px;
}
</style>
