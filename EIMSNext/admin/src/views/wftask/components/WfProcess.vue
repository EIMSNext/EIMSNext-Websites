<template>
  <FormView
    v-if="formData"
    :def="formDef"
    :data="formData"
    :isView="true"
    :actions="actions"
    @withdraw="handleWithdraw"
    @urge="handleUrge"
    @action="handleAction"
  />

  <et-dialog
    v-model="showCommentDialog"
    :title="dialogTitle"
    width="500px"
    :append-to-body="true"
    :destroy-on-close="true"
    @ok="confirmAction"
    @cancel="resetActionDialog"
  >
    <div class="action-dialog-body">
      <el-select v-if="needsNodeSelection" v-model="selectedTargetNodeId" class="full-width" :placeholder="$t('comp.wfProcess.selectReturnNode')">
        <el-option v-for="node in returnTargets" :key="node.nodeId" :label="node.nodeName" :value="node.nodeId" />
      </el-select>
      <member-select-dialog
        v-if="needsMemberSelection"
        v-model="showMemberDialog"
        :tags="selectedTargetTags"
        :member-options="memberOptions"
        destroy-on-close
        @ok="finishTargetSelect"
      />
      <selected-tags
        v-if="needsMemberSelection"
        v-model="selectedTargetTags"
        :editable="true"
        :multiple="false"
        :empty-text="t('comp.emptyEmp')"
        @editTag="showMemberDialog = true"
      />
      <el-input v-model="comment" type="textarea" :rows="4" :placeholder="$t('comp.wfProcess.enterComment')" />
    </div>
  </et-dialog>
</template>

<script lang="ts" setup>
defineOptions({
  name: "WfProcess",
});

import { computed, onMounted, ref } from "vue";
import {
  FormData as FormData_2,
  FormContent,
  WfTask,
  WorkflowActionStatus,
  FlowStatus,
} from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import { formDataService, workflowService } from "@eimsnext/services";
import { FormActionSettings, FormCustomAction } from "@/components/FormView/type";
import { useI18n } from "vue-i18n";
import { ISelectedTag, MemberTabs, DataItemType } from "@eimsnext/components";

const { t } = useI18n();
const workflowServiceEx = workflowService as typeof workflowService & {
  submit: typeof workflowService.approve;
  reject: typeof workflowService.approve;
  return: (data: { wfInstanceId?: string; wfNodeId?: string; dataId: string; targetNodeId: string; comment?: string }) => Promise<any>;
  addSign: (data: { wfInstanceId?: string; wfNodeId?: string; dataId: string; targetEmployeeId: string; comment?: string }) => Promise<any>;
  transfer: (data: { wfInstanceId?: string; wfNodeId?: string; dataId: string; targetEmployeeId: string; comment?: string }) => Promise<any>;
  getReturnNodes: (dataId: string, wfInstanceId?: string) => Promise<Array<{ nodeId: string; nodeName: string; round: number }>>;
};

const props = withDefaults(
  defineProps<{
    task: WfTask;
  }>(),
  {}
);

type PendingActionKey = "submit" | "reject" | "return" | "addsign" | "transfer" | "draft";
type NodeActionType = "submit" | "return" | "reject" | "draft" | "addsign" | "transfer";
type NodeActionConfig = {
  actionType: NodeActionType;
  enabled?: boolean;
  text?: string;
  candidates?: Array<{ candidateId: string; candidateName?: string; candidateType: number; cascadedDept?: boolean }>;
};

const actions = ref<FormActionSettings>({
  withdraw: { text: "common.wfProcess.withdraw", visible: false },
  urge: { text: "common.wfProcess.urge", visible: false },
  customActions: [],
});
const formStore = useFormStore();
const formDef = ref<FormContent>(new FormContent());
const formData = ref<FormData_2>();
const showCommentDialog = ref(false);
const showMemberDialog = ref(false);
const comment = ref("");
const actionStatus = ref<WorkflowActionStatus>({ canWithdraw: false, canUrge: false });
const nodeActionConfigs = ref<NodeActionConfig[]>([]);
const pendingActionKey = ref<PendingActionKey>();
const returnTargets = ref<Array<{ nodeId: string; nodeName: string; round: number }>>([]);
const selectedTargetNodeId = ref("");
const selectedTargetTags = ref<ISelectedTag[]>([]);

