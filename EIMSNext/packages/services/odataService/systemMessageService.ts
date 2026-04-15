import { ReadonlyODataServiceBase } from "../interface";
import { SystemMessage } from "@eimsnext/models";

export class SystemMessageService extends ReadonlyODataServiceBase<SystemMessage> {
  protected modelName(): string {
    return "SystemMessage";
  }
}

const systemMessageService = new SystemMessageService();
export { systemMessageService };
