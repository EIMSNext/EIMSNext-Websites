import { ODataServiceBase } from "../interface";
import { WebhookAlias, WebhookAliasRequest } from "@eimsnext/models";

export class WebhookAliasService extends ODataServiceBase<WebhookAlias, WebhookAliasRequest> {
  protected modelName(): string {
    return "WebhookAlias";
  }
}

const webhookAliasService = new WebhookAliasService();
export { webhookAliasService };
