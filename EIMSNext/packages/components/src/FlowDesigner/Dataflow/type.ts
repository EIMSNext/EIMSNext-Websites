import { IListItem } from "@/list/type";
import {
  FlowNodeType,
  IFlowData,
  IFlowNodeData,
  getFlowNodeById,
} from "../Common/FlowData";
import { useFormStore } from "@eimsnext/store";
import { INodeForm } from "@/NodeFieldList/type";
import { DataItemType } from "@/common";
import { IFormFieldDef } from "@/FieldSelect/type";
import { DataflowTriggerKind, FieldType } from "@eimsnext/models";

export function buildWfNodeListItems(wfFlowData: IFlowData): IListItem[] {
  const items: IListItem[] = [];

  wfFlowData.nodes.forEach((x) => {
    let item: IListItem = {
      id: x.id,
      label: x.name,
      type: DataItemType.FlowNode,
    };

    items.push(item);
  });

  return items;
}

export async function getPrevNodes(
  flowData: IFlowData,
  flowNode: IFlowNodeData,
): Promise<INodeForm[]> {
  const formStore = useFormStore();
  const nodes: INodeForm[] = [];

  let prevNode: IFlowNodeData | undefined = flowNode;
  do {
    prevNode = getPrevNode(flowData, prevNode);

    if (
      prevNode &&
      prevNode.nodeType != FlowNodeType.Branch &&
      prevNode.nodeType != FlowNodeType.BranchItem &&
      prevNode.nodeType != FlowNodeType.Condition &&
      prevNode.nodeType != FlowNodeType.ConditionOther &&
      prevNode.nodeType != FlowNodeType.Branch2
    ) {
      const currentNodeId = prevNode.id;
      let node: INodeForm | undefined = {
        nodeId: currentNodeId,
        nodeName: prevNode.name,
        singleResult: false,
      };
      let formId: string | undefined = undefined;
        switch (prevNode.nodeType) {
          case FlowNodeType.Start:
          node.singleResult = true;
          if (prevNode.metadata.triggerMeta?.triggerKind === DataflowTriggerKind.Http) {
            node.outputFields = (prevNode.metadata.triggerMeta?.httpSettings?.sampleFields ?? []).map((field) => ({
              formId: currentNodeId,
              field: field.key,
              label: field.label,
              type: field.type === "number" ? FieldType.Number : FieldType.Input,
              isSubField: false,
              nodeId: currentNodeId,
              singleResultNode: true,
              sourceType: "http",
            } satisfies IFormFieldDef));
          } else if (prevNode.metadata.triggerMeta?.triggerKind === DataflowTriggerKind.Schedule) {
            formId = prevNode.metadata.triggerMeta?.timeSettings?.sourceType === "formField"
              ? prevNode.metadata.triggerMeta?.formId
              : undefined;
            if (!formId) {
              node.outputFields = [];
            }
          } else {
            formId = prevNode.metadata.triggerMeta?.formId;
          }
          break;
        case FlowNodeType.Insert:
          formId = prevNode.metadata.insertMeta?.formId;
          node.singleResult =
            prevNode.metadata.insertMeta?.singleResult ?? true;
          break;
        case FlowNodeType.QueryOne:
          formId = prevNode.metadata.queryOneMeta?.formId;
          node.singleResult = true;
          break;
        case FlowNodeType.QueryMany:
          formId = prevNode.metadata.queryManyMeta?.formId;
          node.singleResult = false;
          break;
        case FlowNodeType.Plugin:
          node.singleResult = prevNode.metadata.pluginMeta?.singleResult ?? true;
          node.outputFields = (prevNode.metadata.pluginMeta?.resultFields ?? []).map((field) => ({
            formId: currentNodeId,
            field: field.fieldKey,
            label: field.fieldName,
            type: field.fieldType as FieldType,
            isSubField: false,
            nodeId: currentNodeId,
            singleResultNode: true,
          } satisfies IFormFieldDef));
          break;
      }
      if (formId) {
        node.form = await formStore.get(formId);
      }

      nodes.splice(0, 0, node);
    }
  } while (prevNode);

  return nodes;
}
function getPrevNode(
  flowData: IFlowData,
  flowNode: IFlowNodeData,
): IFlowNodeData | undefined {
  if (flowNode.nodeType == FlowNodeType.Start) return undefined;

  var prevId = flowNode.prevId;
  if (prevId) {
    return getFlowNodeById(flowData, prevId);
  } else {
    return undefined;
  }
}
