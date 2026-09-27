import { ODataServiceBase } from "../interface";
import { FormListView, FormListViewRequest } from "@eimsnext/models";

export class FormListViewService extends ODataServiceBase<FormListView, FormListViewRequest> {
  protected modelName(): string {
    return "FormListView";
  }
}

const formListViewService = new FormListViewService();
export { formListViewService };
