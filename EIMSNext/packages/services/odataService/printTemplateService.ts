import { ODataServiceBase } from "../interface";
import { PrintTemplate, PrintTemplateRequest } from "@eimsnext/models";

export class PrintTemplateService extends ODataServiceBase<PrintTemplate, PrintTemplateRequest> {
    protected modelName(): string {
        return "PrintTemplate";
    }
}

const printTemplateService = new PrintTemplateService()
export { printTemplateService }

