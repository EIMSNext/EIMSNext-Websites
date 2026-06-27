import { cloneDeep } from "lodash-es";
import { uniqueId } from "@eimsnext/utils";
import {
  FlowType,
  EventSourceType,
  TimerOffsetDirection,
  TimerOffsetUnit,
  TimerRepeatType,
  NotifyChannel,
  WorkflowAutoProcessRule,
  WorkflowWithdrawRule,
  DataflowTriggerKind,
  DataflowScheduleSourceType,
  DataflowHttpSampleField,
  DataflowHttpTriggerSetting,
  DataflowTimeTriggerSetting,
  FieldType,
  WfNoApproverActionType,
} from "@eimsnext/models";
import { ConditionValueType, IConditionList } from "@/ConditionList/type";
import { FieldValueType, IFormFieldList, IFormFieldValue, IFormulaValue } from "@/FormFieldList/type";
import { IFieldSortList } from "@/FieldSortList/type";
import { Translator } from "element-plus";
import { IFormFieldDef } from "@/FieldSelect/type";

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
  workflowMeta?: WorkflowMeta;
  eventSource?: EventSourceType;
  dfCascade?: CascadeMode;
  eventIds?: string[];
}

export interface WorkflowMeta {
  description?: string;
  allowUrge?: boolean;
  notifyChannels?: NotifyChannel;
  autoProcessRule?: WorkflowAutoProcessRule;
  withdrawRule?: WorkflowWithdrawRule;
}

