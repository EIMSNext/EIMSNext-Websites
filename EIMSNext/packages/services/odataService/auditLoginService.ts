import { ODataServiceBase } from "../interface";
import { AuditLogin } from "@eimsnext/models";

export class AuditLoginService extends ODataServiceBase<AuditLogin, AuditLogin> {
    protected modelName(): string {
        return "AuditLogin";
    }
}

const auditLoginService = new AuditLoginService()
export { auditLoginService }

