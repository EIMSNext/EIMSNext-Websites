import { CorpModelBase, IdBase } from "./modelBase";

export interface WebPushLog extends CorpModelBase {
  formId?: string;
  webHookId?: string;
  triggerType?: string;
  url?: string;
  success: boolean;
  pushResult?: string;
  pushObject?: string;
}