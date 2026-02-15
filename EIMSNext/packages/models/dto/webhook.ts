import { CorpModelBase, IdBase } from "./modelBase";

export interface WebhookRequest extends IdBase {
  appId?: string;
  formId?: string;
  url?: string;
  secret?: string;
  triggers?: WebHookTrigger;
  disabled: boolean;
}

export interface Webhook extends CorpModelBase {
  appId: string;
  formId: string;
  url: string;
  secret: string;
  triggers?: WebHookTrigger;
  disabled: boolean;
}

export enum WebHookTrigger {
  NotSet = 0,
  Data_Created = 1 << 0,
  Data_Updated = 1 << 1,
  Data_Removed = 1 << 2,
  WfStatus_Updated = 1 << 3,
  WfTodo_Updated = 1 << 4,
}
