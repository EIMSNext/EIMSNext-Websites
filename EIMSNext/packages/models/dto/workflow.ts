export interface StartRequest {
  dataId: string;
}
export interface ApproveRequest {
  dataId: string;
  action: ApproveAction;
  comment?: string;
  signature?: string;
}

export enum ApproveAction {
  None = "0",
  Approve = "1",
  Reject = "2",
  Return = "3",
  AddSignPre = "4",
  AddSignAfter = "5",
}
