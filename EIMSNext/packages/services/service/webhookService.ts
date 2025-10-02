import { ODataServiceBase } from "../interface";
import { Webhook, WebhookRequest } from "@eimsnext/models";

export class WebhookService extends ODataServiceBase<Webhook, WebhookRequest> {
    protected modelName(): string {
        return "Webhook";
    }
}

const webhookService = new WebhookService()
export { webhookService }

