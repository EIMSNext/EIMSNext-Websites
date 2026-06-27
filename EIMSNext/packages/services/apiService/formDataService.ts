import { ApiServiceBase } from "../interface";
import { ExportResponse, FormData, FormDataChangeLog, FormDataExportRequest, FormDataRequest } from "@eimsnext/models";
import {
  IFormDataFilterOptionsRequest,
  IFormDataFilterOptionsResponse,
  IFormDataPermissionScopeResponse,
} from "../requestModel";

export class FormDataService extends ApiServiceBase<FormData, FormDataRequest> {
  protected modelName(): string {
    return "FormData";
  }

  export(data: FormDataExportRequest): Promise<ExportResponse> {
    return this.http().api.post<ExportResponse>(`/FormData/Export`, data);
  }

  getFilterOptions(data: IFormDataFilterOptionsRequest): Promise<IFormDataFilterOptionsResponse> {
    return this.http().api.post<IFormDataFilterOptionsResponse>(`/FormData/filter/options`, data);
  }

  getPermissionScope(dataId: string, formId: string): Promise<IFormDataPermissionScopeResponse> {
    return this.http().api.get<IFormDataPermissionScopeResponse>(`/FormData/${dataId}/permission-scope`, { formId });
  }

  async getChangeLogs(dataId: string, skip = 0, top = 20, authGroupId?: string): Promise<FormDataChangeLog[]> {
    const params: Record<string, unknown> = { skip, top };
    if (authGroupId) params.authGroupId = authGroupId;

    const result = await this.http().api.get<{ value: FormDataChangeLog[] }>(`/FormData/${dataId}/changelog`, params);
    return result.value;
  }

  countChangeLogs(dataId: string, authGroupId?: string): Promise<number> {
    const params: Record<string, unknown> = {};
    if (authGroupId) params.authGroupId = authGroupId;

    return this.http().api.get<number>(`/FormData/${dataId}/changelog/$count`, params);
  }
}

const formDataService = new FormDataService();
export { formDataService };
