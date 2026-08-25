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

    <div class="copyto-section">
      <el-checkbox v-model="enableCopyto" class="copyto-check">
        {{ t("workflow.enableCopyto") }}
      </el-checkbox>
      <div
        v-if="enableCopyto"
        class="copyto-member-panel"
        @click="showCopytoMemberDialog = true"
      >
        <selected-tags
          v-model="copytoCandidateTags"
          :editable="true"
          :empty-text="t('workflow.selectCopytoMember')"
          @editTag="showCopytoMemberDialog = true"
        />
      </div>
    </div>

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

          <div class="transition-rule-section">
            <MetaItemHeader :label="t('workflow.expireHandling')" />
            <el-button class="rule-action-button" @click="openExpireDialog">
              {{ expireButtonText }}
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

    <member-select-dialog
      v-model="showCopytoMemberDialog"
      :tags="copytoCandidateTags"
      :member-options="memberOptions"
      destroy-on-close
      @ok="finishCopytoMemberSelect"
    />

    <member-select-dialog
      v-model="showExpireNotifyMemberDialog"
      :tags="expireNotifyCandidateTags"
      :member-options="memberOptions"
      destroy-on-close
      @ok="finishExpireNotifyMemberSelect"
    />

    <member-select-dialog
      v-model="showExpireTransferMemberDialog"
      :tags="expireTransferCandidateTags"
      :member-options="noApproverMemberOptions"
      destroy-on-close
      @ok="finishExpireTransferMemberSelect"
    />

    <et-dialog
      v-model="showExpireDialog"
      :title="t('workflow.expireDialogTitle')"
      width="640px"
      destroy-on-close
      @ok="confirmExpireDialog"
      @cancel="cancelExpireDialog"
    >
      <div class="expire-dialog">
        <div class="expire-form-section">
          <MetaItemHeader :label="t('workflow.actionType')" />
          <el-select v-model="expireDialogDraft.actionType" class="full-width-select">
            <el-option :label="t('common.notSet')" :value="undefined" />
            <el-option :label="t('workflow.autoNotify')" :value="WfExpireActionType.AutoNotify" />
            <el-option :label="t('workflow.autoApprove')" :value="WfExpireActionType.AutoApprove" />
            <el-option :label="t('workflow.autoTransfer')" :value="WfExpireActionType.AutoTransfer" />
            <el-option :label="t('workflow.autoReject')" :value="WfExpireActionType.AutoReject" />
            <el-option :label="t('workflow.autoReturn')" :value="WfExpireActionType.AutoReturn" />
          </el-select>
        </div>

        <div v-if="expireDialogDraft.actionType !== undefined" class="expire-form-section">
          <MetaItemHeader :label="t('workflow.expireTime')" />
          <div class="expire-time-row">
            <span class="expire-time-prefix">{{ t("workflow.expireTimePrefix") }}</span>
            <el-input-number
              v-model="expireDialogDraft.timeValue"
              :min="1"
              :max="9999"
              :controls="false"
              class="expire-time-value"
            />
            <el-select v-model="expireDialogDraft.timeUnit" class="expire-time-unit">
              <el-option :label="t('workflow.timeUnitMinute')" :value="TimeUnit.Minute" />
              <el-option :label="t('workflow.timeUnitHour')" :value="TimeUnit.Hour" />
              <el-option :label="t('workflow.timeUnitDay')" :value="TimeUnit.Day" />
            </el-select>
            <span class="expire-time-suffix">{{ t("workflow.expireTimeSuffix") }}</span>
          </div>
        </div>

        <template v-if="isExpireNotify">
          <div class="expire-form-section">
            <MetaItemHeader :label="t('workflow.flowReminder')" />
            <div class="expire-channel-list">
              <el-checkbox
                :model-value="hasExpireNotifyChannel(NotifyChannel.Email)"
                @change="toggleExpireNotifyChannel(NotifyChannel.Email, $event)"
              >
                {{ t("workflow.emailReminder") }}
              </el-checkbox>
              <el-checkbox
                :model-value="hasExpireNotifyChannel(NotifyChannel.System)"
                @change="toggleExpireNotifyChannel(NotifyChannel.System, $event)"
              >
                {{ t("workflow.systemReminder") }}
              </el-checkbox>
            </div>
          </div>

          <div class="expire-form-section">
            <MetaItemHeader :label="t('workflow.notifyCandidates')" />
            <div class="expire-member-panel" @click="showExpireNotifyMemberDialog = true">
              <selected-tags
                v-model="expireNotifyCandidateTags"
                :editable="true"
                :empty-text="t('workflow.selectNotifyMember')"
                @editTag="showExpireNotifyMemberDialog = true"
              />
            </div>
          </div>
        </template>

        <template v-if="isExpireTransfer">
          <div class="expire-form-section">
            <MetaItemHeader :label="t('workflow.transferTarget')" />
            <div class="expire-member-panel" @click="showExpireTransferMemberDialog = true">
              <selected-tags
                v-model="expireTransferCandidateTags"
                :editable="true"
                :empty-text="t('workflow.selectTransferTarget')"
                @editTag="showExpireTransferMemberDialog = true"
              />
            </div>
          </div>
        </template>

        <template v-if="isExpireReturn">
          <div class="expire-form-section">
            <MetaItemHeader :label="t('workflow.returnTarget')" />
            <el-select v-model="expireReturnTargetMode" class="full-width-select">
              <el-option :label="t('workflow.returnPrevious')" :value="ReturnTargetMode.Previous" />
              <el-option :label="t('workflow.returnStart')" :value="ReturnTargetMode.Start" />
            </el-select>
          </div>
        </template>
      </div>
    </et-dialog>

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
          <el-radio v-model="byLevelDraft.terminal" :value="ByLevelApprovalTerminal.StarterDepartment">
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
          <el-radio v-model="byLevelDraft.terminal"  :value="ByLevelApprovalTerminal.Organization">
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
  IExpireSetting,
  INotifySetting,
  IReturnSetting,
  ITransferSetting,
  NodeActionType,
  INodeActionConfig,
  ISubmitConditionSetting,
  INoApproverSetting,
  ReturnTargetMode,
  TimeUnit,
  WfExpireActionType,
  createFlowNode,
} from "../Common/FlowData";
import { useLocale } from "element-plus";
import { convertCandidateToTags, convertTagsToCandidates } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { ISelectedTag } from "@/selectedTags/type";
import { MemberTabs } from "@/component";
import { DataItemType } from "@/common";
import { FieldType, FormDef, NotifyChannel, WfNoApproverActionType } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";
import FormulaEditorDialog from "../EventFlow/FormulaEditorDialog.vue";
import { INodeForm } from "@/NodeFieldList/type";
import { IFormulaValue } from "@/FormFieldList/type";
import { Edit } from "@element-plus/icons-vue";
import { FlagEnum } from "@eimsnext/utils";

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
const showCopytoMemberDialog = ref(false);
const showExpireDialog = ref(false);
const showExpireNotifyMemberDialog = ref(false);
const showExpireTransferMemberDialog = ref(false);
const dialogActionType = ref<NodeActionType>();
const dialogAction = ref<INodeActionConfig>({ actionType: NodeActionType.AddSign, enabled: false, text: "", candidates: [] });
const dialogCandidateTags = ref<ISelectedTag[]>([]);
const submitFormulaValue = ref<IFormulaValue>();
const noApproverCandidateTags = ref<ISelectedTag[]>([]);
const copytoCandidateTags = ref<ISelectedTag[]>([]);
const expireNotifyCandidateTags = ref<ISelectedTag[]>([]);
const expireTransferCandidateTags = ref<ISelectedTag[]>([]);
const formulaNodes = ref<INodeForm[]>([]);
const byLevelDraft = ref<IByLevelApprovalSetting>({
  terminal: ByLevelApprovalTerminal.StarterDepartment,
  startLevel: 1,
  endLevel: 1,
});
const expireDialogDraft = ref<IExpireSetting>({
  actionType: undefined,
  timeValue: 1,
  timeUnit: TimeUnit.Day,
  notifySetting: {
    channels: NotifyChannel.None,
    candidates: [],
  },
  transferSetting: {
    candidates: [],
  },
  returnSetting: {
    targetMode: ReturnTargetMode.Previous,
  },
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
  if (activeData.value.metadata.approveMeta.enableCopyto === undefined) {
    activeData.value.metadata.approveMeta.enableCopyto = false;
  }
  if (!activeData.value.metadata.approveMeta.copytoCandidates) {
    activeData.value.metadata.approveMeta.copytoCandidates = [];
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

const ensureNotifySetting = (expireSetting: IExpireSetting): INotifySetting => {
  if (!expireSetting.notifySetting) {
    expireSetting.notifySetting = {
      channels: NotifyChannel.None,
      candidates: [],
    };
  }

  return expireSetting.notifySetting;
};

const ensureTransferSetting = (expireSetting: IExpireSetting): ITransferSetting => {
  if (!expireSetting.transferSetting) {
    expireSetting.transferSetting = {
      candidates: [],
    };
  }

  return expireSetting.transferSetting;
};

const ensureReturnSetting = (expireSetting: IExpireSetting): IReturnSetting => {
  if (!expireSetting.returnSetting) {
    expireSetting.returnSetting = {
      targetMode: ReturnTargetMode.Previous,
    };
  }
  if (expireSetting.returnSetting.targetMode === ReturnTargetMode.Specified) {
    expireSetting.returnSetting.targetMode = ReturnTargetMode.Previous;
  }
  delete expireSetting.returnSetting.targetNodeId;

  return expireSetting.returnSetting;
};

const expireSetting = computed<IExpireSetting | undefined>(() => {
  const source = ensureApproveMeta().expireSetting;
  if (!source) {
    return undefined;
  }

  ensureNotifySetting(source);
  ensureTransferSetting(source);
  ensureReturnSetting(source);
  return source;
});

const enableCopyto = computed<boolean>({
  get() {
    return !!ensureApproveMeta().enableCopyto;
  },
  set(value) {
    const approveMeta = ensureApproveMeta();
    approveMeta.enableCopyto = value;
    if (!value) {
      approveMeta.copytoCandidates = [];
      copytoCandidateTags.value = [];
    }
  },
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

const expireButtonText = computed(() => {
  const setting = expireSetting.value;
  return setting?.actionType !== undefined && setting.timeValue && setting.timeValue > 0
    ? t("workflow.editExpireHandling")
    : t("workflow.setExpireHandling");
});

const isExpireNotify = computed(() => expireDialogDraft.value.actionType === WfExpireActionType.AutoNotify);
const isExpireTransfer = computed(() => expireDialogDraft.value.actionType === WfExpireActionType.AutoTransfer);
const isExpireReturn = computed(() => expireDialogDraft.value.actionType === WfExpireActionType.AutoReturn);

const expireReturnTargetMode = computed<ReturnTargetMode>({
  get() {
    return ensureReturnSetting(expireDialogDraft.value).targetMode ?? ReturnTargetMode.Previous;
  },
  set(value) {
    const returnSetting = ensureReturnSetting(expireDialogDraft.value);
    returnSetting.targetMode = value === ReturnTargetMode.Specified ? ReturnTargetMode.Previous : value;
    delete returnSetting.targetNodeId;
  },
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

const finishCopytoMemberSelect = (tags: ISelectedTag[]) => {
  copytoCandidateTags.value = tags;
  ensureApproveMeta().copytoCandidates = convertTagsToCandidates(tags);
  showCopytoMemberDialog.value = false;
};

const finishExpireNotifyMemberSelect = (tags: ISelectedTag[]) => {
  expireNotifyCandidateTags.value = tags;
  ensureNotifySetting(expireDialogDraft.value).candidates = convertTagsToCandidates(tags);
  showExpireNotifyMemberDialog.value = false;
};

const finishExpireTransferMemberSelect = (tags: ISelectedTag[]) => {
  expireTransferCandidateTags.value = tags.slice(0, 1);
  ensureTransferSetting(expireDialogDraft.value).candidates = convertTagsToCandidates(expireTransferCandidateTags.value);
  showExpireTransferMemberDialog.value = false;
};

const cancelActionDialog = () => {
  showActionDialog.value = false;
  showActionMemberDialog.value = false;
};

const hasExpireNotifyChannel = (channel: NotifyChannel) =>
  FlagEnum.has(ensureNotifySetting(expireDialogDraft.value).channels ?? NotifyChannel.None, channel);

const toggleExpireNotifyChannel = (channel: NotifyChannel, checked: boolean | string | number) => {
  const isChecked = !!checked;
  const notifySetting = ensureNotifySetting(expireDialogDraft.value);
  const current = notifySetting.channels ?? NotifyChannel.None;
  notifySetting.channels = isChecked
    ? FlagEnum.add(current, channel)
    : FlagEnum.remove(current, channel);
};

const openExpireDialog = () => {
  const source = expireSetting.value;
  expireDialogDraft.value = {
    actionType: source?.actionType,
    timeValue: source?.timeValue && source.timeValue > 0 ? source.timeValue : 1,
    timeUnit: source?.timeUnit ?? TimeUnit.Day,
    notifySetting: {
      channels: source?.notifySetting?.channels ?? NotifyChannel.None,
      candidates: source?.notifySetting?.candidates ? [...source.notifySetting.candidates] : [],
    },
    transferSetting: {
      candidates: source?.transferSetting?.candidates ? [...source.transferSetting.candidates] : [],
    },
    returnSetting: {
      targetMode: source?.returnSetting?.targetMode === ReturnTargetMode.Specified
        ? ReturnTargetMode.Previous
        : (source?.returnSetting?.targetMode ?? ReturnTargetMode.Previous),
    },
  };
  expireNotifyCandidateTags.value = (expireDialogDraft.value.notifySetting?.candidates || []).flatMap(convertCandidateToTags);
  expireTransferCandidateTags.value = (expireDialogDraft.value.transferSetting?.candidates || []).flatMap(convertCandidateToTags).slice(0, 1);
  showExpireDialog.value = true;
};

const cancelExpireDialog = () => {
  showExpireDialog.value = false;
  showExpireNotifyMemberDialog.value = false;
  showExpireTransferMemberDialog.value = false;
};

const confirmExpireDialog = () => {
  if (expireDialogDraft.value.actionType === undefined) {
    ensureApproveMeta().expireSetting = undefined;
    cancelExpireDialog();
    return;
  }

  if (!expireDialogDraft.value.timeValue || expireDialogDraft.value.timeValue <= 0) {
    ElMessage.warning(t("workflow.expireTimeRequired"));
    return;
  }

  if (isExpireNotify.value) {
    const notifySetting = ensureNotifySetting(expireDialogDraft.value);
    if ((notifySetting.channels ?? NotifyChannel.None) === NotifyChannel.None) {
      ElMessage.warning(t("workflow.expireNotifyChannelRequired"));
      return;
    }
    if (!notifySetting.candidates?.length) {
      ElMessage.warning(t("workflow.expireNotifyMemberRequired"));
      return;
    }
  }

  if (isExpireTransfer.value) {
    const transferSetting = ensureTransferSetting(expireDialogDraft.value);
    if (!transferSetting.candidates?.length) {
      ElMessage.warning(t("workflow.expireTransferMemberRequired"));
      return;
    }
  }

  if (isExpireReturn.value) {
    const returnSetting = ensureReturnSetting(expireDialogDraft.value);
    if (returnSetting.targetMode === ReturnTargetMode.Specified) {
      returnSetting.targetMode = ReturnTargetMode.Previous;
    }
    delete returnSetting.targetNodeId;
  }

  ensureApproveMeta().expireSetting = {
    actionType: expireDialogDraft.value.actionType,
    timeValue: expireDialogDraft.value.timeValue,
    timeUnit: expireDialogDraft.value.timeUnit,
    notifySetting: {
    channels: expireDialogDraft.value.notifySetting?.channels ?? NotifyChannel.None,
    candidates: expireDialogDraft.value.notifySetting?.candidates ? [...expireDialogDraft.value.notifySetting.candidates] : [],
    },
    transferSetting: {
    candidates: expireDialogDraft.value.transferSetting?.candidates ? [...expireDialogDraft.value.transferSetting.candidates] : [],
    },
    returnSetting: {
    targetMode: expireDialogDraft.value.returnSetting?.targetMode === ReturnTargetMode.Specified
      ? ReturnTargetMode.Previous
      : (expireDialogDraft.value.returnSetting?.targetMode ?? ReturnTargetMode.Previous),
    },
  };
  cancelExpireDialog();
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
    copytoCandidateTags.value = (approveMeta.copytoCandidates || []).flatMap(convertCandidateToTags);
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

.copyto-section {
  margin-top: var(--et-space-12);
  border: 1px solid var(--et-border-color);
  border-radius: var(--et-radius-6);
  padding: var(--et-space-12);
  background: var(--et-bg-container);
}

.copyto-check {
  margin-bottom: var(--et-space-12);
}

.copyto-member-panel,
.expire-member-panel {
  border: 1px dashed var(--et-border-color);
  border-radius: var(--et-radius-6);
  padding: var(--et-space-12);
  background: var(--et-bg-page);
  cursor: pointer;
  transition: border-color var(--et-duration-fast) var(--et-ease-linear);
}

.copyto-member-panel:hover,
.expire-member-panel:hover {
  border-color: var(--et-color-primary);
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

.expire-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-16);
  min-height: var(--et-size-320);
}

.expire-form-section {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-10);
}

.expire-time-row {
  display: flex;
  align-items: center;
  gap: var(--et-space-8);
  flex-wrap: wrap;
}

.expire-time-prefix,
.expire-time-suffix {
  color: var(--et-text-secondary);
  font-size: var(--et-font-size-14);
}

.expire-time-value {
  width: var(--et-size-100);
}

.expire-time-unit {
  width: var(--et-size-120);
}

.expire-channel-list {
  display: flex;
  flex-direction: column;
  gap: var(--et-space-10);
}
</style>
