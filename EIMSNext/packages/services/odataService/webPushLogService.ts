import { ReadonlyODataServiceBase } from "../interface";
import { WebPushLog } from "@eimsnext/models";

export class WebPushLogService extends ReadonlyODataServiceBase<WebPushLog> {
    protected modelName(): string {
        return "WebPushLog";
    }
}

const webPushLogService = new WebPushLogService()
export { webPushLogService }

