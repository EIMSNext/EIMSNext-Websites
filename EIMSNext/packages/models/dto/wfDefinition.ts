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
}

export interface TransferSetting {
  candidates?: ApprovalCandidate[];
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
}

export interface ApproveSetting {
  approvalMode?: string | number;
  candidates?: ApprovalCandidate[];
  enableCopyto?: boolean;
  copytoCandidates?: ApprovalCandidate[];
  notifyChannels?: NotifyChannel;
  expireSetting?: ExpireSetting;
}

export interface WfNodeSetting {
  nodeType?: string | number;
  approveSetting?: ApproveSetting;
}
export enum FlowType {
  Workflow = "0",
  Dataflow = "1",
}
export enum EventSourceType {
  None = "0",
  Form = "1",
  Buttton = "2",
}
