import { CorpModelBase, IdBase } from "./modelBase";

export interface CrossBindingRequest extends IdBase {
  targetAppId?: string;
  sourceAppId?: string;
  sourceFormId?: string;
}

export interface CrossBinding extends CorpModelBase {
  targetAppId: string;
  sourceAppId: string;
  sourceFormId: string;
}
