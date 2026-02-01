import { cloneDeep, flow } from "lodash";
import { uniqueId } from "@eimsnext/utils";
import { FlowType, EventSourceType } from "@eimsnext/models";
import { IConditionList } from "@/ConditionList/type";
import { IFormFieldList } from "@/FormFieldList/type";
import { IFieldSortList } from "@/FieldSortList/type";
import { Translator } from "element-plus";

export enum FlowNodeType {
  None = 0,
  Start,
  End,
  Branch,
  BranchItem,
  Condition,
  ConditionOther,
  //工作流节点
  Approve,
  CopyTo,
  //数据流节点
  QueryOne,
  QueryMany,
  Insert,
  Update,
  Delete,
  Print,
  Plugin,
  //并行节点
  Branch2,
}
export enum CascadeMode {
  All = 0,
  Specified,
  Never,
}
export enum UpdateMode {
  Form = 0,
  Node = 1,
}
export interface IFlowNodeData {
  id: string;
  name: string;
  notes?: string;
  prevId?: string;
  nextId?: string;
  nodeType: FlowNodeType;
  conditionData?: IFlowNodeData;
  childNodes?: IFlowNodeData[];
  metadata: IFlowNodeMetaData;
}

export interface IFlowData {
  startNode: IFlowNodeData;
  nodes: IFlowNodeData[];
  endNode: IFlowNodeData;
  eventSource?: EventSourceType;
  dfCascade?: CascadeMode;
  eventIds?: string[];
}

