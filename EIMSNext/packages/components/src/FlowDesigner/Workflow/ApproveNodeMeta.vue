<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('workflow.approver')" :required="true" :tips="t('workflow.maxApproverTips')" />
    <el-select v-model="approverType" class="sub-item approve-mode-select">
      <el-option :label="t('workflow.normalApproval')" :value="ApproverType.Normal" />
      <el-option :label="t('workflow.byLevelApproval')" :value="ApproverType.ByLevel" />
    </el-select>
    <template v-if="isNormalApprover">
      <MetaItemHeader :label="t('workflow.approvalMode')" />
      <el-select v-model="activeData.metadata.approveMeta!.approveMode" class="sub-item approve-mode-select">
        <el-option :label="t('workflow.orSign')" :value="1" />
        <el-option :label="t('workflow.counterSign')" :value="2" />
      </el-select>
      <selected-tags v-model="selectedCandidateTags" :editable="true" :empty-text="t('comp.emptyMember')"
        @editTag="editApprover" />
      <member-select-dialog v-model="showApproverDialog" :tags="selectedCandidateTags" :member-options="memberOptions"
        destroy-on-close @ok="finishApproverSelect" />
    </template>
    <el-button v-else class="by-level-rule-button" @click="openByLevelDialog">
      <span>{{ t("workflow.byLevelRuleConfigured") }}</span>
      <el-icon><Edit /></el-icon>
    </el-button>

    <el-tabs v-model="activeConfigTab" class="node-config-tabs">
      <!-- <el-tab-pane :label="t('workflow.fieldPerms')" name="fieldPerms" /> -->
      <el-tab-pane :label="t('workflow.nodeActions')" name="nodeActions">
        <div class="node-actions-panel">
          <div>
            <div v-for="action in nodeActions" :key="action.actionType" class="node-action-item">
              <div class="node-action-main">
                <span class="node-action-label">{{ getDefaultActionLabel(action.actionType) }}</span>
                <div class="node-action-tools">
                  <el-button v-if="supportsCandidates(action.actionType)" link type="primary"
                    @click="openActionDialog(action.actionType)">
                    {{ t('common.edit') }}
                  </el-button>
                  <el-switch v-model="action.enabled" size="small" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="t('workflow.transitionRules')" name="transitionRules">
        <div class="transition-rules-panel">
          <div class="transition-rule-section">
            <MetaItemHeader :label="t('workflow.submitCondition')" />
            <el-select v-model="submitCondition.enabled" class="full-width-select">
              <el-option :label="t('workflow.submitConditionMet')" :value="false" />
              <el-option :label="t('workflow.submitConditionFormula')" :value="true" />
            </el-select>
            <el-button class="rule-action-button" @click="showSubmitConditionDialog = true">
              {{ t('workflow.addSubmitCondition') }}
            </el-button>
          </div>

          <div class="transition-rule-section">
            <MetaItemHeader :label="t('workflow.noApproverHandling')" />
            <el-select v-model="noApproverSetting.actionType" class="full-width-select">
              <el-option :label="t('workflow.noApproverStopAndReport')" :value="WfNoApproverActionType.StopAndReport" />
              <el-option :label="t('workflow.noApproverTransferToMember')" :value="WfNoApproverActionType.TransferToMember" />
              <el-option :label="t('workflow.noApproverAutoSubmit')" :value="WfNoApproverActionType.AutoSubmit" />
            </el-select>
            <el-button
              v-if="noApproverSetting.actionType === WfNoApproverActionType.TransferToMember"
              class="rule-action-button member-button"
              @click="showNoApproverMemberDialog = true"
            >
              {{ noApproverMemberButtonText }}
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <FormulaEditorDialog
      v-model="submitFormulaValue"
      v-model:visible="showSubmitFormulaDialog"
      :nodes="formulaNodes"
      :title="t('workflow.submitConditionDialogTitle')"
      :description="t('workflow.submitConditionDialogDesc')"
    />

    <et-dialog v-model="showActionDialog" :title="dialogTitle" width="500px" destroy-on-close @ok="confirmActionDialog"
      @cancel="cancelActionDialog">
      <div class="action-dialog-body">
        <MetaItemHeader :label="t('workflow.buttonText')" :required="true" />
        <el-input v-model="dialogAction.text" />

        <MetaItemHeader class="candidate-header" :label="dialogCandidateLabel" :required="true" />
        <selected-tags v-model="dialogCandidateTags" :editable="true" :empty-text="t('comp.emptyMember')"
          @editTag="showActionMemberDialog = true" />
      </div>
    </et-dialog>

    <member-select-dialog v-model="showActionMemberDialog" :tags="dialogCandidateTags" :member-options="memberOptions"
      destroy-on-close @ok="finishActionMemberSelect" />

    <et-dialog
      v-model="showSubmitConditionDialog"
      :title="t('workflow.submitConditionDialogTitle')"
      width="560px"
      destroy-on-close
      @ok="confirmSubmitConditionDialog"
      @cancel="showSubmitConditionDialog = false"
    >
      <div class="submit-condition-dialog">
        <MetaItemHeader :label="t('workflow.submitConditionPrompt')" />
        <el-input
          v-model="submitCondition.promptText"
          :placeholder="t('workflow.submitConditionPromptPlaceholder')"
        />
        <el-button class="formula-edit-button" @click="showSubmitFormulaDialog = true">
          {{ submitFormulaButtonText }}
        </el-button>
      </div>
    </et-dialog>

    <member-select-dialog
      v-model="showNoApproverMemberDialog"
      :tags="noApproverCandidateTags"
      :member-options="noApproverMemberOptions"
      destroy-on-close
      @ok="finishNoApproverMemberSelect"
    />

    <et-dialog
      v-model="showByLevelDialog"
      :title="t('workflow.byLevelApprovalRuleTitle')"
      width="600px"
      destroy-on-close
      @ok="confirmByLevelDialog"
      @cancel="showByLevelDialog = false"
    >
      <div class="by-level-dialog">
        <p class="by-level-desc">{{ t("workflow.byLevelApprovalRuleDesc") }}</p>
        <MetaItemHeader :label="t('workflow.approvalTerminal')" />
        <div class="by-level-row">
          <el-radio v-model="byLevelDraft.terminal" :label="ByLevelApprovalTerminal.StarterDepartment">
            {{ t("workflow.initiator") }}
          </el-radio>
          <el-select
            v-model="byLevelDraft.endLevel"
            :disabled="byLevelDraft.terminal !== ByLevelApprovalTerminal.StarterDepartment"
            class="by-level-select"
          >
            <el-option
              v-for="option in starterLevelOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
        <div class="by-level-row">
          <el-radio v-model="byLevelDraft.terminal" :label="ByLevelApprovalTerminal.Organization">
            {{ t("workflow.organizationInAddressBook") }}
          </el-radio>
          <el-select
            v-model="byLevelDraft.endLevel"
            :disabled="byLevelDraft.terminal !== ByLevelApprovalTerminal.Organization"
            class="by-level-select"
          >
            <el-option
              v-for="option in organizationLevelOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
      </div>
    </et-dialog>
  </template>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  ApproverType,
  ByLevelApprovalTerminal,
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  IByLevelApprovalSetting,
  NodeActionType,
  INodeActionConfig,
  ISubmitConditionSetting,
  INoApproverSetting,
  createFlowNode,
} from "../Common/FlowData";
import { useLocale } from "element-plus";
import { convertCandidateToTags, convertTagsToCandidates } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { ISelectedTag } from "@/selectedTags/type";
import { MemberTabs } from "@/component";
import { DataItemType } from "@/common";
import { FieldType, FormDef, WfNoApproverActionType } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import FormulaEditorDialog from "../Dataflow/FormulaEditorDialog.vue";
import { INodeForm } from "@/NodeFieldList/type";
import { IFormulaValue } from "@/FormFieldList/type";
import { Edit } from "@element-plus/icons-vue";

