<template>
  <div class="flow-meta-editor">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="节点属性" name="node">
        <div class="flow-node-meta">
          <div class="attr-content">
            <div class="attr-item has-padding">
              <MetaItemHeader :label="t('节点名称')" :required="true"></MetaItemHeader>
              <el-input v-model="activeData.name" :readonly="nodeType == FlowNodeType.Start" size="default"
                style="width: 100%" />
            </div>
            <div v-if="nodeType == FlowNodeType.Approve" class="attr-item has-padding">
              <ApproveNodeMeta></ApproveNodeMeta>
            </div>
            <div v-if="nodeType == FlowNodeType.Condition" class="attr-item has-padding">
              <WfConditionNodeMeta></WfConditionNodeMeta>
            </div>
            <div v-if="nodeType == FlowNodeType.CopyTo" class="attr-item has-padding">
              <CopyNodeMeta></CopyNodeMeta>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="流程属性" name="flow">
        <div>提醒设置</div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
import { FlowNodeType, IFlowContext, IFlowNodeData, createFlowNode } from "../Common/FlowData";
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
  { immediate: true }
);
</script>
<style lang="scss">
.flow-meta-editor {
  .flow-node-meta {
    height: 100%;
    overflow: auto;
    padding: 8px 8px 8px;
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
        font-size: 14px;

        .item-header {
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          line-height: 22px;
          margin-bottom: 8px;
          position: relative;
          color: var(--et-color-text);

          .title {
            // color: var(--fd-color-text);
            font-size: 14px;
            font-weight: 700;
          }
        }

        .sub-item+.sub-item {
          margin-top: 8px;
        }
      }

      .has-padding {
        padding: 12px;
      }
    }
  }

  .required {
    color: #eb5050;
  }

  .help-icon {
    color: #b5b8be;
    font-size: 16px;
    line-height: 20px;
    margin-left: 2px;
  }
}
</style>
