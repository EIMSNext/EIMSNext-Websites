<template>
  <MobilePage :title="task?.formName || t('mobile.approval.title')" @back="goBack">
    <div class="approval-page">
      <div v-if="loading" class="approval-loading">{{ t("common.loading") }}</div>
      <van-empty v-else-if="loadError" image="error" :description="t('admin.formData.dataNotAvailable')">
        <van-button size="small" @click="loadTask">{{ t("common.retry") }}</van-button>
      </van-empty>
      <template v-else-if="task">
        <MobileCard class="approval-card">
          <div class="approval-title">{{ task.formName }}</div>
          <div class="approval-meta">{{ t("mobile.approval.currentNode") }}{{ task.approveNodeName }}</div>
          <div class="approval-meta">{{ t("mobile.approval.starter") }}{{ task.starter?.label || '-' }}</div>
          <div class="approval-meta">{{ t("mobile.approval.submitTime") }}{{ formatDateTime(task.approveNodeStartTime) || "-" }}</div>
        </MobileCard>

        <MobileCard class="form-card">
          <div v-if="formLoading" class="approval-loading">{{ t("common.loading") }}</div>
          <van-empty v-else-if="formLoadError" image="error" :description="t('admin.formData.dataNotAvailable')">
            <van-button size="small" @click="loadFormContent">{{ t("common.retry") }}</van-button>
          </van-empty>
          <template v-else-if="renderRule.length > 0">
            <MobileFormRenderer v-model="formData" :rule="renderRule" :option="renderOption" :preview="true" />
          </template>
          <van-empty v-else class="unsupported-tip" :description="t('mobile.formData.mobileUnsupported')" />
        </MobileCard>
      </template>
    </div>

    <template v-if="task && !loadError && visibleActions.length > 0" #footer>
      <div class="approval-actions">
        <van-button
          v-for="action in rowActions"
          :key="action.key"
          round
          block
          :type="action.type"
          :loading="approving && pendingKey === action.key"
          @click="runAction(action.key)"
        >
          {{ action.text }}
        </van-button>
        <van-button v-if="hasMoreActions" round block @click="showMoreSheet = true">
          {{ t("mobile.approvalActions.more") }}
        </van-button>
      </div>
    </template>
  </MobilePage>

  <van-action-sheet
    v-model:show="showPickerSheet"
    :title="sheetTitle"
    :actions="sheetOptions"
    :cancel-text="t('common.cancel')"
    close-on-click-action
    @select="onSheetSelect"
  />

  <van-action-sheet
    v-model:show="showMoreSheet"
    :actions="moreSheetOptions"
    close-on-click-action
    @select="onMoreSheetSelect"
  />

  <van-dialog
    v-model:show="showCommentDialog"
    :title="commentDialogTitle"
  >
    <van-field
      v-model="comment"
      type="textarea"
      rows="3"
      autosize
      maxlength="500"
      :placeholder="t('mobile.approval.commentPlaceholder')"
    />
    <template #footer>
      <div class="dialog-footer">
        <van-button class="dialog-footer-btn" @click="showCommentDialog = false">{{ t("common.cancel") }}</van-button>
        <van-button class="dialog-footer-btn" type="primary" :loading="approving" @click="confirmCommentDialog">{{ t("common.confirm") }}</van-button>
      </div>
    </template>
  </van-dialog>

  <van-dialog
    v-model:show="showWithdrawConfirm"
    :title="t('mobile.approvalActions.withdraw')"
    :message="t('mobile.approval.withdrawConfirm')"
    :close-on-popstate="false"
  >
    <template #footer>
      <div class="dialog-footer">
        <van-button class="dialog-footer-btn" @click="showWithdrawConfirm = false">{{ t("common.cancel") }}</van-button>
        <van-button class="dialog-footer-btn" type="primary" :loading="approving" @click="confirmWithdraw">{{ t("common.confirm") }}</van-button>
      </div>
    </template>
  </van-dialog>

  <van-dialog
    v-model:show="showUrgeConfirm"
    :title="t('mobile.approvalActions.urge')"
    :message="t('mobile.approval.urgeConfirm')"
    :close-on-popstate="false"
  >
    <template #footer>
      <div class="dialog-footer">
        <van-button class="dialog-footer-btn" @click="showUrgeConfirm = false">{{ t("common.cancel") }}</van-button>
        <van-button class="dialog-footer-btn" type="primary" :loading="approving" @click="confirmUrge">{{ t("common.confirm") }}</van-button>
      </div>
    </template>
  </van-dialog>

  <van-dialog
    v-model:show="showDraftConfirm"
    :title="t('mobile.approvalActions.draft')"
    :message="t('mobile.approval.draftConfirm')"
    :close-on-popstate="false"
  >
    <template #footer>
      <div class="dialog-footer">
        <van-button class="dialog-footer-btn" @click="showDraftConfirm = false">{{ t("common.cancel") }}</van-button>
        <van-button class="dialog-footer-btn" type="primary" :loading="approving" @click="confirmDraft">{{ t("common.confirm") }}</van-button>
      </div>
    </template>
  </van-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { showToast } from "vant";