const memberOptions = computed(() => ({
  multiple: false,
  showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee,
}));

const dialogTitle = computed(() => {
  switch (pendingActionKey.value) {
    case "submit":
      return t("common.wfProcess.submit");
    case "reject":
      return t("common.wfProcess.reject");
    case "return":
      return t("workflow.nodeActionReturn");
    case "addsign":
      return t("workflow.nodeActionAddSign");
    case "transfer":
      return t("workflow.nodeActionTransfer");
    default:
      return t("common.wfProcess.submit");
  }
});

const needsMemberSelection = computed(() => pendingActionKey.value === "addsign" || pendingActionKey.value === "transfer");
const needsNodeSelection = computed(() => pendingActionKey.value === "return");

const emit = defineEmits(["update:modelValue", "cancel", "submit", "processed"]);

const resetActionDialog = () => {
  showCommentDialog.value = false;
  showMemberDialog.value = false;
  comment.value = "";
  pendingActionKey.value = undefined;
  selectedTargetNodeId.value = "";
  selectedTargetTags.value = [];
};

const getNodeAction = (actionType: NodeActionType) => {
  return nodeActionConfigs.value.find((x: NodeActionConfig) => x.actionType === actionType && x.enabled);
};

const convertCandidateToTag = (candidate: { candidateId: string; candidateName?: string; candidateType: number; cascadedDept?: boolean }): ISelectedTag => {
  let type = DataItemType.Unknown;
  switch (candidate.candidateType) {
    case 1:
      type = DataItemType.Department;
      break;
    case 2:
      type = DataItemType.Employee;
      break;
    case 3:
      type = DataItemType.Role;
      break;
  }

  return {
    id: candidate.candidateId,
    label: candidate.candidateName || candidate.candidateId,
    type,
    cascadedDept: candidate.cascadedDept,
  } as ISelectedTag;
};

const buildCustomActions = () => {
  const customActions: FormCustomAction[] = [];
  const addAction = (key: PendingActionKey, actionType: NodeActionType, type: FormCustomAction["type"], requiresValidate = true) => {
    const action = getNodeAction(actionType);
    if (!action) {
      return;
    }

    if (actionType === "draft" && formData.value?.flowStatus !== FlowStatus.Draft) {
      return;
    }

    customActions.push({
      key,
      text: action.text || getDefaultActionText(actionType),
      type,
      requiresValidate,
      visible: true,
    });
  };

  addAction("submit", "submit", "primary");
  addAction("return", "return", "default", false);
  addAction("reject", "reject", "default");
  addAction("draft", "draft", "default", false);
  addAction("addsign", "addsign", "default", false);
  addAction("transfer", "transfer", "default", false);

  actions.value = {
    withdraw: { text: "common.wfProcess.withdraw", visible: actionStatus.value.canWithdraw },
    urge: { text: "common.wfProcess.urge", visible: actionStatus.value.canUrge },
    customActions,
  };
};

const getDefaultActionText = (actionType: NodeActionType) => {
  switch (actionType) {
    case "submit":
      return "common.wfProcess.submit";
    case "return":
      return "workflow.nodeActionReturn";
    case "reject":
      return "common.wfProcess.reject";
    case "draft":
      return "common.wfProcess.saveDraft";
    case "addsign":
      return "workflow.nodeActionAddSign";
    case "transfer":
      return "workflow.nodeActionTransfer";
    default:
      return "common.wfProcess.submit";
  }
};

const loadNodeActions = async () => {
  nodeActionConfigs.value = await workflowService.getNodeActions(props.task.dataId, props.task.wfInstanceId);
};

