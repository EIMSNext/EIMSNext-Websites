import { ReadonlyODataServiceBase } from "../interface";
import { AuditLogin, AuditLoginExportRequest, ExportResponse } from "@eimsnext/models";

export class AuditLoginService extends ReadonlyODataServiceBase<AuditLogin> {
    protected modelName(): string {
        return "AuditLogin";
    }

    export(data: AuditLoginExportRequest): Promise<ExportResponse> {
        return this.http().api.post<ExportResponse>(`/AuditLogin/Export`, data);
    }
}

const auditLoginService = new AuditLoginService()
export { auditLoginService }

