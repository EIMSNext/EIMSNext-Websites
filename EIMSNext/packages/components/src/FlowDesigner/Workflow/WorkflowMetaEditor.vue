<template>
  <div class="flow-meta-editor">
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t('workflow.nodeProps')" name="node">
        <div class="flow-node-meta">
          <div class="attr-content">
            <div class="attr-item has-padding">
              <MetaItemHeader
                :label="t('workflow.nodeName')"
                :required="true"
              ></MetaItemHeader>
              <el-input
                v-model="activeData.name"
                :readonly="nodeType == FlowNodeType.Start"
                size="default"
                class="full-width-input"
              />
            </div>
            <div
              v-if="nodeType == FlowNodeType.Approve"
              class="attr-item has-padding"
            >
              <ApproveNodeMeta></ApproveNodeMeta>
            </div>
            <div
              v-if="nodeType == FlowNodeType.Condition"
              class="attr-item has-padding"
            >
              <WfConditionNodeMeta></WfConditionNodeMeta>
            </div>
            <div
              v-if="nodeType == FlowNodeType.CopyTo"
              class="attr-item has-padding"
            >
              <CopyNodeMeta></CopyNodeMeta>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="t('workflow.flowProps')" name="flow">
        <div class="flow-node-meta">
          <div class="attr-content">
            <div class="attr-item has-padding">
              <MetaItemHeader :label="t('workflow.flowDescription')"></MetaItemHeader>
              <el-input
                v-model="workflowMeta.description"
                :placeholder="t('workflow.flowDescriptionPlaceholder')"
                type="textarea"
                :rows="4"
              />
            </div>

            <div class="attr-item has-padding">
              <MetaItemHeader :label="t('workflow.allowStarterUrge')"></MetaItemHeader>
              <el-switch v-model="workflowMeta.allowUrge" />
            </div>

            <div class="attr-item has-padding">
              <MetaItemHeader :label="t('workflow.flowReminder')"></MetaItemHeader>
              <div class="flow-check-list">
                <el-checkbox
                  :model-value="hasNotifyChannel(NotifyChannel.Email)"
                  @change="toggleNotifyChannel(NotifyChannel.Email, $event)"
                >
                  {{ t("workflow.emailReminder") }}
                </el-checkbox>
                <el-checkbox
                  :model-value="hasNotifyChannel(NotifyChannel.System)"
                  @change="toggleNotifyChannel(NotifyChannel.System, $event)"
                >
                  {{ t("workflow.systemReminder") }}
                </el-checkbox>
              </div>
            </div>

            <div class="attr-item has-padding">
              <MetaItemHeader :label="t('workflow.autoProcess')"></MetaItemHeader>
              <el-select v-model="workflowMeta.autoProcessRule" class="full-width-input">
                <el-option :label="t('workflow.autoProcessDisabled')" :value="WorkflowAutoProcessRule.Disabled" />
                <el-option :label="t('workflow.autoProcessFirstNode')" :value="WorkflowAutoProcessRule.FirstNodeOnly" />
                <el-option :label="t('workflow.autoProcessContinuous')" :value="WorkflowAutoProcessRule.ContinuousApproval" />
              </el-select>
            </div>

            <div class="attr-item has-padding">
              <MetaItemHeader :label="t('workflow.withdrawRule')"></MetaItemHeader>
              <el-select v-model="workflowMeta.withdrawRule" class="full-width-input">
                <el-option :label="t('workflow.withdrawDisabled')" :value="WorkflowWithdrawRule.Disabled" />
                <el-option :label="t('workflow.withdrawStarterOnly')" :value="WorkflowWithdrawRule.StarterOnly" />
                <el-option :label="t('workflow.withdrawAllNodes')" :value="WorkflowWithdrawRule.AllNodes" />
              </el-select>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts" setup>
import { computed, inject, nextTick, ref, watch } from "vue";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  WorkflowMeta,
  createFlowNode,
} from "../Common/FlowData";
import {
  NotifyChannel,
  WorkflowAutoProcessRule,
  WorkflowWithdrawRule,
} from "@eimsnext/models";
import { useLocale } from "element-plus";
import { FlagEnum } from "@eimsnext/utils";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import ApproveNodeMeta from "./ApproveNodeMeta.vue";
import WfConditionNodeMeta from "./WfConditionNodeMeta.vue";
import CopyNodeMeta from "./CopyNodeMeta.vue";
const { t } = useLocale();

defineOptions({
  name: "WorkflowMetaEditor",
});

const activeTab = ref("node");
const flowContext = inject<IFlowContext>("flowContext")!;
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));
const nodeType = ref(FlowNodeType.None);
const workflowMeta = computed<WorkflowMeta>(() => {
  if (!flowContext.flowData.workflowMeta) {
    flowContext.flowData.workflowMeta = {
      description: "",
      allowUrge: false,
      notifyChannels: NotifyChannel.None,
      autoProcessRule: WorkflowAutoProcessRule.Disabled,
      withdrawRule: WorkflowWithdrawRule.Disabled,
    };
  }

  return flowContext.flowData.workflowMeta!;
});

const hasNotifyChannel = (channel: NotifyChannel) =>
  FlagEnum.has(workflowMeta.value.notifyChannels ?? NotifyChannel.None, channel);

const toggleNotifyChannel = (channel: NotifyChannel, checked: boolean | string | number) => {
  const isChecked = !!checked;
  const current = workflowMeta.value.notifyChannels ?? NotifyChannel.None;
  workflowMeta.value.notifyChannels = isChecked
    ? FlagEnum.add(current, channel)
    : FlagEnum.remove(current, channel);
};

watch(
  () => flowContext.activeData,
  (newValue: IFlowNodeData) => {
    nodeType.value = FlowNodeType.None;
    activeData.value = newValue;
    nextTick(() => {
      nodeType.value = activeData.value.nodeType;
    });
  },
  { immediate: true },
);
</script>
<style lang="scss">
.flow-meta-editor {
  .full-width-input {
    width: 100%;
  }

  .flow-node-meta {
    height: 100%;
    overflow: auto;
    padding: var(--et-space-8);
    position: relative;

    .attr-content {
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -ms-flex-direction: column;
      flex-direction: column;

      .attr-item {
        font-size: var(--et-font-size-14);

        .item-header {
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          line-height: var(--et-line-height-22);
          margin-bottom: var(--et-space-8);
          position: relative;
          color: var(--et-text-primary);

          .title {
            color: var(--et-text-primary);
            font-size: var(--et-font-size-14);
            font-weight: 700;
          }
        }

        .sub-item + .sub-item {
          margin-top: var(--et-space-8);
        }
      }

      .has-padding {
        padding: var(--et-space-12);
      }
    }
  }

  .flow-check-list {
    display: flex;
    flex-direction: column;
    gap: var(--et-space-10);
  }

  .required {
    color: var(--et-color-danger);
  }

  .help-icon {
    color: var(--et-text-disabled);
    font-size: var(--et-font-size-16);
    line-height: var(--et-line-height-20);
    margin-left: var(--et-space-10);
  }
}
</style>
