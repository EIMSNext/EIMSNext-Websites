import { ODataServiceBase } from "../interface";
import { AppTemplate, AppTemplateRequest } from "@eimsnext/models";

export class AppTemplateService extends ODataServiceBase<AppTemplate, AppTemplateRequest> {
    protected modelName(): string {
        return "AppTemplate";
    }
}

const appTemplateService = new AppTemplateService()
export { appTemplateService }

