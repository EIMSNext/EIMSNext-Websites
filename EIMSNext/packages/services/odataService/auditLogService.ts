import { ReadonlyODataServiceBase } from "../interface";
import { AuditLog } from "@eimsnext/models";

export class AuditLogService extends ReadonlyODataServiceBase< AuditLog> {
    protected modelName(): string {
        return "AuditLog";
    }
}

const auditLogService = new AuditLogService()
export { auditLogService }

