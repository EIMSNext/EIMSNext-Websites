import { ApiServiceBase } from "../interface";
import {
  ExportResponse,
  FormData,
  FormDataChangeLog,
  FormDataExportRequest,
  FormDataImportEditableErrorsResponse,
  FormDataImportPreviewResponse,
  FormDataImportRetryRequest,
  FormDataImportRetryResponse,
  FormDataImportStartRequest,
  FormDataImportStartResponse,
  FormDataImportStatusResponse,
  FormDataRequest,
} from "@eimsnext/models";
import {
  BatchDeleteRequest,
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

  async previewImport(file: File, formId: string): Promise<FormDataImportPreviewResponse> {
    const data = new globalThis.FormData();
    data.append("file", file, file.name);
    data.append("formId", formId);
    return unwrapApiResult(await this.http().api.postForm<ApiResult<FormDataImportPreviewResponse>>(`/FormData/Import/Preview`, data));
  }

  async startImport(file: File, options: FormDataImportStartRequest): Promise<FormDataImportStartResponse> {
    const data = new globalThis.FormData();
    data.append("file", file, file.name);
    data.append("options", JSON.stringify(options));
    return unwrapApiResult(await this.http().api.postForm<ApiResult<FormDataImportStartResponse>>(`/FormData/Import`, data));
  }

  async getImportStatus(id: string): Promise<FormDataImportStatusResponse> {
    return unwrapApiResult(await this.http().api.get<ApiResult<FormDataImportStatusResponse>>(`/FormData/Import/${id}`));
  }

  async getImportErrors(id: string): Promise<FormDataImportEditableErrorsResponse> {
    return unwrapApiResult(await this.http().api.get<ApiResult<FormDataImportEditableErrorsResponse>>(`/FormData/Import/${id}/Errors`));
  }

  async submitImportCorrections(id: string, request: FormDataImportRetryRequest): Promise<FormDataImportRetryResponse> {
    return unwrapApiResult(await this.http().api.post<ApiResult<FormDataImportRetryResponse>>(`/FormData/Import/${id}/Retry`, request));
  }

  countByOptions(query: any): Promise<number> {
    return this.http().api.post<number>(`/FormData/query/$count`, query);
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

  restore(data: BatchDeleteRequest): Promise<void> {
    return this.http().api.post<void>(`/FormData/manage/restore`, data);
  }

  purge(data: BatchDeleteRequest): Promise<void> {
    return this.http().api.delete<void>(`/FormData/manage/purge`, data, true);
  }
}

const formDataService = new FormDataService();
export { formDataService };

interface ApiResult<T> {
  code?: number;
  message?: string;
  value?: T;
}

function unwrapApiResult<T>(result: ApiResult<T> | T): T {
  if (result && typeof result === "object" && "value" in result && "code" in result) {
    return (result as ApiResult<T>).value as T;
  }
  return result as T;
}