import { useI18n } from "vue-i18n";
import { DataAction, FieldType, FlowStatus, type FormData, type FormDef, type WorkflowNodeAction, type WorkflowNodeActionType, type WfTask } from "@eimsnext/models";
import FormCreateMobile from "@eimsnext/form-render-vant";
import MobileCard from "@/components/base/MobileCard.vue";
import MobilePage from "@/components/base/MobilePage.vue";
import MobileFormRenderer from "@/components/form/MobileFormRenderer.vue";
import { formDataServiceMobile, formServiceMobile, taskServiceMobile } from "@/services/mobileService";
import { formatDateTime } from "@/utils/format";
import { markErrorHandled } from "@/utils/httpFeedback";

type MobileActionKey = WorkflowNodeActionType | "withdraw" | "urge";
type PickerMode = "return" | "candidate";

const memberFieldTypes: FieldType[] = [
  FieldType.Employee1,
  FieldType.Employee2,
  FieldType.Department1,
  FieldType.Department2,
];

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const taskId = route.params.taskId as string;

const loading = ref(false);
const approving = ref(false);
const pendingKey = ref("");
const task = ref<WfTask>();
const nodeActions = ref<WorkflowNodeAction[]>([]);
const actionStatus = ref({ canWithdraw: false, canUrge: false });
const flowStatus = ref<FlowStatus>();
const loadError = ref(false);

// 表单内容区独立于审批动作区加载：任一子请求失败只降级对应区域，不拖垮整页
const formLoading = ref(false);
const formLoadError = ref(false);
const formDef = ref<FormDef>();
const formData = ref<Record<string, unknown>>({});
const formDataEntity = ref<FormData>();

const comment = ref("");
const commentDialogTitle = ref("");
const showCommentDialog = ref(false);
const pendingAction = ref<{ key: MobileActionKey; targetNodeId?: string; targetEmployeeId?: string }>();

const sheetTitle = ref("");
const sheetOptions = ref<{ name: string; value: string }[]>([]);
const showPickerSheet = ref(false);
const sheetMode = ref<PickerMode>("return");
const sheetActionKey = ref<MobileActionKey>("return");

const showWithdrawConfirm = ref(false);
const showUrgeConfirm = ref(false);
const showDraftConfirm = ref(false);

const getNodeActionText = (actionType: WorkflowNodeActionType) => {
  const key = `mobile.approvalActions.${actionType}`;
  const label = t(key);
  return label === key ? t("mobile.approvalActions.default") : label;
};

// 按钮顺序与 PC 端 WfProcess.buildCustomActions 对齐：submit/return/reject/draft/addsign/transfer
const NODE_ACTION_ORDER: WorkflowNodeActionType[] = ["submit", "return", "reject", "draft", "addsign", "transfer"];

