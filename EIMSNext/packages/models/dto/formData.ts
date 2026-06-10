import { CorpModelBase, IdBase, Operator } from "./modelBase";

export interface FormDataRequest extends IdBase {
  action: DataAction;
  appId: string;
  formId: string;
  data: any;
}

export interface FormData extends CorpModelBase {
  appId: string;
  formId: string;
  data: any;
  dataTitle?: string;
  flowStatus: FlowStatus;
}

export interface FormDataChangeLog extends CorpModelBase {
  appId: string;
  formId: string;
  dataId: string;
  operator?: Operator;
  operateTime: number;
  content: DataChangeContent[];
}

export interface DataChangeContent {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  changeType: DataChangeType;
  oriVallue?: any;
  newVallue?: any;
}

export enum FlowStatus {
  None = 0,
  Draft = 1,
  Approving = 2,
  Approved = 3,
  Rejected = 4,
  Suspended = 5,
  Discarded = 6,
}

export enum DataAction {
  None = 0,
  Save = 1,
  Submit = 2,
  Approve = 3,
  Return = 4,
}

export enum DataChangeType {
  Added = 0,
  Modified = 1,
  Deleted = 2,
}
