import { ReadonlyODataServiceBase } from "../interface";
import { AuditLogin } from "@eimsnext/models";

export class AuditLoginService extends ReadonlyODataServiceBase<AuditLogin> {
    protected modelName(): string {
        return "AuditLogin";
    }
}

const auditLoginService = new AuditLoginService()
export { auditLoginService }

