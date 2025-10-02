import { ApiServiceBase } from "../interface";
import { FormData, FormDataRequest } from "@eimsnext/models";

export class FormDataService extends ApiServiceBase<FormData, FormDataRequest> {
  protected modelName(): string {
    return "FormData";
  }
}

const formDataService = new FormDataService();
export { formDataService };
