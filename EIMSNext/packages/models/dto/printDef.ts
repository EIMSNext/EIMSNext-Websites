import { CorpModelBase, IdBase } from "./modelBase";

export interface PrintDefRequest extends IdBase {
  appId?: string;
  formId?: string;
  name?: string;
  content?: string;
  printType?: PrintDefType;
}

export interface PrintDef extends CorpModelBase {
  appId: string;
  formId: string;
  name: string;
  content?: string;
  printType: PrintDefType;
}

export enum PrintDefType {
  Pdf = "pdf",
}
