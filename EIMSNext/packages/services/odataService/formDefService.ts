import { FormDef, FormDefRequest } from "@eimsnext/models";
import { ODataServiceBase } from "../interface";

export class FormDefService extends ODataServiceBase<FormDef, FormDefRequest> {
  protected modelName(): string {
    return "FormDef";
  }

  getFormsIncludeCross(appId: string): Promise<FormDef[]> {
    return this.http().api.get<FormDef[]>(`/FormDef/GetFormsIncludeCross?appId=${encodeURIComponent(appId)}`);
  }

  purgeFieldChangeLogs(formId: string, request: FieldChangeLogDeleteRequest): Promise<void> {
    return this.http().api.delete<void>(`/FormDef/${encodeURIComponent(formId)}/field`, request, true);
  }
}

const formDefService = new FormDefService();
export { formDefService };

export interface FieldChangeLogDeleteRequest {
  fieldIds?: string[];
  clearAll?: boolean;
}