const { t } = useLocale();
const formStore = useFormStore();

defineOptions({
  name: "ApproveNodeMeta",
});

const ready = ref(false);
const flowContext = inject<IFlowContext>("flowContext")!;
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));
const showApproverDialog = ref(false);
const selectedCandidateTags = ref<ISelectedTag[]>([]);
const activeConfigTab = ref("nodeActions");
const showActionDialog = ref(false);
const showActionMemberDialog = ref(false);
const showSubmitConditionDialog = ref(false);
const showSubmitFormulaDialog = ref(false);
const showNoApproverMemberDialog = ref(false);
const showByLevelDialog = ref(false);
const dialogActionType = ref<NodeActionType>();
const dialogAction = ref<INodeActionConfig>({ actionType: NodeActionType.AddSign, enabled: false, text: "", candidates: [] });
const dialogCandidateTags = ref<ISelectedTag[]>([]);
const submitFormulaValue = ref<IFormulaValue>();
const noApproverCandidateTags = ref<ISelectedTag[]>([]);
const formulaNodes = ref<INodeForm[]>([]);
const byLevelDraft = ref<IByLevelApprovalSetting>({
  terminal: ByLevelApprovalTerminal.StarterDepartment,
  startLevel: 1,
  endLevel: 1,
});

const dynamicMembers = ref<ISelectedTag[]>([]);

