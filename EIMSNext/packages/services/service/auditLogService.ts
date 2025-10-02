import { ODataServiceBase } from "../interface";
import { AuditLog } from "@eimsnext/models";

export class AuditLogService extends ODataServiceBase<AuditLog, AuditLog> {
    protected modelName(): string {
        return "AuditLog";
    }
}

const auditLogService = new AuditLogService()
export { auditLogService }

