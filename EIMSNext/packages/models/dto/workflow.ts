export interface StartRequest {
  dataId: string;
}
export interface ApproveRequest {
  wfInstanceId?: string;
  wfNodeId?: string;
  dataId: string;
  action: ApproveAction;
  comment?: string;
  signature?: string;
  targetNodeId?: string;
  targetEmployeeId?: string;
}

export interface ReturnRequest {
  wfInstanceId?: string;
  wfNodeId?: string;
  dataId: string;
  targetNodeId: string;
  comment?: string;
}

export interface TransferRequest {
  wfInstanceId?: string;
  wfNodeId?: string;
  dataId: string;
  targetEmployeeId: string;
  comment?: string;
}

export interface AddSignRequest {
  wfInstanceId?: string;
  wfNodeId?: string;
  dataId: string;
  targetEmployeeId: string;
  comment?: string;
}

export interface ReturnTargetNode {
  nodeId: string;
  nodeName: string;
  round: number;
}

export interface WithdrawRequest {
  wfInstanceId?: string;
  dataId: string;
  comment?: string;
}

export interface UrgeRequest {
  wfInstanceId?: string;
  dataId: string;
}

export interface WorkflowActionStatus {
  canWithdraw: boolean;
  canUrge: boolean;
}

export enum WorkflowAutoProcessRule {
  Disabled = "0",
  FirstNodeOnly = "1",
  ContinuousApproval = "2",
}

export enum WorkflowWithdrawRule {
  Disabled = "0",
  StarterOnly = "1",
  AllNodes = "2",
}

export enum ApproveAction {
  None = "0",
  Approve = "1",
  Reject = "2",
  Return = "3",
  AddSignPre = "4",
  AddSignAfter = "5",
  AutoApprove = "6",
  CopyTo = "7",
  Withdraw = "8",
  Transfer = "9",
}
