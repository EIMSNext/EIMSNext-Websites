import { NotifyChannel } from "./formNotify";
import { CorpModelBase, IdBase } from "./modelBase";

export interface WfDefinitionRequest extends IdBase {
  appId?: string;
  name?: string;
  flowType?: FlowType;
  externalId?: string;
  description?: string;
  content?: string;
  eventSource?: EventSourceType;
  sourceId?: string;
  disabled?: boolean;
}

export interface WfDefinition extends CorpModelBase {
  appId: string;
  name: string;
  flowType: FlowType;
  externalId: string;
  description?: string;
  version: number;
  isCurrent: boolean;
  released: boolean;
  content: string;
  eventSource: EventSourceType;
  sourceId?: string;
  disabled?: boolean;
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

export interface ApprovalCandidate {
  candidateType: number;
  candidateId: string;
  candidateName?: string;
  cascadedDept?: boolean;
  managerLevels?: number[];
}

export interface TransferSetting {
  candidates?: ApprovalCandidate[];
}

export enum ReturnTargetMode {
  Previous = 0,
  Start = 1,
  Specified = 2,
}

export interface ReturnSetting {
  targetMode?: ReturnTargetMode;
  targetNodeId?: string;
}

export interface NotifySetting {
  channels?: NotifyChannel;
  candidates?: ApprovalCandidate[];
}

export interface ExpireSetting {
  actionType?: WfExpireActionType;
  timeValue?: number;
  timeUnit?: TimeUnit;
  notifySetting?: NotifySetting;
  transferSetting?: TransferSetting;
  returnSetting?: ReturnSetting;
}

export enum WfNoApproverActionType {
  StopAndReport = 0,
  TransferToMember = 1,
  AutoSubmit = 2,
}

export interface FormulaRef {
  key: string;
  field: unknown;
}

export interface FormulaValue {
  expression: string;
  refs: FormulaRef[];
  drivingField?: unknown;
}

export interface SubmitConditionSetting {
  enabled?: boolean;
  formulaValue?: FormulaValue;
  promptText?: string;
}

export interface NoApproverSetting {
  actionType?: WfNoApproverActionType;
  candidates?: ApprovalCandidate[];
}

export enum NodeActionType {
  Submit = "submit",
  Return = "return",
  Reject = "reject",
  Draft = "draft",
  AddSign = "addSign",
  Transfer = "transfer",
}

export interface NodeActionConfig {
  actionType: NodeActionType;
  enabled?: boolean;
  text?: string;
  candidates?: ApprovalCandidate[];
}

export type WorkflowNodeActionType = "submit" | "return" | "reject" | "draft" | "addsign" | "transfer";

export interface WorkflowNodeAction {
  actionType: WorkflowNodeActionType;
  enabled?: boolean;
  text?: string;
  candidates?: ApprovalCandidate[];
}

export enum ApproverType {
  Normal = 0,
  ByLevel = 1,
}

export enum ByLevelApprovalTerminal {
  StarterDepartment = 0,
  Organization = 1,
}

export interface ByLevelApprovalSetting {
  terminal?: ByLevelApprovalTerminal;
  startLevel?: number;
  endLevel?: number;
}

export interface ApproveSetting {
  approverType?: ApproverType;
  approvalMode?: string | number;
  candidates?: ApprovalCandidate[];
  byLevelApprovalSetting?: ByLevelApprovalSetting;
  enableCopyto?: boolean;
  copytoCandidates?: ApprovalCandidate[];
  nodeActions?: NodeActionConfig[];
  notifyChannels?: NotifyChannel;
  expireSetting?: ExpireSetting;
  submitCondition?: SubmitConditionSetting;
  noApproverSetting?: NoApproverSetting;
}

export interface WfNodeSetting {
  nodeType?: string | number;
  approveSetting?: ApproveSetting;
}
export enum FlowType {
  Workflow = "0",
  EventFlow = "1",
}
export enum EventSourceType {
  None = "0",
  Form = "1",
  Button = "2",
  Schedule = "3",
  Http = "4",
}
