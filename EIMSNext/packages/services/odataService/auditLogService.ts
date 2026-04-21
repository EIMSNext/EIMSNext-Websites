import { ReadonlyODataServiceBase } from "../interface";
import { AuditLog, AuditLogExportRequest, ExportResponse } from "@eimsnext/models";

export class AuditLogService extends ReadonlyODataServiceBase< AuditLog> {
    protected modelName(): string {
        return "AuditLog";
    }

    export(data: AuditLogExportRequest): Promise<ExportResponse> {
        return this.http().api.post<ExportResponse>(`/AuditLog/Export`, data);
    }
}

const auditLogService = new AuditLogService()
export { auditLogService }

