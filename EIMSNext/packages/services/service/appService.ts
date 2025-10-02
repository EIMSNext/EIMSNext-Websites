import { ODataServiceBase } from "../interface";
import { App, AppRequest } from "@eimsnext/models";

export class AppService extends ODataServiceBase<App, AppRequest> {
    protected modelName(): string {
        return "App";
    }
}

const appService = new AppService()
export { appService }

