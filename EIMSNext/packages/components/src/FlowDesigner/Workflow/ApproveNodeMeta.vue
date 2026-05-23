<template>
  <template v-if="ready">
    <MetaItemHeader :label="t('workflow.approver')" :required="true" :tips="t('workflow.maxApproverTips')" />
    <el-select v-model="activeData.metadata.approveMeta!.approveMode" class="sub-item approve-mode-select">
      <el-option :label="t('workflow.orSign')" :value="1" />
      <el-option :label="t('workflow.counterSign')" :value="2" />
    </el-select>
    <selected-tags v-model="selectedCandidateTags" :editable="true" :empty-text="t('comp.emptyMember')"
      @editTag="editApprover" />
    <member-select-dialog v-model="showApproverDialog" :tags="selectedCandidateTags" :member-options="memberOptions"
      destroy-on-close @ok="finishApproverSelect" />

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
      <el-tab-pane :label="t('workflow.transitionRules')" name="transitionRules" />
    </el-tabs>

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
  </template>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  NodeActionType,
  INodeActionConfig,
  createFlowNode,
} from "../Common/FlowData";
import { useLocale } from "element-plus";
import { convertCandidateToTags, convertTagsToCandidates } from "./type";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import { ISelectedTag } from "@/selectedTags/type";
import { MemberTabs } from "@/component";
import { DataItemType } from "@/common";
import { FieldType } from "@eimsnext/models";
import { useFormStore } from "@eimsnext/store";

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
const dialogActionType = ref<NodeActionType>();
const dialogAction = ref<INodeActionConfig>({ actionType: NodeActionType.AddSign, enabled: false, text: "", candidates: [] });
const dialogCandidateTags = ref<ISelectedTag[]>([]);

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

const createStarterTag = (): ISelectedTag => ({
  id: "starter",
  sourceId: "starter",
  label: t("workflow.starter"),
  icon: "el-UserFilled",
  type: DataItemType.Dynamic,
  data: {
    dynamicCategory: "starter",
    baseLabel: t("workflow.starter"),
  },
});

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
  form?.content?.items?.forEach((field) => {
    const tag = createFieldTag(field);
    if (tag) {
      members.push(tag);
    }
  });
  dynamicMembers.value = members;
};

const nodeActions = computed(() => {
  if (!activeData.value.metadata.approveMeta) {
    activeData.value.metadata.approveMeta = createFlowNode(FlowNodeType.Approve, t).metadata.approveMeta!;
  }

  if (!activeData.value.metadata.approveMeta.nodeActions) {
    activeData.value.metadata.approveMeta.nodeActions = createFlowNode(FlowNodeType.Approve, t).metadata.approveMeta!.nodeActions || [];
  }

  return activeData.value.metadata.approveMeta.nodeActions!;
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

const editApprover = () => {
  showApproverDialog.value = true;
};

const finishApproverSelect = (tags: ISelectedTag[]) => {
  activeData.value.metadata.approveMeta!.approvalCandidates = convertTagsToCandidates(tags);
  selectedCandidateTags.value = tags;
  showApproverDialog.value = false;
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
    selectedCandidateTags.value = (activeData.value.metadata.approveMeta?.approvalCandidates || []).flatMap(convertCandidateToTags);
    ready.value = true;
  });
  loadDynamicMembers();
};

init();
</script>

<style scoped>
.approve-mode-select {
  width: 100%;
  margin-bottom: var(--et-space-8);
}

.node-config-tabs {
  margin-top: var(--et-space-12);
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
</style>
