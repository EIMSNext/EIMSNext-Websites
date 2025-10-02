import { CorpModelBase, IdBase } from "./modelBase";

export interface FormDataRequest extends IdBase {
  appId: string;
  formId: string;
  data: any;
}

export interface FormData extends CorpModelBase {
  appId: string;
  formId: string;
  data: any;
  flowStatus: FlowStatus;
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
