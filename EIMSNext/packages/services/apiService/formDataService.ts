import { ApiServiceBase } from "../interface";
import { ExportResponse, FormData, FormDataExportRequest, FormDataRequest } from "@eimsnext/models";

export class FormDataService extends ApiServiceBase<FormData, FormDataRequest> {
  protected modelName(): string {
    return "FormData";
  }

  export(data: FormDataExportRequest): Promise<ExportResponse> {
    return this.http().api.post<ExportResponse>(`/FormData/Export`, data);
  }
}

const formDataService = new FormDataService();
export { formDataService };
