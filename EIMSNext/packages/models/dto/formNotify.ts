import { CorpModelBase, IdBase } from "./modelBase";

export interface FormNotifyRequest extends IdBase {
  appId?: string;
  formId?: string;
  triggerMode?: FormNotifyTriggerMode;
  timeField?: string;
  startTime?: number;
  endTime?: number;
  repeatType?: FormNotifyRepeatType;
  repeatConfig?: string;
  nextTriggerTime?: number;
  lastTriggerTime?: number;
  scheduleVersion?: number;
  changeFields?: string[];
  dataFilter?: string;
  notifyText?: string;
  notifiers?: string;
  channels?: NotifyChannel;
  disabled: boolean;
}

export interface FormNotify extends CorpModelBase {
  appId: string;
  formId: string;
  triggerMode: FormNotifyTriggerMode;
  timeField?: string;
  startTime?: number;
  endTime?: number;
  repeatType?: FormNotifyRepeatType;
  repeatConfig?: string;
  nextTriggerTime?: number;
  lastTriggerTime?: number;
  scheduleVersion?: number;
  changeFields?: string[];
  dataFilter?: string;
  notifyText?: string;
  notifiers?: string;
  channels: NotifyChannel;
  disabled: boolean;
}

export enum FormNotifyTriggerMode {
  DataAdded = "0",
  DataChanged = "1",
  CustomScheduled = "2",
  TimeFieldScheduled = "3",
}

export enum FormNotifyRepeatType {
  Once = "0",
  Daily = "1",
  Weekly = "2",
  BiWeekly = "3",
  Monthly = "4",
  Yearly = "5",
  Custom = "6",
}
export enum NotifyChannel {
  None = 0,
  System = 1,
  Email = 2,
}
