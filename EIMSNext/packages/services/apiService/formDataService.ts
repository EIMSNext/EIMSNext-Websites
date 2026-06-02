import { ApiServiceBase } from "../interface";
import { ExportResponse, FormData, FormDataExportRequest, FormDataRequest } from "@eimsnext/models";
import {
  IFormDataFilterOptionsRequest,
  IFormDataFilterOptionsResponse,
} from "@/requestModel";

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
}

const formDataService = new FormDataService();
export { formDataService };
