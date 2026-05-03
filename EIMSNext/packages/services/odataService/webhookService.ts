import { ODataServiceBase } from "../interface";
import { Webhook, WebhookRequest } from "@eimsnext/models";

export class WebhookService extends ODataServiceBase<Webhook, WebhookRequest> {
    protected modelName(): string {
        return "Webhook";
    }

    test<T = any>(data: WebhookRequest): Promise<T> {
        return this.http().api.post<T>(`/Webhook/Test`, data);
    }
}

const webhookService = new WebhookService()
export { webhookService }