export interface IFlowContext {
  definitionId?: string;
  appId: string;
  formId: string;
  flowType: FlowType;
  clonedData: IFlowNodeData;
  draggingData?: IFlowNodeDragData;
  activeData: IFlowNodeData;
  eventSource?: EventSourceType;
  sourceId?: string;
  flowData: IFlowData;
  structureReadonly?: boolean;
  logState?: IFlowLogState;
}
export interface IFlowLogState {
  executedNodeIds: Set<string>;
  failedNodeIds: Set<string>;
  isNodeExecuted?: (nodeData: IFlowNodeData) => boolean;
  isLineExecuted?: (nodeData: IFlowNodeData, branchItemData?: IFlowNodeData) => boolean;
  isBranchExecuted?: (branchItemData: IFlowNodeData) => boolean;
  isNodeFailed?: (nodeData: IFlowNodeData) => boolean;
  isLineFailed?: (nodeData: IFlowNodeData, branchItemData?: IFlowNodeData) => boolean;
  isBranchFailed?: (branchItemData: IFlowNodeData) => boolean;
  onNodeClick?: (nodeData: IFlowNodeData) => void;
}
export interface IFlowNodeDragData {
  nodeData: IFlowNodeData;
  pNodeDatas: IFlowNodeData[];
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
            approverType: ApproverType.Normal,
            approvalCandidates: [],
            byLevelApprovalSetting: {
              terminal: ByLevelApprovalTerminal.StarterDepartment,
              startLevel: 1,
              endLevel: 1,
            },
            enableCopyto: false,
            submitCondition: {
              enabled: false,
              promptText: "",
            },
            noApproverSetting: {
              actionType: WfNoApproverActionType.StopAndReport,
              candidates: [],
            },
            nodeActions: [
              { actionType: NodeActionType.Submit, enabled: true, text: t("common.wfProcess.submit") },
              { actionType: NodeActionType.Return, enabled: false, text: t("workflow.nodeActionReturn") },
              { actionType: NodeActionType.Reject, enabled: false, text: t("common.wfProcess.reject") },
              { actionType: NodeActionType.Draft, enabled: false, text: t("common.wfProcess.saveDraft") },
              { actionType: NodeActionType.AddSign, enabled: false, text: t("workflow.nodeActionAddSign"), candidates: [] },
              { actionType: NodeActionType.Transfer, enabled: false, text: t("workflow.nodeActionTransfer"), candidates: [] },
            ],
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
        metadata: {
          pluginMeta: {
            singleResult: true,
            pluginId: "",
            functionId: "",
            fieldSettings: [],
            resultFields: [],
          },
        },
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

export function syncFlowNodeOrder(
  flowData: IFlowData,
  pNodeDatas: IFlowNodeData[]
) {
  const anchor = getFlowNodeListAnchor(flowData, pNodeDatas);

  if (anchor) {
    anchor.nextId = pNodeDatas[0]?.id;
  }

  pNodeDatas.forEach((node, index) => {
    node.prevId = index === 0 ? anchor?.id : pNodeDatas[index - 1]?.id;
    node.nextId = pNodeDatas[index + 1]?.id;
  });
}

export function moveFlowNode(
  flowData: IFlowData,
  nodeData: IFlowNodeData,
  fromNodeDatas: IFlowNodeData[],
  toNodeDatas: IFlowNodeData[],
  toNodeData: IFlowNodeData,
  position: "before" | "after"
) {
  const fromIndex = fromNodeDatas.indexOf(nodeData);
  const toIndex = toNodeDatas.indexOf(toNodeData);
  const dropToListStart =
    toIndex < 0 &&
    (toNodeData.nodeType === FlowNodeType.Start ||
      toNodeData.nodeType === FlowNodeType.Condition ||
      toNodeData.nodeType === FlowNodeType.ConditionOther);
  if (fromIndex < 0 || (toIndex < 0 && !dropToListStart) || nodeData === toNodeData) return false;
  if (isNodeListInsideNode(nodeData, toNodeDatas)) return false;

  let insertIndex = dropToListStart ? 0 : position === "after" ? toIndex + 1 : toIndex;
  fromNodeDatas.splice(fromIndex, 1);
  if (fromNodeDatas === toNodeDatas && fromIndex < insertIndex) insertIndex -= 1;
  toNodeDatas.splice(insertIndex, 0, nodeData);

  syncFlowNodeOrder(flowData, fromNodeDatas);
  if (fromNodeDatas !== toNodeDatas) {
    syncFlowNodeOrder(flowData, toNodeDatas);
  }

  return true;
}

function isNodeListInsideNode(
  nodeData: IFlowNodeData,
  nodeDatas: IFlowNodeData[]
): boolean {
  if (nodeData.childNodes === nodeDatas) return true;

  return nodeData.childNodes?.some((child) => isNodeListInsideNode(child, nodeDatas)) ?? false;
}

export function cleanupInvalidDataflowDependencies(flowData: IFlowData) {
  const nodes = collectFlowNodes(flowData);

  nodes.forEach((node) => {
    const validNodeIds = getPrevNodeIdSet(flowData, node);
    cleanupNodeDependencies(node, validNodeIds);
  });
}

function collectFlowNodes(flowData: IFlowData) {
  const nodes: IFlowNodeData[] = [flowData.startNode];

  collectFlowNodesFromChild(flowData.nodes, nodes);
  return nodes;
}

function collectFlowNodesFromChild(
  childNodes: IFlowNodeData[] | undefined,
  nodes: IFlowNodeData[]
) {
  childNodes?.forEach((node) => {
    nodes.push(node);
    if (node.conditionData) nodes.push(node.conditionData);
    collectFlowNodesFromChild(node.childNodes, nodes);
  });
}

function getPrevNodeIdSet(flowData: IFlowData, flowNode: IFlowNodeData) {
  const nodeIds = new Set<string>();
  let prevNode = getPrevNodeByLink(flowData, flowNode);

  while (prevNode) {
    nodeIds.add(prevNode.id);
    prevNode = getPrevNodeByLink(flowData, prevNode);
  }

  return nodeIds;
}

function getPrevNodeByLink(
  flowData: IFlowData,
  flowNode: IFlowNodeData
): IFlowNodeData | undefined {
  if (flowNode.nodeType === FlowNodeType.Start) return undefined;
  return flowNode.prevId ? getFlowNodeById(flowData, flowNode.prevId) : undefined;
}

function cleanupNodeDependencies(
  node: IFlowNodeData,
  validNodeIds: Set<string>
) {
  const metadata = node.metadata;

  cleanupConditionDependencies(metadata.conditionMeta?.condition, validNodeIds, true);
  cleanupConditionDependencies(metadata.triggerMeta?.condition, validNodeIds, false);
  cleanupConditionDependencies(metadata.queryOneMeta?.condition, validNodeIds, false);
  cleanupConditionDependencies(metadata.queryManyMeta?.condition, validNodeIds, false);
  cleanupConditionDependencies(metadata.updateMeta?.condition, validNodeIds, false);
  cleanupConditionDependencies(metadata.updateMeta?.subCondition, validNodeIds, false);
  cleanupConditionDependencies(metadata.deleteMeta?.condition, validNodeIds, false);

  if (metadata.updateMeta?.updateMode === UpdateMode.Node && !isValidDependency(metadata.updateMeta.nodeId, validNodeIds)) {
    metadata.updateMeta.nodeId = undefined;
    metadata.updateMeta.formId = "";
    metadata.updateMeta.condition = { id: uniqueId(), rel: "and", items: [] };
    metadata.updateMeta.subCondition = undefined;
    metadata.updateMeta.formFieldList = { items: [] };
    metadata.updateMeta.insertFieldList = { items: [] };
  }

  if (metadata.deleteMeta?.deleteMode === UpdateMode.Node && !isValidDependency(metadata.deleteMeta.nodeId, validNodeIds)) {
    metadata.deleteMeta.nodeId = undefined;
    metadata.deleteMeta.formId = "";
    metadata.deleteMeta.condition = { id: uniqueId(), rel: "and", items: [] };
  }

  cleanupFormFieldListDependencies(metadata.insertMeta?.formFieldList, validNodeIds);
  cleanupFormFieldListDependencies(metadata.updateMeta?.formFieldList, validNodeIds);
  cleanupFormFieldListDependencies(metadata.updateMeta?.insertFieldList, validNodeIds);
  cleanupPluginDependencies(metadata.pluginMeta?.fieldSettings, validNodeIds);
}

function cleanupFormFieldListDependencies(
  fieldList: IFormFieldList | undefined,
  validNodeIds: Set<string>
) {
  fieldList?.items.forEach((item) => {
    if (cleanupFieldValueDependencies(item.value, validNodeIds)) {
      item.value = { type: FieldValueType.Empty };
    }
  });
}

function cleanupFieldValueDependencies(
  value: IFormFieldValue,
  validNodeIds: Set<string>
) {
  if (
    value.type === FieldValueType.Field &&
    value.fieldValue &&
    !isValidDependency(value.fieldValue.nodeId, validNodeIds)
  ) {
    return true;
  }

  if (value.type === FieldValueType.Formula && value.formulaValue) {
    const hasInvalidRef = value.formulaValue.refs.some(
      (ref) => !isValidDependency(ref.field.nodeId, validNodeIds)
    );
    const hasInvalidDrivingField =
      value.formulaValue.drivingField &&
      !isValidDependency(value.formulaValue.drivingField.nodeId, validNodeIds);
    return hasInvalidRef || hasInvalidDrivingField;
  }

  return false;
}

function cleanupConditionDependencies(
  condition: IConditionList | undefined,
  validNodeIds: Set<string>,
  clearConditionField: boolean
) {
  if (!condition) return;

  if (condition.items?.length) {
    condition.items.forEach((item) =>
      cleanupConditionDependencies(item, validNodeIds, clearConditionField)
    );
    return;
  }

  if (clearConditionField && !isValidDependency(condition.field?.nodeId, validNodeIds)) {
    condition.field = createEmptyFormFieldDef();
    condition.op = "empty";
    condition.value = { type: ConditionValueType.Custom, value: null };
    return;
  }

  if (
    condition.value?.type === ConditionValueType.Field &&
    condition.value.fieldValue &&
    !isValidDependency(condition.value.fieldValue.nodeId, validNodeIds)
  ) {
    condition.value = { type: ConditionValueType.Custom, value: null };
  }
}

function cleanupPluginDependencies(
  fieldSettings: PluginFieldSetting[] | undefined,
  validNodeIds: Set<string>
) {
  fieldSettings?.forEach((setting) => {
    if (
      setting.value.fieldValue &&
      !isValidDependency(setting.value.fieldValue.nodeId, validNodeIds)
    ) {
      delete setting.value.fieldValue;
      setting.value.type = "Empty";
      delete setting.value.value;
    }
  });
}

function isValidDependency(
  nodeId: string | undefined,
  validNodeIds: Set<string>
) {
  return !nodeId || validNodeIds.has(nodeId);
}

function createEmptyFormFieldDef(): IFormFieldDef {
  return {
    nodeId: "",
    formId: "",
    field: "",
    label: "",
    type: FieldType.None,
  };
}

function getFlowNodeListAnchor(
  flowData: IFlowData,
  pNodeDatas: IFlowNodeData[]
): IFlowNodeData | undefined {
  if (flowData.nodes === pNodeDatas) return flowData.startNode;

  return findFlowNodeListAnchorFromChild(flowData.nodes, pNodeDatas);
}

function findFlowNodeListAnchorFromChild(
  childNodes: IFlowNodeData[],
  pNodeDatas: IFlowNodeData[]
): IFlowNodeData | undefined {
  for (let i = 0; i < childNodes.length; i++) {
    const child = childNodes[i];
    if (child.nodeType === FlowNodeType.BranchItem && child.childNodes === pNodeDatas) {
      return child.conditionData ?? child;
    }

    if (child.childNodes) {
      const anchor = findFlowNodeListAnchorFromChild(child.childNodes, pNodeDatas);
      if (anchor) return anchor;
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
export enum ApproverType {
  Normal = 0,
  ByLevel = 1,
}
export enum ByLevelApprovalTerminal {
  StarterDepartment = 0,
  Organization = 1,
}
export interface IByLevelApprovalSetting {
  terminal?: ByLevelApprovalTerminal;
  startLevel?: number;
  endLevel?: number;
}
export enum CandidateType {
  Unknown,
  Department,
  Employee,
  Role,
  Dynamic,
  FormField,
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
  approverType?: ApproverType;
  approvalCandidates: IApprovalCandidate[];
  byLevelApprovalSetting?: IByLevelApprovalSetting;
  enableCopyto?: boolean;
  copytoCandidates?: IApprovalCandidate[];
  nodeActions?: INodeActionConfig[];
  notifyChannels?: NotifyChannel;
  expireSetting?: IExpireSetting;
  submitCondition?: ISubmitConditionSetting;
  noApproverSetting?: INoApproverSetting;
}

export enum NodeActionType {
  Submit = "submit",
  Return = "return",
  Reject = "reject",
  Draft = "draft",
  AddSign = "addSign",
  Transfer = "transfer",
}

export interface INodeActionConfig {
  actionType: NodeActionType;
  enabled?: boolean;
  text?: string;
  candidates?: IApprovalCandidate[];
}

export interface ISubmitConditionSetting {
  enabled?: boolean;
  formulaValue?: IFormulaValue;
  promptText?: string;
}

export interface INoApproverSetting {
  actionType?: WfNoApproverActionType;
  candidates?: IApprovalCandidate[];
}

export interface CopytoMeta {
  approvalCandidates: IApprovalCandidate[];
}

export interface IApprovalCandidate {
  candidateType: CandidateType;
  candidateId: string;
  candidateName: string;
  cascadedDept?: boolean;
  managerLevels?: number[];
}

export enum WfExpireActionType {
  AutoNotify = 0,
  AutoApprove = 1,
  AutoTransfer = 2,
  AutoReject = 3,
  AutoReturn = 4,
}

export enum TimeUnit {
  Minute = 0,
  Hour = 1,
  Day = 2,
}

export interface INotifySetting {
  channels?: NotifyChannel;
  candidates?: IApprovalCandidate[];
}

export interface ITransferSetting {
  candidates?: IApprovalCandidate[];
}

export enum ReturnTargetMode {
  Previous = 0,
  Start = 1,
  Specified = 2,
}

export interface IReturnSetting {
  targetMode?: ReturnTargetMode;
  targetNodeId?: string;
}

export interface IExpireSetting {
  actionType?: WfExpireActionType;
  timeValue?: number;
  timeUnit?: TimeUnit;
  notifySetting?: INotifySetting;
  transferSetting?: ITransferSetting;
  returnSetting?: IReturnSetting;
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
    workflowMeta: {
      description: "",
      allowUrge: false,
      notifyChannels: NotifyChannel.None,
      autoProcessRule: WorkflowAutoProcessRule.Disabled,
      withdrawRule: WorkflowWithdrawRule.Disabled,
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
  triggerKind?: DataflowTriggerKind;
  timeSettings?: DataflowTimeTriggerSetting;
  httpSettings?: DataflowHttpTriggerSetting;
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
  pluginId: string;
  pluginName?: string;
  pluginVersion?: string;
  functionId: string;
  functionName?: string;
  fieldSettings: PluginFieldSetting[];
  resultFields: PluginResultFieldSetting[];
}

export interface PluginFieldSetting {
  fieldKey: string;
  fieldName?: string;
  fieldType: string;
  value: {
    type: string;
    value?: any;
    fieldValue?: IFormFieldDef;
  };
}

export interface PluginResultFieldSetting {
  fieldKey: string;
  fieldName: string;
  fieldType: string;
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
  const triggerKind = eventSource === EventSourceType.Http
    ? DataflowTriggerKind.Http
    : eventSource === EventSourceType.Schedule
      ? DataflowTriggerKind.Schedule
      : DataflowTriggerKind.Form;
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
          triggerKind,
          timeSettings: {
            sourceType: DataflowScheduleSourceType.Custom,
            repeatType: TimerRepeatType.Once,
            fixedTime: "09:00",
            offsetValue: 1,
            offsetUnit: TimerOffsetUnit.Minute,
            direction: TimerOffsetDirection.At,
          },
          httpSettings: {
            allowedIps: [],
            responseEnabled: false,
            responseStatusCode: 200,
            responseContentType: "application/json",
            responseBody: "",
            sampleFields: [],
          },
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
