import { ODataServiceBase } from "../interface";
import { FormNotify, FormNotifyRequest } from "@eimsnext/models";

export class FormNotifyService extends ODataServiceBase<FormNotify, FormNotifyRequest> {
    protected modelName(): string {
        return "FormNotify";
    }
}

const formNotifyService = new FormNotifyService()
export { formNotifyService }

