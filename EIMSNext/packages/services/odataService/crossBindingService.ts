import { ODataServiceBase } from "../interface";
import { CrossBinding, CrossBindingRequest } from "@eimsnext/models";

export class CrossBindingService extends ODataServiceBase<CrossBinding, CrossBindingRequest> {
  protected modelName(): string {
    return "CrossBinding";
  }
}

const crossBindingService = new CrossBindingService();
export { crossBindingService };
