import { PrintDefType } from "@eimsnext/models";

export interface PrintRequest {
  dataIds: string[];
  printId: string;
}

export interface PrintPreviewRequest {
  content: string;
  printType: PrintDefType;
}
