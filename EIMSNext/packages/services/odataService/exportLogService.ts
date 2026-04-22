import { ExportLog } from "@eimsnext/models";
import { ReadonlyODataServiceBase } from "../interface";

export class ExportLogService extends ReadonlyODataServiceBase<ExportLog> {
  protected modelName(): string {
    return "ExportLog";
  }
}

const exportLogService = new ExportLogService();
export { exportLogService };
