import { CorpModelBase, IdBase } from "./modelBase";

export interface FieldAliasItem {
  field: string;
  alias: string;
  children?: FieldAliasItem[] | null;
}

export interface WebhookAliasRequest extends IdBase {
  appId?: string;
  formId?: string;
  fieldAlias?: FieldAliasItem[];
}

export interface WebhookAlias extends CorpModelBase {
  appId: string;
  formId: string;
  fieldAlias?: FieldAliasItem[];
}
