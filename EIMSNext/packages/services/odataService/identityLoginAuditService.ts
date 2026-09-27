import { ReadonlyODataServiceBase } from "../interface";
import { IdentityLoginAudit, IdentityLoginAuditExportRequest, ExportResponse } from "@eimsnext/models";

export class IdentityLoginAuditService extends ReadonlyODataServiceBase<IdentityLoginAudit> {
    protected modelName(): string {
        return "IdentityLoginAudit";
    }

    export(data: IdentityLoginAuditExportRequest): Promise<ExportResponse> {
        return this.http().api.post<ExportResponse>(`/IdentityLoginAudit/Export`, data);
    }
}

const identityLoginAuditService = new IdentityLoginAuditService()
export { identityLoginAuditService }

