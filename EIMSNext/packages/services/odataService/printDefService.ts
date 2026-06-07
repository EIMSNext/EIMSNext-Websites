import { ODataServiceBase } from "../interface";
import { PrintDef, PrintDefRequest } from "@eimsnext/models";

export class PrintDefService extends ODataServiceBase<PrintDef, PrintDefRequest> {
    protected modelName(): string {
        return "PrintDef";
    }
}

const printDefService = new PrintDefService()
export { printDefService }
