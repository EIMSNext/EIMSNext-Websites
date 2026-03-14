import { ODataServiceBase } from "../interface";
import { Corporate, CorporateRequest } from "@eimsnext/models";

export class CorporateService extends ODataServiceBase<Corporate, CorporateRequest> {
    protected modelName(): string {
        return "Corporate";
    }
}

const corporateService = new CorporateService()
export { corporateService }