export interface IFlowContext {
  appId: string;
  formId: string;
  flowType: FlowType;
  clonedData: IFlowNodeData;
  activeData: IFlowNodeData;
  eventSource?: EventSourceType;
  sourceId?: string;
  flowData: IFlowData;
}
export function createFlowNode(
  nodeType: FlowNodeType,
  t: Translator
): IFlowNodeData {
  switch (nodeType) {
    case FlowNodeType.Branch:
    case FlowNodeType.Branch2:
      let id = uniqueId();
      let bId1 = uniqueId();
      let bId2 = uniqueId();
      return {
        id: id,
        nodeType: nodeType,
        name:
          nodeType == FlowNodeType.Branch
            ? t("workflow.branchNode")
            : t("workflow.branch2Node"),
        childNodes: [
          {
            id: bId1,
            nodeType: FlowNodeType.BranchItem,
            name: t("workflow.branchItemNode"),
            conditionData: {
              id: uniqueId(),
              nodeType: FlowNodeType.Condition,
              name: t("workflow.conditionNode"),
              metadata: {
                conditionMeta: {
                  condition: { id: uniqueId(), rel: "and", items: [] },
                },
              },
              prevId: bId1,
            },
            childNodes: [],
            metadata: {},
            prevId: id,
          },
          {
            id: bId2,
            nodeType: FlowNodeType.BranchItem,
            name: t("workflow.branchItemNode"),
            conditionData: {
              id: uniqueId(),
              nodeType: FlowNodeType.ConditionOther,
              name: t("workflow.conditionOtherNode"),
              metadata: { conditionMeta: {} },
              prevId: bId2,
            },
            childNodes: [],
            metadata: {},
            prevId: id,
          },
        ],
        metadata: {},
      };
    case FlowNodeType.BranchItem:
      let bId = uniqueId();
      return {
        id: bId,
        nodeType: FlowNodeType.BranchItem,
        name: t("workflow.branchItemNode"),
        notes: t("common.notset"),
        conditionData: {
          id: uniqueId(),
          nodeType: FlowNodeType.Condition,
          name: t("workflow.conditionNode"),
          notes: t("common.notset"),
          metadata: {
            conditionMeta: {
              condition: { id: uniqueId(), rel: "and", items: [] },
            },
          },
          prevId: bId,
        },
        childNodes: [],
        metadata: {},
      };
    case FlowNodeType.Approve:
      return {
        id: uniqueId(),
        nodeType: FlowNodeType.Approve,
        name: t("workflow.taskNode"),
        metadata: {
          approveMeta: {
            approveMode: ApproveMode.OrSign,
            approvalCandidates: [],
            enableCopyto: false,
            copytoCandidates: [],
          },
        },
      };
    case FlowNodeType.CopyTo:
      return {
        id: uniqueId(),
        nodeType: FlowNodeType.CopyTo,
        name: t("workflow.ccNode"),
        metadata: {
          copytoMeta: {
            approvalCandidates: [],
          },
        },
      };
    case FlowNodeType.QueryOne:
      return {
        id: uniqueId(),
        nodeType: FlowNodeType.QueryOne,
        name: t("workflow.queryOneNode"),
        metadata: {
          queryOneMeta: {
            formId: "",
            condition: { id: uniqueId(), rel: "and", items: [] },
            sort: { items: [] },
            singleResult: true,
          },
        },
      };
    case FlowNodeType.QueryMany:
      return {
        id: uniqueId(),
        nodeType: FlowNodeType.QueryMany,
        name: t("workflow.queryManyNode"),
        metadata: {
          queryManyMeta: {
            formId: "",
            condition: { id: uniqueId(), rel: "and", items: [] },
            sort: { items: [] },
            take: 200,
            singleResult: false,
          },
        },
      };
    case FlowNodeType.Insert:
      return {
        id: uniqueId(),
        nodeType: FlowNodeType.Insert,
        name: t("workflow.insertDataNode"),
        metadata: {
          insertMeta: {
            formId: "",
            formFieldList: { items: [] },
            singleResult: true,
          },
        },
      };
    case FlowNodeType.Update:
      return {
        id: uniqueId(),
        nodeType: FlowNodeType.Update,
        name: t("workflow.updateDataNode"),
        metadata: {
          updateMeta: {
            updateMode: UpdateMode.Form,
            formId: "",
            condition: { id: uniqueId(), rel: "and", items: [] },
            formFieldList: { items: [] },
            singleResult: false,
            insertIfNoData: false,
            insertFieldList: { items: [] },
          },
        },
      };
    case FlowNodeType.Delete:
      return {
        id: uniqueId(),
        nodeType: FlowNodeType.Delete,
        name: t("workflow.deleteDataNode"),
        metadata: {
          deleteMeta: {
            deleteMode: UpdateMode.Form,
            formId: "",
            condition: { id: uniqueId(), rel: "and", items: [] },
            singleResult: false,
          },
        },
      };
    case FlowNodeType.Print:
      return {
        id: uniqueId(),
        nodeType: FlowNodeType.Print,
        name: t("workflow.printNode"),
        metadata: { printMeta: { singleResult: true } },
      };
    case FlowNodeType.Plugin:
      return {
        id: uniqueId(),
        nodeType: FlowNodeType.Plugin,
        name: t("workflow.pluginNode"),
        metadata: { pluginMeta: { singleResult: true } },
      };
    default:
      return {
        id: uniqueId(),
        nodeType: nodeType,
        name: "未知类型节点",
        metadata: {},
      };
  }
}
export function cloneFlowNode(nodeData: IFlowNodeData): IFlowNodeData {
  const newNodeData = cloneDeep(nodeData);
  //更新所有的Node.Id
  updateFlowNodeId(newNodeData);

  return newNodeData;
}
function updateFlowNodeId(nodeData: IFlowNodeData) {
  nodeData.id = uniqueId();
  if (nodeData.conditionData) nodeData.conditionData.id = uniqueId();

  if (nodeData.childNodes && nodeData.childNodes.length > 0) {
    let prev: IFlowNodeData | undefined;
    let len = nodeData.childNodes.length;
    for (let i = 0; i < len; i++) {
      let curr = nodeData.childNodes[i];
      if (curr.childNodes && curr.childNodes.length > 0) {
        updateFlowNodeId(curr);
      } else {
        curr.id = uniqueId();
        if (curr.conditionData) curr.conditionData.id = uniqueId();
      }

      if (prev) {
        prev.nextId = curr.id;
        curr.prevId = prev?.id;
      }
      prev = curr;
    }
  }
}
export function getFlowNodeById(flowData: IFlowData, nodeId: string) {
  if (flowData.startNode.id == nodeId) return flowData.startNode;
  if (flowData.endNode.id == nodeId) return flowData.endNode;

  return findFlowNodeFromChild(flowData.nodes, nodeId);
}
function findFlowNodeFromChild(
  childNodes: IFlowNodeData[],
  nodeId: string
): IFlowNodeData | undefined {
  for (let i = 0; i < childNodes.length; i++) {
    let child = childNodes[i];
    if (child.id == nodeId) return child;
    if (child.conditionData && child.conditionData.id == nodeId)
      return child.conditionData;
    if (child.childNodes) {
      let subChild = findFlowNodeFromChild(child.childNodes, nodeId);
      if (subChild) return subChild;
    }
  }
  return undefined;
}

