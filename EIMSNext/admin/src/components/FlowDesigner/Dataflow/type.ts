import { IListItem } from "@eimsnext/components";
import { FlowNodeType, IFlowData, IFlowNodeData, getFlowNodeById } from "../FlowData";
import { INodeForm } from "../components/NodeFieldList/type";
import { useFormStore } from "@eimsnext/store";

export function buildWfNodeListItems(wfFlowData: IFlowData): IListItem[] {
  const items: IListItem[] = [];

  wfFlowData.nodes.forEach((x) => {
    let item: IListItem = {
      id: x.id,
      label: x.name,
    };

    items.push(item);
  });

  return items;
}

export async function getPrevNodes(
  flowData: IFlowData,
  flowNode: IFlowNodeData
): Promise<INodeForm[]> {
  const formStore = useFormStore();
  const nodes: INodeForm[] = [];

  let prevNode: IFlowNodeData | undefined = flowNode;
  // console.log("prev node init ", prevNode, flowData);
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
      let node: INodeForm | undefined = {
        nodeId: prevNode.id,
        nodeName: prevNode.name,
        singleResult: false,
      };
      let formId: string | undefined = undefined;
      switch (prevNode.nodeType) {
        case FlowNodeType.Start:
          formId = prevNode.metadata.triggerMeta?.formId;
          node.singleResult = true;
          break;
        case FlowNodeType.Insert:
          formId = prevNode.metadata.insertMeta?.formId;
          node.singleResult = prevNode.metadata.insertMeta?.singleResult ?? true;
          break;
        case FlowNodeType.QueryOne:
          formId = prevNode.metadata.queryOneMeta?.formId;
          node.singleResult = true;
          break;
        case FlowNodeType.QueryMany:
          formId = prevNode.metadata.queryManyMeta?.formId;
          node.singleResult = false;
          break;
      }
      if (formId) {
        node.form = await formStore.get(formId);
      }

      nodes.splice(0, 0, node);
    }
  } while (prevNode);

  // console.log("nodes", nodes);
  return nodes;
}
function getPrevNode(flowData: IFlowData, flowNode: IFlowNodeData): IFlowNodeData | undefined {
  if (flowNode.nodeType == FlowNodeType.Start) return undefined;

  var prevId = flowNode.prevId;
  if (prevId) {
    // console.log("prev Id", prevId);
    return getFlowNodeById(flowData, prevId);
  } else {
    return undefined;
  }
}
