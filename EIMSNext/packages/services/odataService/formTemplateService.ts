import { ODataServiceBase } from "../interface";
import { FormTemplate, FormTemplateRequest } from "@eimsnext/models";

export class FormTemplateService extends ODataServiceBase<FormTemplate, FormTemplateRequest> {
    protected modelName(): string {
        return "FormTemplate";
    }
}

const formTemplateService = new FormTemplateService()
export { formTemplateService }

