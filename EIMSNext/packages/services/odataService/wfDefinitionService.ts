import { ODataServiceBase } from "../interface";
import { WfDefinition, WfDefinitionRequest } from "@eimsnext/models";

export class WfDefinitionService extends ODataServiceBase<
  WfDefinition,
  WfDefinitionRequest
> {
  protected modelName(): string {
    return "WfDefinition";
  }

  createVersion(id: string): Promise<WfDefinition> {
    return this.http().api.post<WfDefinition>(`/WfDefinition/CreateVersion`, { id });
  }

  activate(id: string): Promise<WfDefinition> {
    return this.http().api.post<WfDefinition>(`/WfDefinition/Activate`, { id });
  }
}

const wfDefinitionService = new WfDefinitionService();
export { wfDefinitionService };
