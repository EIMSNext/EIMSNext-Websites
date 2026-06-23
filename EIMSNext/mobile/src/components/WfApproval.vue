<template>
  <MobilePage :title="task?.formName || t('mobile.approval.title')" @back="goBack">
    <div class="approval-page">
      <div v-if="loading" class="approval-loading">{{ t("common.loading") }}</div>
      <MobileCard v-else-if="task" class="approval-card">
        <div class="approval-title">{{ task.formName }}</div>
        <div class="approval-meta">{{ t("mobile.approval.currentNode") }}{{ task.approveNodeName }}</div>
        <div class="approval-meta">{{ t("mobile.approval.starter") }}{{ task.starter?.label || '-' }}</div>
        <div class="approval-meta">{{ t("mobile.approval.submitTime") }}{{ task.approveNodeStartTime }}</div>
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
import { useI18n } from "vue-i18n";
import { FlowStatus, type NodeActionConfig, type NodeActionType, type WfTodo } from "@eimsnext/models";
import MobileCard from "@/components/base/MobileCard.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import { formDataServiceMobile, todoServiceMobile } from "@/services/mobileService";

type MobileActionKey = NodeActionType | "withdraw" | "urge";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const taskId = route.params.taskId as string;

const loading = ref(false);
const approving = ref(false);
const pendingKey = ref("");
const task = ref<WfTodo>();
const nodeActions = ref<NodeActionConfig[]>([]);
const actionStatus = ref({ canWithdraw: false, canUrge: false });
const flowStatus = ref<FlowStatus>();

const getNodeActionText = (actionType: NodeActionType) => {
  const key = `mobile.approvalActions.${actionType}`;
  const label = t(key);
  return label === key ? t("mobile.approvalActions.default") : label;
};

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
        text: action.text || getNodeActionText(action.actionType),
        type: action.actionType === "submit" ? "primary" : action.actionType === "reject" ? "danger" : "default",
      });
    });

  if (actionStatus.value.canWithdraw) {
    result.push({ key: "withdraw", text: t("mobile.approvalActions.withdraw"), type: "warning" });
  }
  if (actionStatus.value.canUrge) {
    result.push({ key: "urge", text: t("mobile.approvalActions.urge"), type: "default" });
  }
  return result;
});

const goBack = () => router.back();

const getComment = (title: string) => window.prompt(t("mobile.approval.commentPrompt", { action: title }), "") || "";

const chooseCandidate = (actionType: "addSign" | "transfer") => {
  const candidates = nodeActions.value.find((x) => x.actionType === actionType)?.candidates || [];
  if (!candidates.length) {
    showToast(t("mobile.approval.noCandidates"));
    return "";
  }

  const actionLabel = t(`mobile.approvalActions.${actionType}`);
  const tips = candidates.map((x, idx) => `${idx + 1}. ${x.candidateName || x.candidateId}`).join("\n");
  const index = Number(window.prompt(t("mobile.approval.chooseCandidate", { action: actionLabel, tips }), "1"));
  if (!Number.isInteger(index) || index < 1 || index > candidates.length) {
    return "";
  }
  return candidates[index - 1].candidateId;
};

const chooseReturnTarget = async () => {
  if (!task.value) return "";
  const targets = await todoServiceMobile.getReturnNodes(task.value.dataId, task.value.wfInstanceId);
  if (!targets.length) {
    showToast(t("mobile.approval.noReturnNodes"));
    return "";
  }

  const tips = targets.map((x, idx) => `${idx + 1}. ${x.nodeName}`).join("\n");
  const index = Number(window.prompt(t("mobile.approval.chooseReturnNode", { tips }), "1"));
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
        await todoServiceMobile.submit(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, getComment(t("mobile.approvalActions.submit")));
        showToast(t("mobile.approval.submitted"));
        router.back();
        break;
      case "reject":
        await todoServiceMobile.reject(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, getComment(t("mobile.approvalActions.reject")));
        showToast(t("mobile.approval.rejected"));
        router.back();
        break;
      case "withdraw":
        if (!window.confirm(t("mobile.approval.withdrawConfirm"))) return;
        await todoServiceMobile.withdraw(task.value.dataId, task.value.wfInstanceId, getComment(t("mobile.approvalActions.withdraw")));
        showToast(t("mobile.approval.withdrawn"));
        router.back();
        break;
      case "urge":
        await todoServiceMobile.urge(task.value.dataId, task.value.wfInstanceId);
        showToast(t("common.wfProcess.urgeSuccess"));
        break;
      case "return": {
        const targetNodeId = await chooseReturnTarget();
        if (!targetNodeId) return;
        await todoServiceMobile.return(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, targetNodeId, getComment(t("mobile.approvalActions.return")));
        showToast(t("mobile.approval.returned"));
        router.back();
        break;
      }
      case "addSign": {
        const targetEmployeeId = chooseCandidate("addSign");
        if (!targetEmployeeId) return;
        await todoServiceMobile.addSign(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, targetEmployeeId, getComment(t("mobile.approvalActions.addSign")));
        showToast(t("mobile.approval.addSigned"));
        router.back();
        break;
      }
      case "transfer": {
        const targetEmployeeId = chooseCandidate("transfer");
        if (!targetEmployeeId) return;
        await todoServiceMobile.transfer(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, targetEmployeeId, getComment(t("mobile.approvalActions.transfer")));
        showToast(t("mobile.approval.transferred"));
        router.back();
        break;
      }
      case "draft":
        showToast(t("mobile.approval.draftUnsupported"));
        break;
    }
  } catch {
    showToast(t("mobile.approval.actionFailed"));
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