const memberOptions = computed(() => ({
  showTabs:
    MemberTabs.Department |
    MemberTabs.Role |
    MemberTabs.Employee |
    MemberTabs.Dynamic,
  dynamicMembers: dynamicMembers.value,
  dynamicManagerLevels: [1, 2, 3, 4, 5],
  cascadedDept: true,
  showCascade: true,
  showContract: true,
}));

const noApproverMemberOptions = computed(() => ({
  showTabs:
    MemberTabs.Department |
    MemberTabs.Role |
    MemberTabs.Employee |
    MemberTabs.Dynamic,
  dynamicMembers: dynamicMembers.value,
  dynamicManagerLevels: [1, 2, 3, 4, 5],
  cascadedDept: true,
  showCascade: true,
  showContract: true,
  multiple: false,
}));

const ensureApproveMeta = () => {
  if (!activeData.value.metadata.approveMeta) {
    activeData.value.metadata.approveMeta = createFlowNode(FlowNodeType.Approve, t).metadata.approveMeta!;
  }
  if (activeData.value.metadata.approveMeta.approverType === undefined) {
    activeData.value.metadata.approveMeta.approverType = ApproverType.Normal;
  }
  if (!activeData.value.metadata.approveMeta.byLevelApprovalSetting) {
    activeData.value.metadata.approveMeta.byLevelApprovalSetting = {
      terminal: ByLevelApprovalTerminal.StarterDepartment,
      startLevel: 1,
      endLevel: 1,
    };
  }

  return activeData.value.metadata.approveMeta;
};

const submitCondition = computed<ISubmitConditionSetting>(() => {
  const approveMeta = ensureApproveMeta();
  if (!approveMeta.submitCondition) {
    approveMeta.submitCondition = {
      enabled: false,
      promptText: "",
    };
  }

  return approveMeta.submitCondition;
});

const noApproverSetting = computed<INoApproverSetting>(() => {
  const approveMeta = ensureApproveMeta();
  if (!approveMeta.noApproverSetting) {
    approveMeta.noApproverSetting = {
      actionType: WfNoApproverActionType.StopAndReport,
      candidates: [],
    };
  }

  return approveMeta.noApproverSetting;
});

