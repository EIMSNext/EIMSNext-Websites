import { PrintTemplateType } from "@eimsnext/models";

export interface PrintRequest {
  dataIds: string[];
  templateId: string;
}

export interface PrintPreviewRequest {
  content: string;
  printType: PrintTemplateType;
}
