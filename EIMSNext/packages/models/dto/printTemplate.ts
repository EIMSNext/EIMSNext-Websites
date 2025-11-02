import { CorpModelBase, IdBase } from "./modelBase";

export interface PrintTemplateRequest extends IdBase {
  appId?: string;
  formId?: string;
  name?: string;
  content?: string;
  printType?: PrintTemplateType;
}

export interface PrintTemplate extends CorpModelBase {
  appId: string;
  formId: string;
  name: string;
  content?: string;
  printType: PrintTemplateType;
}

export enum PrintTemplateType {
  Pdf = "pdf",
}