const approverType = computed<ApproverType>({
  get() {
    return ensureApproveMeta().approverType ?? ApproverType.Normal;
  },
  set(value) {
    const approveMeta = ensureApproveMeta();
    approveMeta.approverType = value;
    if (value === ApproverType.ByLevel) {
      approveMeta.approvalCandidates = [];
      selectedCandidateTags.value = [];
    }
  },
});

const isNormalApprover = computed(() => approverType.value === ApproverType.Normal);

const starterLevelOptions = computed(() => [
  { value: 1, label: t("workflow.directDepartmentManager") },
  ...[2, 3, 4, 5, 6].map((level) => ({
    value: level,
    label: level === 2
      ? t("workflow.upperDepartmentManager")
      : t("workflow.nthDepartmentManager", { level }),
  })),
]);

const organizationLevelOptions = computed(() => [
  { value: 1, label: t("workflow.topDepartmentManager") },
  ...[2, 3, 4, 5, 6].map((level) => ({
    value: level,
    label: t("workflow.topDepartmentDownManager", { level: level - 1 }),
  })),
]);

const createStarterTag = (): ISelectedTag => {
  const label = t("workflow.starter");
  return {
    id: "starter",
    sourceId: "starter",
    label,
    icon: "el-UserFilled",
    type: DataItemType.Dynamic,
    data: {
      dynamicCategory: "starter",
      baseLabel: label,
    },
  };
};

const createFieldTag = (
  field: { field: string; title: string; type: FieldType },
): ISelectedTag | null => {
  if (field.type !== FieldType.Employee1
    && field.type !== FieldType.Employee2
    && field.type !== FieldType.Department1
    && field.type !== FieldType.Department2) {
    return null;
  }

  const isEmployeeField =
    field.type === FieldType.Employee1 || field.type === FieldType.Employee2;

  return {
    id: field.field,
    sourceId: field.field,
    label: field.title,
    icon: isEmployeeField ? "el-UserFilled" : "icon-organization",
    type: DataItemType.Field,
    data: {
      fieldType: field.type,
      dynamicCategory: isEmployeeField ? "employeeField" : "departmentField",
      baseLabel: field.title,
    },
  };
};

const loadDynamicMembers = async () => {
  const members: ISelectedTag[] = [createStarterTag()];
  const form = await formStore.get(flowContext.formId);
  loadFormulaNodes(form);
  form?.content?.items?.forEach((field) => {
    const tag = createFieldTag(field);
    if (tag) {
      members.push(tag);
    }
  });
  dynamicMembers.value = members;
};

const loadFormulaNodes = (form?: FormDef) => {
  formulaNodes.value = [
    {
      nodeId: "",
      nodeName: t("workflow.currentForm"),
      form,
      singleResult: true,
    },
  ];
};

const nodeActions = computed(() => {
  const approveMeta = ensureApproveMeta();
  if (!approveMeta.nodeActions) {
    approveMeta.nodeActions = createFlowNode(FlowNodeType.Approve, t).metadata.approveMeta!.nodeActions || [];
  }

  return approveMeta.nodeActions!;
});

const dialogTitle = computed(() => {
  if (!dialogActionType.value) {
    return t("common.edit");
  }

  return getDefaultActionLabel(dialogActionType.value);
});

const dialogCandidateLabel = computed(() => {
  return dialogActionType.value === NodeActionType.Transfer
    ? t("workflow.transferCandidates")
    : t("workflow.addSignCandidates");
});

const submitFormulaButtonText = computed(() => {
  return submitFormulaValue.value?.expression?.trim()
    ? t("workflow.editSubmitCondition")
    : t("workflow.addSubmitCondition");
});

const noApproverMemberButtonText = computed(() => {
  return noApproverCandidateTags.value.length > 0
    ? t("workflow.reselectMember")
    : t("workflow.selectMember");
});

const editApprover = () => {
  showApproverDialog.value = true;
};

