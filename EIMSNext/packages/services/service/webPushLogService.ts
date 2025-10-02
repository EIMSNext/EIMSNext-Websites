import { ODataServiceBase } from "../interface";
import { WebPushLog, WebPushLogRequest } from "@eimsnext/models";

export class WebPushLogService extends ODataServiceBase<WebPushLog, WebPushLogRequest> {
    protected modelName(): string {
        return "WebPushLog";
    }
}

const webPushLogService = new WebPushLogService()
export { webPushLogService }

