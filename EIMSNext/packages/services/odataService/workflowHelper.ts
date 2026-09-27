import { NodeActionConfig, NodeActionType, WfDefinition } from "@eimsnext/models";
import { ODataQueryRequest } from "../requestModel";
import { wfDefinitionService } from "./wfDefinitionService";

function buildODataQuery(filter?: string, skip = 0, top = 20, orderby?: string) {
  const query = new ODataQueryRequest();
  query.$skip = skip;
  query.$top = top;
  if (filter) query.$filter = filter;
  if (orderby) query.$orderby = orderby;
  return query;
}

export async function getNodeActions(formId: string, approveNodeId: string): Promise<NodeActionConfig[]> {
  const defs = await wfDefinitionService.query<WfDefinition>(
    buildODataQuery(`ExternalId eq '${formId}' and flowType eq '0' and isCurrent eq true`, 0, 1)
  );
  const def = defs[0];
  if (!def?.content) return [];

  const content = JSON.parse(def.content);
  const nodes = [content.startNode, ...(content.nodes || [])];

  const findNode = (items: any[]): any => {
    for (const item of items) {
      if (!item) continue;
      if (item.id === approveNodeId) return item;
      if (item.conditionData?.id === approveNodeId) return item.conditionData;
      const childMatch = findNode(item.childNodes || []);
      if (childMatch) return childMatch;
    }
    return undefined;
  };

  const node = findNode(nodes);
  return node?.metadata?.approveMeta?.nodeActions || [];
}

export function getNodeActionLabel(actionType: NodeActionType): string {
  switch (actionType) {
    case "submit":
      return "提交";
    case "return":
      return "回退";
    case "reject":
      return "驳回";
    case "draft":
      return "暂存";
    case "addSign":
      return "加签";
    case "transfer":
      return "转交";
    default:
      return "操作";
  }
}