const finishApproverSelect = (tags: ISelectedTag[]) => {
  if (!isNormalApprover.value) {
    showApproverDialog.value = false;
    return;
  }

  activeData.value.metadata.approveMeta!.approvalCandidates = convertTagsToCandidates(tags);
  selectedCandidateTags.value = tags;
  showApproverDialog.value = false;
};

const openByLevelDialog = () => {
  const setting = ensureApproveMeta().byLevelApprovalSetting;
  byLevelDraft.value = {
    terminal: setting?.terminal ?? ByLevelApprovalTerminal.StarterDepartment,
    startLevel: setting?.startLevel ?? 1,
    endLevel: setting?.endLevel ?? 1,
  };
  showByLevelDialog.value = true;
};

const confirmByLevelDialog = () => {
  ensureApproveMeta().byLevelApprovalSetting = {
    terminal: byLevelDraft.value.terminal ?? ByLevelApprovalTerminal.StarterDepartment,
    startLevel: 1,
    endLevel: byLevelDraft.value.endLevel ?? 1,
  };
  showByLevelDialog.value = false;
};

const getDefaultActionLabel = (actionType: NodeActionType) => {
  switch (actionType) {
    case NodeActionType.Submit:
      return t("workflow.nodeActionSubmit");
    case NodeActionType.Return:
      return t("workflow.nodeActionReturn");
    case NodeActionType.Reject:
      return t("workflow.nodeActionReject");
    case NodeActionType.Draft:
      return t("workflow.nodeActionDraft");
    case NodeActionType.AddSign:
      return t("workflow.nodeActionAddSign");
    case NodeActionType.Transfer:
      return t("workflow.nodeActionTransfer");
    default:
      return "";
  }
};

const supportsCandidates = (actionType: NodeActionType) => {
  return actionType === NodeActionType.AddSign || actionType === NodeActionType.Transfer;
};

const openActionDialog = (actionType: NodeActionType) => {
  const action = nodeActions.value.find((item) => item.actionType === actionType);
  if (!action) {
    return;
  }

  dialogActionType.value = actionType;
  dialogAction.value = {
    actionType: action.actionType,
    enabled: action.enabled,
    text: action.text || getDefaultActionLabel(action.actionType),
    candidates: action.candidates ? [...action.candidates] : [],
  };
  dialogCandidateTags.value = (dialogAction.value.candidates || []).flatMap(convertCandidateToTags);
  showActionDialog.value = true;
};

const finishActionMemberSelect = (tags: ISelectedTag[]) => {
  dialogCandidateTags.value = tags;
  dialogAction.value.candidates = convertTagsToCandidates(tags);
  showActionMemberDialog.value = false;
};

const confirmSubmitConditionDialog = () => {
  if (submitCondition.value.enabled && !submitFormulaValue.value?.expression?.trim()) {
    ElMessage.warning(t("workflow.submitConditionRequired"));
    return;
  }

  submitCondition.value.formulaValue = submitFormulaValue.value;
  if (!submitCondition.value.promptText?.trim()) {
    submitCondition.value.promptText = t("workflow.submitConditionDefaultPrompt");
  }
  showSubmitConditionDialog.value = false;
};

const finishNoApproverMemberSelect = (tags: ISelectedTag[]) => {
  noApproverCandidateTags.value = tags.slice(0, 1);
  noApproverSetting.value.candidates = convertTagsToCandidates(noApproverCandidateTags.value);
  showNoApproverMemberDialog.value = false;
};

const cancelActionDialog = () => {
  showActionDialog.value = false;
  showActionMemberDialog.value = false;
};

const confirmActionDialog = () => {
  if (!dialogActionType.value) {
    return;
  }

  if (!dialogAction.value.text?.trim()) {
    dialogAction.value.text = getDefaultActionLabel(dialogActionType.value);
  }

  if (supportsCandidates(dialogActionType.value) && (!dialogAction.value.candidates || dialogAction.value.candidates.length === 0)) {
    ElMessage.warning(t("workflow.actionCandidateRequired"));
    return;
  }

  const index = nodeActions.value.findIndex((item) => item.actionType === dialogActionType.value);
  if (index >= 0) {
    nodeActions.value[index] = {
      ...nodeActions.value[index],
      text: dialogAction.value.text,
      candidates: dialogAction.value.candidates ? [...dialogAction.value.candidates] : [],
    };
  }

  cancelActionDialog();
};

