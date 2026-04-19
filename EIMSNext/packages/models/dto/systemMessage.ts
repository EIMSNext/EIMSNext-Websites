import { CorpModelBase } from "./modelBase";
import { NotifyChannel } from "./formNotify";

export interface SystemMessage extends CorpModelBase {
  notifyId?: string;
  title?: string;
  detail?: string;
  url?: string;
  receiverEmpId?: string;
  receiverName?: string;
  isRead?: boolean;
  readTime?: number;
  expireTime: number;
  channel?: NotifyChannel;
  category?: MessageCategory;
  messageType?: MessageType;
}

export interface SystemMessageReadRequest {
  id: string;
}

export interface DeleteBatch {
  keys?: string[];
}

export enum MessageCategory {
  DataNotify = "0",
  AppNotify = "1",
  SystemNotify = "2",
  SystemNotice = "3",
  FlowNotify = "4",
}

export enum MessageType {
  FormNotify = "0",
  WfTodoNotify = "1",
  WfExpireNotify = "2",
  ExportNotify = "3",
}
