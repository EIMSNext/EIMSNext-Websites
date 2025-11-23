<template>
  <div class="flow-designer">
    <div class="flow-actions">
      <div class="left"></div>
      <div class="right">
        <el-button>流程版本</el-button>
        <el-button>预览</el-button>
        <el-button @click="save">保存</el-button>
        <el-button>启用</el-button>
      </div>
    </div>
    <div class="flow-editor-wrapper">
      <div class="flow-editor">
        <div class="flow-toolbar">aaaaaaa</div>
        <WorkflowDiagram :flow-data="flowData" />
      </div>
      <div class="flow-meta-container">
        <WorkflowMetaEditor v-if="ready" />
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
  createWorkflowData,
} from "../FlowData";
import WorkflowDiagram from "./WorkflowDiagram.vue";
import WorkflowMetaEditor from "./WorkflowMetaEditor.vue";
import { EventSourceType, FlowType, WfDefinition, WfDefinitionRequest } from "@eimsnext/models";
import { wfDefinitionService } from "@eimsnext/services";
import { ODataQuery } from "@/utils/query";
import buildQuery from "odata-query";
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
  name: "WorkflowDesigner",
});
const props = defineProps<{
  appId: string;
  formId: string;
}>();

const ready = ref(false)
const currentWfDef = ref<WfDefinition>({
  id: "",
  name: "",
  flowType: FlowType.Workflow,
  externalId: props.formId,
  version: 1,
  isCurrent: true,
  content: "",
  eventSource: EventSourceType.None,
});

const flowData = ref<IFlowData>(createWorkflowData());
const flowContext: IFlowContext = {
  appId: props.appId,
  formId: props.formId,
  flowType: FlowType.Workflow,
  clonedData: createFlowNode(FlowNodeType.None),
  activeData: flowData.value.startNode,
  flowData: flowData.value,
};
provide("flowContext", flowContext);

onBeforeMount(() => {
  let query = buildQuery({ filter: { ExternalId: props.formId, iscurrent: true } });
  wfDefinitionService.query<WfDefinition>(query).then((res) => {
    if (res && res.length > 0) {
      currentWfDef.value = res[0];
      flowData.value = JSON.parse(currentWfDef.value.content);
      flowContext.flowData = flowData.value;
    }
  });

  ready.value = true
});

const save = () => {
  let req: WfDefinitionRequest = {
    id: currentWfDef.value.id,
    name: "",
    flowType: FlowType.Workflow,
    externalId: currentWfDef.value.externalId,
    version: currentWfDef.value.version,
    isCurrent: currentWfDef.value.isCurrent,
    content: JSON.stringify(flowData.value),
    eventSource: EventSourceType.None,
  };

  // console.log("wf req", req);

  if (req.id)
    wfDefinitionService.put<WfDefinition>(req.id, req).then((res) => (currentWfDef.value = res));
  else wfDefinitionService.post<WfDefinition>(req).then((res) => (currentWfDef.value = res));
};
</script>
<style lang="scss"></style>
