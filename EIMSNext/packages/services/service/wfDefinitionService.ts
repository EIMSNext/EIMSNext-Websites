import { ODataServiceBase } from "../interface";
import { WfDefinition, WfDefinitionRequest } from "@eimsnext/models";

export class WfDefinitionService extends ODataServiceBase<
  WfDefinition,
  WfDefinitionRequest
> {
  protected modelName(): string {
    return "WfDefinition";
  }
}

const wfDefinitionService = new WfDefinitionService();
export { wfDefinitionService };