///////////////  工作流
export enum ApproveMode {
  None,
  OrSign,
  CounterSign,
  AutoSign,
}
export enum CandidateType {
  None,
  Department,
  Employee,
  Role,
  Dynamic,
}
export interface IFlowNodeMetaData {
  conditionMeta?: ConditionMeta;
  //WF
  approveMeta?: ApproveMeta;
  copytoMeta?: CopytoMeta;

  //DF
  triggerMeta?: TriggerMeta;
  insertMeta?: InsertMeta;
  updateMeta?: UpdateMeta;
  deleteMeta?: DeleteMeta;
  queryOneMeta?: QueryOneMeta;
  queryManyMeta?: QueryManyMeta;
  printMeta?: PrintMeta;
  pluginMeta?: PluginMeta;
}
export interface ConditionMeta {
  condition?: IConditionList;
}
export interface ApproveMeta {
  approveMode: ApproveMode;
  approvalCandidates: IApprovalCandidate[];
  enableCopyto?: boolean;
  copytoCandidates?: IApprovalCandidate[];
}
export interface CopytoMeta {
  approvalCandidates: IApprovalCandidate[];
}

export interface IApprovalCandidate {
  candidateType: CandidateType;
  candidateId: string;
  candidateName: string;
  cascadedDept?: boolean;
}

export function createWorkflowData(t: Translator): IFlowData {
  return {
    startNode: {
      id: uniqueId(),
      nodeType: FlowNodeType.Start,
      name: t("workflow.startNode"),
      metadata: {},
    },
    nodes: [],
    endNode: {
      id: uniqueId(),
      nodeType: FlowNodeType.End,
      name: t("workflow.endNode"),
      metadata: {},
    },
    eventSource: EventSourceType.None,
  };
}

////////////// 数据流
export interface TriggerMeta {
  eventType: EventType;
  formId: string;
  wfNodeId: string; //节点流转时节点ID
  nodeAction: string; //节点流转时节点操作，提交或退回
  condition: IConditionList;
  changeFields?: string[]; //数据修改时，哪些字段修改会触发
  singleResult: boolean;
}

export interface InsertMeta {
  formId: string;
  formFieldList: IFormFieldList;
  singleResult: boolean;
}
export interface UpdateMeta {
  updateMode: UpdateMode;
  nodeId?: string;
  formId: string;
  condition?: IConditionList;
  formFieldList: IFormFieldList;
  subCondition?: IConditionList;
  singleResult: boolean;
  insertIfNoData: boolean;
  insertFieldList: IFormFieldList;
}
export interface DeleteMeta {
  deleteMode: UpdateMode;
  nodeId?: string;
  formId: string;
  condition?: IConditionList;
  singleResult: boolean;
}
export interface QueryOneMeta {
  formId: string;
  condition: IConditionList;
  sort?: IFieldSortList;
  singleResult: boolean;
}
export interface QueryManyMeta {
  formId: string;
  condition: IConditionList;
  sort?: IFieldSortList;
  take: number;
  singleResult: boolean;
}
export interface PrintMeta {
  singleResult: boolean;
}
export interface PluginMeta {
  singleResult: boolean;
}

export enum EventType {
  None = 0,
  Submitted = 1,
  Modified = 2,
  Removed = 4,
  Approving = 8,
  Approved = 16,
  Rejected = 32,
}
export function createDataflowData(
  eventSource: EventSourceType,
  t: Translator
): IFlowData {
  return {
    dfCascade: CascadeMode.Never,
    eventSource: eventSource,
    startNode: {
      id: uniqueId(),
      nodeType: FlowNodeType.Start,
      name: t("workflow.triggerNode"),
      metadata: {
        triggerMeta: {
          eventType: EventType.None,
          formId: "",
          wfNodeId: "",
          nodeAction: "",
          condition: { id: uniqueId(), rel: "and", items: [] },
          singleResult: true,
        },
      },
    },
    nodes: [],
    endNode: {
      id: uniqueId(),
      nodeType: FlowNodeType.End,
      name: t("workflow.endNode"),
      metadata: {},
    },
  };
}
