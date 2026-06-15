<template>
  <div class="flow-designer">
    <div class="flow-actions">
      <div class="left"></div>
      <div class="right">
        <el-button @click="save">{{ t("common.save") }}</el-button>
        <el-button>{{ t("admin.misc.dataflowActivate") }}</el-button>
      </div>
    </div>
    <div class="flow-editor-wrapper">
      <div class="flow-editor">
        <DataflowDiagram :flow-data="flowData" />
      </div>
      <div class="flow-meta-container dataflow-meta-container">
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
  EtConfirm,
  ConfirmResult,
  MessageIcon,
} from "@eimsnext/components";
import { FlowType, EventSourceType, WfDefinition, WfDefinitionRequest } from "@eimsnext/models";
import { wfDefinitionService } from "@eimsnext/services";
import { useLocale } from "element-plus";
const { t } = useLocale();

enum FormulaFieldValueType {
  Formula = "formula",
}

interface IDataflowFormFieldItem {
  field: { field: string; label: string; isSubField?: boolean };
  value: {
    type: string;
    formulaValue?: { expression?: string; drivingField?: { isSubField?: boolean } };
  };
}

defineOptions({
  name: "DataflowDesigner",
});
const props = defineProps<{
  appId: string;
  formId: string;
  flowDef: WfDefinition;
}>();

const ready = ref(false);
const currentWfDef = ref<WfDefinition>(props.flowDef);

const flowData = ref<IFlowData>(createDataflowData(props.flowDef.eventSource ?? EventSourceType.Form, t));
flowData.value.startNode.metadata.triggerMeta!.formId = props.formId;

const flowContext = reactive<IFlowContext>({
  definitionId: props.flowDef.id,
  appId: props.appId,
  eventSource: props.flowDef.eventSource,
  sourceId: props.flowDef.sourceId,
  formId: props.formId,
  flowType: FlowType.Dataflow,
  clonedData: createFlowNode(FlowNodeType.None, t),
  activeData: flowData.value.startNode,
  flowData: flowData.value,
});

provide("flowContext", flowContext);

onBeforeMount(() => {
  if (currentWfDef.value.content) {
    flowData.value = JSON.parse(currentWfDef.value.content);

    flowContext.flowData = flowData.value;
    flowContext.eventSource = currentWfDef.value.eventSource;
    flowContext.sourceId = currentWfDef.value.sourceId;
    flowContext.activeData = flowData.value.startNode;
  }

  ready.value = true;
});

const validateFormulaFieldList = (items: IDataflowFormFieldItem[]) => {
  const errors: { field: string; label: string }[] = [];
  items.forEach((item) => {
    if (item.value.type != FormulaFieldValueType.Formula) return;
    const formula = item.value.formulaValue;
    if (!formula?.expression?.trim()) {
      errors.push({ field: item.field.field, label: item.field.label });
      return;
    }

    if (item.field.isSubField && !formula.drivingField?.isSubField) {
      errors.push({ field: item.field.field, label: item.field.label });
    }
  });

  return { errors };
};

const getFormulaValidation = () => {
  const errors: { nodeId: string; nodeName: string; label: string }[] = [];
  const allNodes = [flowData.value.startNode, ...flowData.value.nodes];

  allNodes.forEach((node) => {
    const fieldLists = [];
    if (node.metadata.insertMeta?.formFieldList) {
      fieldLists.push(node.metadata.insertMeta.formFieldList);
    }
    if (node.metadata.updateMeta?.formFieldList) {
      fieldLists.push(node.metadata.updateMeta.formFieldList);
    }
    if (node.metadata.updateMeta?.insertFieldList) {
      fieldLists.push(node.metadata.updateMeta.insertFieldList);
    }

    fieldLists.forEach((fieldList) => {
      const result = validateFormulaFieldList(fieldList.items);
      result.errors.forEach((item: { field: string; label: string }) => {
        errors.push({
          nodeId: node.id,
          nodeName: node.name,
          label: item.label,
        });
      });
    });
  });

  return errors;
};

const hasMissingField = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;
  if ((value as { missing?: boolean }).missing) return true;
  if (Array.isArray(value)) return value.some(hasMissingField);
  return Object.values(value).some(hasMissingField);
};

const getMissingFieldValidation = () => {
  const errors: { nodeId: string; nodeName: string }[] = [];
  const visitNode = (node: any) => {
    if (hasMissingField(node.metadata)) {
      errors.push({ nodeId: node.id, nodeName: node.name });
    }
    node.conditionData && visitNode(node.conditionData);
    node.childNodes?.forEach(visitNode);
  };

  [flowData.value.startNode, ...flowData.value.nodes, flowData.value.endNode].forEach(visitNode);
  return errors;
};

const save = async () => {
  const formulaErrors = getFormulaValidation();
  if (formulaErrors.length > 0) {
    const confirm = await EtConfirm.showDialog(
      t("dataflow.formulaSaveDisabledContent"),
      {
        title: t("dataflow.formulaSaveDisabledTitle"),
        icon: MessageIcon.Warning,
      },
    );
    if (confirm != ConfirmResult.Yes) return;
    currentWfDef.value.disabled = true;
  }

  const missingFieldErrors = getMissingFieldValidation();
  if (missingFieldErrors.length > 0) {
    const confirm = await EtConfirm.showDialog(
      t("dataflow.missingFieldSaveDisabledContent"),
      {
        title: t("dataflow.missingFieldSaveDisabledTitle"),
        icon: MessageIcon.Warning,
      },
    );
    if (confirm != ConfirmResult.Yes) return;
    currentWfDef.value.disabled = true;
  }

  let req: WfDefinitionRequest = {
    id: currentWfDef.value.id,
    appId: currentWfDef.value.appId,
    name: currentWfDef.value.name,
    flowType: currentWfDef.value.flowType,
    externalId: currentWfDef.value.externalId,
    content: JSON.stringify(flowData.value),
    eventSource: currentWfDef.value.eventSource,
    sourceId: currentWfDef.value.sourceId,
    disabled: currentWfDef.value.disabled,
  };
  if (req.id)
    wfDefinitionService.put<WfDefinition>(req.id, req).then((res) => {
      currentWfDef.value = res;
      flowContext.definitionId = res.id;
    });
  else wfDefinitionService.post<WfDefinition>(req).then((res) => {
    currentWfDef.value = res;
    flowContext.definitionId = res.id;
  });
};
</script>
<style lang="scss">
.dataflow-meta-container {
  width: var(--et-size-500);
}
</style>
