import { CorpModelBase, IdBase } from "./modelBase";

export interface FormNotifyRequest extends IdBase {
  appId?: string;
  formId?: string;
  triggerMode?: FormNotifyTriggerMode;
  changeFields?: string[];
  dataFilter?: string;
  notifyText?: string;
  notifiers?: string;
  channels?: FormNotifyChannel;
  disabled: boolean;
}

export interface FormNotify extends CorpModelBase {
  appId: string;
  formId: string;
  triggerMode: FormNotifyTriggerMode;
  changeFields?: string[];
  dataFilter?: string;
  notifyText?: string;
  notifiers?: string;
  channels: FormNotifyChannel;
  disabled: boolean;
}

export enum FormNotifyTriggerMode {
  DataAdded = "0",
  DataChanged = "1",
  CustomScheduled = "2",
  TimeFieldScheduled = "3",
}
export enum FormNotifyChannel {
  None = 0,
  System = 1,
  Email = 2,
}
