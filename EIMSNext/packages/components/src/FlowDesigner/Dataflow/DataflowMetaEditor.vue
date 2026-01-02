<template>
  <div class="flow-meta-editor">
    <div class="flow-node-meta">
      <div class="attr-content">
        <div class="attr-item has-padding" style="padding-bottom: 0">
          <MetaItemHeader :label="t('workflow.nodeName')" :required="true"></MetaItemHeader>
          <el-input v-model="activeData.name" :readonly="activeData.nodeType == FlowNodeType.Start" size="default"
            style="width: 100%" />
        </div>
        <div v-if="nodeType == FlowNodeType.Start" class="attr-item has-padding">
          <TriggerNodeMeta></TriggerNodeMeta>
        </div>
        <div v-if="nodeType == FlowNodeType.Condition" class="attr-item has-padding">
          <DfConditionNodeMeta></DfConditionNodeMeta>
        </div>
        <div v-if="nodeType == FlowNodeType.Insert" class="attr-item has-padding">
          <InsertNodeMeta></InsertNodeMeta>
        </div>
        <div v-if="nodeType == FlowNodeType.Update" class="attr-item has-padding">
          <UpdateNodeMeta></UpdateNodeMeta>
        </div>
        <div v-if="nodeType == FlowNodeType.Delete" class="attr-item has-padding">
          <DeleteNodeMeta></DeleteNodeMeta>
        </div>
        <div v-if="nodeType == FlowNodeType.QueryOne" class="attr-item has-padding">
          <QueryOneNodeMeta></QueryOneNodeMeta>
        </div>
        <div v-if="nodeType == FlowNodeType.QueryMany" class="attr-item has-padding">
          <QueryManyNodeMeta></QueryManyNodeMeta>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { inject, nextTick, reactive, ref, watch } from "vue";
import { FlowNodeType, IFlowContext, IFlowNodeData, createFlowNode, EventType } from "../Common/FlowData";
import MetaItemHeader from "../Common/MetaItemHeader.vue";
import TriggerNodeMeta from "./TriggerNodeMeta.vue";
import InsertNodeMeta from "./InsertNodeMeta.vue";
import UpdateNodeMeta from "./UpdateNodeMeta.vue";
import DeleteNodeMeta from "./DeleteNodeMeta.vue";
import QueryOneNodeMeta from "./QueryOneNodeMeta.vue";
import QueryManyNodeMeta from "./QueryManyNodeMeta.vue";
import DfConditionNodeMeta from "./DfConditionNodeMeta.vue";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "DataflowMetaEditor",
});

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