const init = () => {
  nextTick(() => {
    activeData.value = flowContext.activeData;
    const approveMeta = ensureApproveMeta();
    selectedCandidateTags.value = approveMeta.approverType === ApproverType.ByLevel
      ? []
      : (approveMeta.approvalCandidates || []).flatMap(convertCandidateToTags);
    submitFormulaValue.value = approveMeta.submitCondition?.formulaValue;
    noApproverCandidateTags.value = (approveMeta.noApproverSetting?.candidates || []).flatMap(convertCandidateToTags);
    ready.value = true;
  });
  loadDynamicMembers();
};

watch(
  () => submitCondition.value.enabled,
  (enabled) => {
    if (!enabled) {
      submitCondition.value.formulaValue = undefined;
      submitFormulaValue.value = undefined;
      return;
    }

    if (!submitCondition.value.formulaValue?.expression?.trim()) {
      showSubmitConditionDialog.value = true;
    }
  },
);

watch(
  () => submitFormulaValue.value,
  (value) => {
    submitCondition.value.formulaValue = value;
  },
);

watch(
  () => noApproverSetting.value.actionType,
  (actionType) => {
    if (actionType !== WfNoApproverActionType.TransferToMember) {
      noApproverSetting.value.candidates = [];
      noApproverCandidateTags.value = [];
    }
  },
);

watch(
  () => approverType.value,
  (value) => {
    if (value === ApproverType.ByLevel) {
      ensureApproveMeta().approvalCandidates = [];
      selectedCandidateTags.value = [];
    }
  },
);

init();
</script>

<style scoped>
.approve-mode-select {
  width: 100%;
  margin-bottom: var(--et-space-8);
}

.by-level-rule-button {
  width: 100%;
  justify-content: space-between;
  margin-bottom: var(--et-space-8);
}

.by-level-dialog {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: var(--et-space-12);
}

.by-level-desc {
  margin: 0;
  color: var(--et-text-secondary);
  line-height: 1.7;
}

.by-level-row {
  display: flex;
  align-items: center;
  gap: var(--et-space-12);
}

.by-level-row .el-radio {
  width: 88px;
  margin-right: 0;
}

.by-level-select {
  flex: 1;
}

.node-config-tabs {
  margin-top: var(--et-space-12);
}

.full-width-select {
  width: 100%;
}

.node-actions-panel {
  display: flex;
  border: solid 1px var(--et-border-color);
  border-radius: var(--et-space-10);
  flex-direction: column;
  padding: var(--et-space-8) var(--et-space-16);
  margin-top: var(--et-space-12);
}

.node-action-item:not(:last-child) {
  border-bottom: 1px solid var(--et-border-color);
}


.node-action-main {
  align-items: center;
  display: flex;
  justify-content: space-between;
  height: 36px;
}

.node-action-label {
  color: var(--et-text-primary);
}

.node-action-tools {
  align-items: center;
  display: flex;
  gap: var(--et-space-8);
}

.action-dialog-body {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-12);
}

.candidate-header {
  margin-top: var(--et-space-8);
}

.transition-rules-panel {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-16);
  margin-top: var(--et-space-12);
}

.transition-rule-section {
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-radius-6);
  padding: var(--et-space-12);
  background: var(--et-bg-container);
}

.rule-action-button {
  width: 100%;
  margin-top: var(--et-space-12);
}

.member-button {
  border-style: dashed;
}

.submit-condition-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-12);
}

.formula-edit-button {
  width: 100%;
}
</style>
