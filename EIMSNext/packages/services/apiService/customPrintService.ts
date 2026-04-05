import { PrintRequest } from "@/requestModel";
import { ServiceBase } from "../interface";

export class CustomPrintService extends ServiceBase {
  print(req: any): Promise<any> {
    return this.http().api.post<any>(`/customprint/print`, req);
  }
}

const customPrintService = new CustomPrintService();
export { customPrintService };
