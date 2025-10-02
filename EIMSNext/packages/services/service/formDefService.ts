import { ODataServiceBase } from "../interface";
import { FormDef, FormDefRequest } from "@eimsnext/models";

export class FormDefService extends ODataServiceBase<FormDef, FormDefRequest> {
    protected modelName(): string {
        return "FormDef";
    }
}

const formDefService = new FormDefService()
export { formDefService }

