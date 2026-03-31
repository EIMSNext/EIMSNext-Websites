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
        <div>{{ t("workflow.reminderSetting") }}</div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
import {
  FlowNodeType,
  IFlowContext,
  IFlowNodeData,
  createFlowNode,
} from "../Common/FlowData";
import { useLocale } from "element-plus";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import ApproveNodeMeta from "./ApproveNodeMeta.vue";
import WfConditionNodeMeta from "./WfConditionNodeMeta.vue";
import CopyNodeMeta from "./CopyNodeMeta.vue";
const { t } = useLocale();

defineOptions({
  name: "WorkflowMetaEditor",
});

const activeTab = ref("node");
const flowContext = inject<IFlowContext>("flowContext");
const flowContextRef = reactive<IFlowContext>(flowContext!);
const activeData = ref<IFlowNodeData>(createFlowNode(FlowNodeType.None, t));
const nodeType = ref(FlowNodeType.None);

watch(
  () => flowContextRef.activeData,
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
            // color: var(--fd-color-text);
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