const visibleActions = computed(() => {
  const result: Array<{ key: MobileActionKey; text: string; type: "primary" | "danger" | "default" | "warning" }> = [];
  const enabledActions = nodeActions.value.filter((x) => x.enabled);

  NODE_ACTION_ORDER.forEach((actionType) => {
    const action = enabledActions.find((x) => x.actionType === actionType);
    if (!action) return;
    // draft 仅草稿态可见（与 PC 端一致）
    if (actionType === "draft" && flowStatus.value !== FlowStatus.Draft) return;
    result.push({
      key: action.actionType,
      text: action.text || getNodeActionText(action.actionType),
      type: actionType === "submit" ? "primary" : actionType === "reject" ? "danger" : "default",
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

// 操作按钮一排展示：≤3 个全显；>3 个显前 2 个 + 「更多」，其余收进更多面板
const MAX_ROW_ACTIONS = 3;
const hasMoreActions = computed(() => visibleActions.value.length > MAX_ROW_ACTIONS);
const rowActions = computed(() =>
  visibleActions.value.slice(0, hasMoreActions.value ? MAX_ROW_ACTIONS - 1 : MAX_ROW_ACTIONS)
);
const moreActions = computed(() => visibleActions.value.slice(rowActions.value.length));

const showMoreSheet = ref(false);
const moreSheetOptions = computed(() => [
  ...moreActions.value.map((action) => ({ name: action.text, key: action.key })),
  { name: t("common.cancel"), key: "" },
]);
const onMoreSheetSelect = (option: { key: MobileActionKey | "" }) => {
  if (!option.key) return;
  runAction(option.key);
};

const renderRule = computed(() => {
  const layout = formDef.value?.content?.layout;
  if (!layout) return [];
  try {
    const rules = FormCreateMobile.parseJson(layout);
    addMemberSourceContext(rules);
    return reactive(rules);
  } catch {
    return [];
  }
});

const renderOption = computed(() => {
  let parsed: Record<string, unknown> = {};
  try {
    const options = FormCreateMobile.parseJson(formDef.value?.content?.options || "{}");
    if (options && typeof options === "object") parsed = options as unknown as Record<string, unknown>;
  } catch {
    parsed = {};
  }
  return {
    ...parsed,
    submitBtn: false,
    resetBtn: false,
    form: { ...(parsed.form as Record<string, unknown> | undefined), labelPosition: "top" },
  };
});

const goBack = () => router.back();

// 浮层打开时（Android 返回手势/浏览器返回/header 返回）只关闭最上层浮层、停留在审批页：
// vant 浮层不会自行拦截路由，不拦就会带着未提交的意见离开页面
const closeTopOverlay = (): boolean => {
  if (showCommentDialog.value) {
    showCommentDialog.value = false;
    return true;
  }
  if (showMoreSheet.value) {
    showMoreSheet.value = false;
    return true;
  }
  if (showPickerSheet.value) {
    showPickerSheet.value = false;
    return true;
  }
  if (showWithdrawConfirm.value) {
    showWithdrawConfirm.value = false;
    return true;
  }
  if (showUrgeConfirm.value) {
    showUrgeConfirm.value = false;
    return true;
  }
  if (showDraftConfirm.value) {
    showDraftConfirm.value = false;
    return true;
  }
  return false;
};

onBeforeRouteLeave(() => (closeTopOverlay() ? false : true));

// 审批页表单只读渲染：人员/部门字段仍需 form-runtime 上下文才能正确回显选人范围
const addMemberSourceContext = (nodes: any[], parentField?: string) => {
  nodes.forEach((rule) => {
    if (!rule) return;
    const fieldId = parentField && rule.field ? `${parentField}>${rule.field}` : rule.field;
    if (memberFieldTypes.includes(rule.type)) {
      rule.props = {
        ...(rule.props || {}),
        sourceMode: "form-runtime",
        formId: task.value?.formId || "",
        fieldId: fieldId || "",
      };
    }
    if (Array.isArray(rule.children)) addMemberSourceContext(rule.children, parentField);
    if (Array.isArray(rule.columns)) {
      rule.columns.forEach((column: any) => {
        if (Array.isArray(column?.rule)) addMemberSourceContext(column.rule, fieldId);
      });
    }
    if (Array.isArray(rule.props?.columns)) {
      rule.props.columns.forEach((column: any) => {
        if (Array.isArray(column?.rule)) addMemberSourceContext(column.rule, fieldId);
      });
    }
  });
};

const loadFormContent = async (preloaded?: FormData) => {
  if (!task.value) return;
  formLoading.value = true;
  formLoadError.value = false;
  try {
    const [def, data] = await Promise.all([
      formServiceMobile.get(task.value.formId),
      preloaded ? Promise.resolve(preloaded) : formDataServiceMobile.get(task.value.dataId),
    ]);
    formDef.value = def;
    formDataEntity.value = data;
    formData.value = data?.data || {};
  } catch (error) {
    markErrorHandled(error);
    formLoadError.value = true;
  } finally {
    formLoading.value = false;
  }
};

const loadTask = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    const loadedTask = await taskServiceMobile.get(taskId);
    if (!loadedTask) throw new Error("Workflow task is unavailable");
    task.value = loadedTask;

    // 动作状态与节点动作失败时降级为「无可用动作」，不影响表单内容展示
    const [status, actions, data] = await Promise.all([
      taskServiceMobile.getActionStatus(loadedTask.dataId, loadedTask.wfInstanceId).catch(() => ({ canWithdraw: false, canUrge: false })),
      taskServiceMobile.getNodeActions(loadedTask.dataId, loadedTask.wfInstanceId).catch(() => [] as WorkflowNodeAction[]),
      formDataServiceMobile.get(loadedTask.dataId).catch(() => undefined),
    ]);
    actionStatus.value = status;
    nodeActions.value = actions || [];
    flowStatus.value = data?.flowStatus;
    await loadFormContent(data);
  } catch (error) {
    markErrorHandled(error);
    task.value = undefined;
    nodeActions.value = [];
    actionStatus.value = { canWithdraw: false, canUrge: false };
    flowStatus.value = undefined;
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};

const openCommentDialog = (key: MobileActionKey, target?: { targetNodeId?: string; targetEmployeeId?: string }) => {
  pendingAction.value = { key, ...(target || {}) };
  commentDialogTitle.value = getActionLabel(key);
  comment.value = "";
  showCommentDialog.value = true;
};

const getActionLabel = (key: MobileActionKey) => {
  const action = nodeActions.value.find((x) => x.actionType === key);
  return action?.text || (key === "withdraw" || key === "urge" ? t(`mobile.approvalActions.${key}`) : getNodeActionText(key));
};

const openPickerSheet = async (key: MobileActionKey) => {
  if (!task.value) return;
  try {
    if (key === "return") {
      const targets = await taskServiceMobile.getReturnNodes(task.value.dataId, task.value.wfInstanceId);
      if (!targets.length) {
        showToast(t("mobile.approval.noReturnNodes"));
        return;
      }
      sheetMode.value = "return";
      sheetActionKey.value = "return";
      sheetTitle.value = t("mobile.approval.chooseReturnNodeTitle");
      sheetOptions.value = targets.map((x) => ({ name: x.nodeName, value: x.nodeId }));
      showPickerSheet.value = true;
      return;
    }

    const candidates = nodeActions.value.find((x) => x.actionType === key)?.candidates || [];
    if (!candidates.length) {
      showToast(t("mobile.approval.noCandidates"));
      return;
    }
    sheetMode.value = "candidate";
    sheetActionKey.value = key;
    sheetTitle.value = t("mobile.approval.chooseCandidateTitle", { action: getActionLabel(key) });
    sheetOptions.value = candidates.map((x) => ({ name: x.candidateName || x.candidateId, value: x.candidateId }));
    showPickerSheet.value = true;
  } catch (error) {
    markErrorHandled(error);
    showToast(t("mobile.approval.actionFailed"));
  }
};

const onSheetSelect = (option: { name: string; value: string }) => {
  if (sheetMode.value === "return") {
    openCommentDialog("return", { targetNodeId: option.value });
  } else {
    openCommentDialog(sheetActionKey.value, { targetEmployeeId: option.value });
  }
};

const runAction = (key: MobileActionKey) => {
  switch (key) {
    case "submit":
    case "reject":
      openCommentDialog(key);
      break;
    case "return":
    case "addsign":
    case "transfer":
      void openPickerSheet(key);
      break;
    case "withdraw":
      showWithdrawConfirm.value = true;
      break;
    case "urge":
      showUrgeConfirm.value = true;
      break;
    case "draft":
      showDraftConfirm.value = true;
      break;
  }
};

const executeAction = async (key: MobileActionKey, payload: { comment?: string; targetNodeId?: string; targetEmployeeId?: string } = {}) => {
  if (!task.value) return;
  pendingKey.value = key;
  approving.value = true;
  try {
    switch (key) {
      case "submit":
        await taskServiceMobile.submit(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, payload.comment || "");
        showToast(t("mobile.approval.submitted"));
        router.back();
        break;
      case "reject":
        await taskServiceMobile.reject(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, payload.comment || "");
        showToast(t("mobile.approval.rejected"));
        router.back();
        break;
      case "withdraw":
        await taskServiceMobile.withdraw(task.value.dataId, task.value.wfInstanceId, "");
        showToast(t("mobile.approval.withdrawn"));
        router.back();
        break;
      case "urge":
        await taskServiceMobile.urge(task.value.dataId, task.value.wfInstanceId);
        showToast(t("common.wfProcess.urgeSuccess"));
        break;
      case "return":
        await taskServiceMobile.return(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, payload.targetNodeId || "", payload.comment || "");
        showToast(t("mobile.approval.returned"));
        router.back();
        break;
      case "addsign":
        await taskServiceMobile.addSign(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, payload.targetEmployeeId || "", payload.comment || "");
        showToast(t("mobile.approval.addSigned"));
        router.back();
        break;
      case "transfer":
        await taskServiceMobile.transfer(task.value.dataId, task.value.wfInstanceId, task.value.approveNodeId, payload.targetEmployeeId || "", payload.comment || "");
        showToast(t("mobile.approval.transferred"));
        router.back();
        break;
      case "draft":
        // 暂存：保存表单数据但保持草稿态（不推进流程）；PC 端该按钮未接线，此处按按钮语义实现
        if (!formDataEntity.value) {
          showToast(t("mobile.approval.actionFailed"));
          break;
        }
        await formDataServiceMobile.put(formDataEntity.value, formData.value, DataAction.Save);
        showToast(t("mobile.approval.draftSaved"));
        break;
    }
  } catch (error) {
    markErrorHandled(error);
    showToast(t("mobile.approval.actionFailed"));
  } finally {
    approving.value = false;
    pendingKey.value = "";
  }
};

const confirmCommentDialog = () => {
  const pending = pendingAction.value;
  if (!pending) {
    showCommentDialog.value = false;
    return;
  }
  const payload = { comment: comment.value, targetNodeId: pending.targetNodeId, targetEmployeeId: pending.targetEmployeeId };
  pendingAction.value = undefined;
  showCommentDialog.value = false;
  void executeAction(pending.key, payload);
};

const confirmWithdraw = () => {
  showWithdrawConfirm.value = false;
  void executeAction("withdraw");
};

const confirmUrge = () => {
  showUrgeConfirm.value = false;
  void executeAction("urge");
};

const confirmDraft = () => {
  showDraftConfirm.value = false;
  void executeAction("draft");
};

onMounted(() => {
  void loadTask();
});
</script>

<style scoped lang="scss">
.approval-page {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.unsupported-tip {
  padding: 24px 0;
}

.approval-actions {
  display: flex;
  gap: 10px;
  padding: 12px 16px;

  .van-button {
    flex: 1;
    min-width: 0;
  }
}

.dialog-footer {
  display: flex;

  .dialog-footer-btn {
    flex: 1;
  }
}
</style>
