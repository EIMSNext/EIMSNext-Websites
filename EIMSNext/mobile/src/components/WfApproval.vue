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
        <van-button
          v-for="action in visibleActions"
          :key="action.key"
          block
          :type="action.type"
          :loading="approving && pendingKey === action.key"
          @click="runAction(action.key)"
        >
          {{ action.text }}
        </van-button>
      </div>
    </template>
  </MobilePage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast } from "vant";
import { FlowStatus, type NodeActionConfig, type NodeActionType, type WfTodo } from "@eimsnext/models";
import MobileCard from "@/components/base/MobileCard.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { formDataServiceMobile, getNodeActionLabel, todoServiceMobile } from "@/services/mobileService";

type MobileActionKey = NodeActionType | "withdraw" | "urge";

const router = useRouter();
const route = useRoute();
const taskId = route.params.taskId as string;

const loading = ref(false);
const approving = ref(false);
const pendingKey = ref("");
const task = ref<WfTodo>();
const nodeActions = ref<NodeActionConfig[]>([]);
const actionStatus = ref({ canWithdraw: false, canUrge: false });
const flowStatus = ref<FlowStatus>();

const visibleActions = computed(() => {
  const result: Array<{ key: MobileActionKey; text: string; type: "primary" | "danger" | "default" | "warning" }> = [];
  nodeActions.value
    .filter((x) => x.enabled)
    .forEach((action) => {
      if (action.actionType === "draft" && flowStatus.value !== FlowStatus.Draft) {
        return;
      }
      result.push({
        key: action.actionType,
        text: action.text || getNodeActionLabel(action.actionType),
        type: action.actionType === "submit" ? "primary" : action.actionType === "reject" ? "danger" : "default",
      });
    });

  if (actionStatus.value.canWithdraw) {
    result.push({ key: "withdraw", text: "撤回", type: "warning" });
  }
  if (actionStatus.value.canUrge) {
    result.push({ key: "urge", text: "催办", type: "default" });
  }
  return result;
});

const goBack = () => router.back();

const getComment = (title: string) => window.prompt(`${title}意见`, "") || "";

const chooseCandidate = (actionType: "addSign" | "transfer") => {
  const candidates = nodeActions.value.find((x) => x.actionType === actionType)?.candidates || [];
  if (!candidates.length) {
    showToast("未配置候选人");
    return "";
  }

  const tips = candidates.map((x, idx) => `${idx + 1}. ${x.candidateName || x.candidateId}`).join("\n");
  const index = Number(window.prompt(`请选择${actionType === "addSign" ? "加签" : "转交"}人员:\n${tips}`, "1"));
  if (!Number.isInteger(index) || index < 1 || index > candidates.length) {
    return "";
  }
  return candidates[index - 1].candidateId;
};

const chooseReturnTarget = async () => {
  if (!task.value) return "";
  const targets = await todoServiceMobile.getReturnTargets(task.value.dataId, task.value.wfInstanceId);
  if (!targets.length) {
    showToast("没有可回退节点");
    return "";
  }

  const tips = targets.map((x, idx) => `${idx + 1}. ${x.nodeName}`).join("\n");
  const index = Number(window.prompt(`请选择回退节点:\n${tips}`, "1"));
  if (!Number.isInteger(index) || index < 1 || index > targets.length) {
    return "";
  }
  return targets[index - 1].nodeId;
};

const runAction = async (key: MobileActionKey) => {
  if (!task.value) return;
  pendingKey.value = key;
  approving.value = true;
  try {
    switch (key) {
      case "submit":
        await todoServiceMobile.submit(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, getComment("提交"));
        showToast("已提交");
        router.back();
        break;
      case "reject":
        await todoServiceMobile.reject(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, getComment("驳回"));
        showToast("已驳回");
        router.back();
        break;
      case "withdraw":
        if (!window.confirm("确定撤回该流程吗？撤回后将回到草稿状态。")) return;
        await todoServiceMobile.withdraw(task.value.dataId, task.value.wfInstanceId, getComment("撤回"));
        showToast("已撤回");
        router.back();
        break;
      case "urge":
        await todoServiceMobile.urge(task.value.dataId, task.value.wfInstanceId);
        showToast("已发送催办提醒");
        break;
      case "return": {
        const targetNodeId = await chooseReturnTarget();
        if (!targetNodeId) return;
        await todoServiceMobile.return(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, targetNodeId, getComment("回退"));
        showToast("已回退");
        router.back();
        break;
      }
      case "addSign": {
        const targetEmployeeId = chooseCandidate("addSign");
        if (!targetEmployeeId) return;
        await todoServiceMobile.addSign(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, targetEmployeeId, getComment("加签"));
        showToast("已加签");
        router.back();
        break;
      }
      case "transfer": {
        const targetEmployeeId = chooseCandidate("transfer");
        if (!targetEmployeeId) return;
        await todoServiceMobile.transfer(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, targetEmployeeId, getComment("转交"));
        showToast("已转交");
        router.back();
        break;
      }
      case "draft":
        showToast("移动端暂未支持暂存表单编辑");
        break;
    }
  } catch {
    showToast("操作失败");
  } finally {
    approving.value = false;
    pendingKey.value = "";
  }
};

const loadTask = async () => {
  loading.value = true;
  task.value = await todoServiceMobile.get(taskId);
  if (task.value) {
    const data = await formDataServiceMobile.get(task.value.dataId);
    flowStatus.value = data.flowStatus;
    actionStatus.value = await todoServiceMobile.getActionStatus(task.value.dataId, task.value.wfInstanceId);
    nodeActions.value = await todoServiceMobile.getNodeActions(task.value.formId, task.value.approveNodeId);
  }
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 12px 16px;
}
</style>
