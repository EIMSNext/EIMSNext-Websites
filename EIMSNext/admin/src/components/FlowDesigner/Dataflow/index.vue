<template>
  <div class="flow-designer">
    <div class="flow-actions">
      <div class="left"></div>
      <div class="right">
        <el-button @click="save">保存</el-button>
        <el-button>启用</el-button>
      </div>
    </div>
    <div class="flow-editor-wrapper">
      <div class="flow-editor">
        <DataflowDiagram :flow-data="flowData" />
      </div>
      <div class="flow-meta-container" style="width: 500px">
        <DataflowMetaEditor v-if="ready" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  FlowNodeType,
  IFlowContext,
  IFlowData,
  createFlowNode,
  createDataflowData,
} from "../FlowData";
import DataflowDiagram from "./DataflowDiagram.vue";
import DataflowMetaEditor from "./DataflowMetaEditor.vue";
import { FlowType, EventSourceType, WfDefinition, WfDefinitionRequest } from "@eimsnext/models";
import { wfDefinitionService } from "@eimsnext/services";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "DataflowDesigner",
});
const props = defineProps<{
  appId: string;
  formId: string;
  flowDef: WfDefinition;
}>();

const ready = ref(false)
const currentWfDef = ref<WfDefinition>(props.flowDef);

const flowData = ref<IFlowData>(createDataflowData(EventSourceType.Form));
flowData.value.startNode.metadata.triggerMeta!.formId = props.formId;

const flowContext: IFlowContext = {
  appId: props.appId,
  eventSource: props.flowDef.eventSource,
  sourceId: props.flowDef.sourceId,
  formId: props.formId,
  flowType: FlowType.Dataflow,
  clonedData: createFlowNode(FlowNodeType.None),
  activeData: flowData.value.startNode,
  flowData: flowData.value,
};

provide("flowContext", flowContext);

onBeforeMount(() => {
  if (currentWfDef.value.content) {
    flowData.value = JSON.parse(currentWfDef.value.content);

    flowContext.flowData = flowData.value;
    flowContext.eventSource = currentWfDef.value.eventSource;
    flowContext.sourceId = currentWfDef.value.sourceId;
    flowContext.activeData = flowData.value.startNode;
  }

  ready.value = true
});

const save = () => {
  let req: WfDefinitionRequest = {
    id: currentWfDef.value.id,
    name: currentWfDef.value.name,
    flowType: currentWfDef.value.flowType,
    externalId: currentWfDef.value.externalId,
    version: currentWfDef.value.version,
    isCurrent: currentWfDef.value.isCurrent,
    content: JSON.stringify(flowData.value),
    eventSource: currentWfDef.value.eventSource,
    sourceId: currentWfDef.value.sourceId,
  };
  // console.log("wf req", req);
  if (req.id)
    wfDefinitionService.put<WfDefinition>(req.id, req).then((res) => (currentWfDef.value = res));
  else wfDefinitionService.post<WfDefinition>(req).then((res) => (currentWfDef.value = res));
};
</script>
<style lang="scss"></style>
