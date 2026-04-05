import { PrintPreviewRequest, PrintRequest } from "@/requestModel";
import { ServiceBase } from "../interface";

export class CustomPrintService extends ServiceBase {
  print(req: PrintRequest): Promise<any> {
    return this.http().api.post<any>(`/customprint/print`, req);
  }
  preview(req: PrintPreviewRequest): Promise<any> {
    return this.http().api.post<any>(`/customprint/preview`, req);
  }
}

const customPrintService = new CustomPrintService();
export { customPrintService };