const handleAction = async (key: string, data: any) => {
  switch (key as PendingActionKey) {
    case "submit":
    case "reject":
      pendingActionKey.value = key as PendingActionKey;
      comment.value = "";
      showCommentDialog.value = true;
      break;
    case "return":
      returnTargets.value = await workflowServiceEx.getReturnNodes(props.task.dataId, props.task.wfInstanceId);
      selectedTargetNodeId.value = returnTargets.value[0]?.nodeId || "";
      pendingActionKey.value = "return";
      comment.value = "";
      showCommentDialog.value = true;
      break;
    case "addsign":
    case "transfer": {
      const actionType: NodeActionType = key === "addsign" ? "addsign" : "transfer";
      const actionConfig = getNodeAction(actionType);
      selectedTargetTags.value = (actionConfig?.candidates || []).slice(0, 1).map(convertCandidateToTag);
      pendingActionKey.value = key as PendingActionKey;
      comment.value = "";
      showCommentDialog.value = true;
      break;
    }
    case "draft":
      emit("submit", data);
      break;
  }
};

const finishTargetSelect = (tags: ISelectedTag[]) => {
  selectedTargetTags.value = tags.slice(0, 1);
  showMemberDialog.value = false;
};

const getSelectedEmployeeId = () => selectedTargetTags.value[0]?.id || "";

const confirmAction = async () => {
  if (!pendingActionKey.value) {
    return;
  }

  try {
    switch (pendingActionKey.value) {
      case "submit":
        await workflowServiceEx.submit({
          wfInstanceId: props.task.wfInstanceId,
          wfNodeId: props.task.approveNodeId,
          dataId: props.task.dataId,
          action: undefined as any,
          comment: comment.value,
        });
        break;
      case "reject":
        await workflowServiceEx.reject({
          wfInstanceId: props.task.wfInstanceId,
          wfNodeId: props.task.approveNodeId,
          dataId: props.task.dataId,
          action: undefined as any,
          comment: comment.value,
        });
        break;
      case "return":
        if (!selectedTargetNodeId.value) {
          return;
        }
        await workflowServiceEx["return"]({
          wfInstanceId: props.task.wfInstanceId,
          wfNodeId: props.task.approveNodeId,
          dataId: props.task.dataId,
          targetNodeId: selectedTargetNodeId.value,
          comment: comment.value,
        });
        break;
      case "addsign":
        if (!getSelectedEmployeeId()) {
          return;
        }
        await workflowServiceEx.addSign({
          wfInstanceId: props.task.wfInstanceId,
          wfNodeId: props.task.approveNodeId,
          dataId: props.task.dataId,
          targetEmployeeId: getSelectedEmployeeId(),
          comment: comment.value,
        });
        break;
      case "transfer":
        if (!getSelectedEmployeeId()) {
          return;
        }
        await workflowServiceEx.transfer({
          wfInstanceId: props.task.wfInstanceId,
          wfNodeId: props.task.approveNodeId,
          dataId: props.task.dataId,
          targetEmployeeId: getSelectedEmployeeId(),
          comment: comment.value,
        });
        break;
    }

    resetActionDialog();
    emit("processed");
  } catch {
  }
};

const handleWithdraw = async () => {
  try {
    await ElMessageBox.confirm(t("common.wfProcess.withdrawConfirm"), t("common.wfProcess.withdraw"), {
      type: "warning",
    });
    await workflowService.withdraw({
      wfInstanceId: props.task.wfInstanceId,
      dataId: props.task.dataId,
    });
    emit("processed");
  } catch {
  }
};

const handleUrge = async () => {
  try {
    await workflowService.urge({
      wfInstanceId: props.task.wfInstanceId,
      dataId: props.task.dataId,
    });
    ElMessage.success(t("common.wfProcess.urgeSuccess"));
  } catch {
  }
};

onMounted(async () => {
  const form = await formStore.get(props.task.formId);
  if (form) {
    formDef.value = form.content!;
  }

  const data = await formDataService.get<FormData_2>(props.task.dataId);
  if (data) {
    formData.value = data;
  }

  actionStatus.value = await workflowService.getActionStatus(props.task.dataId, props.task.wfInstanceId);
  await loadNodeActions();
  buildCustomActions();
});
</script>

<style scoped>
.action-dialog-body {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-12);
}

.full-width {
  width: 100%;
}
</style>
