import { ODataServiceBase } from "../interface";
import { FormNotification, FormNotificationRequest } from "@eimsnext/models";

export class FormNotificationService extends ODataServiceBase<FormNotification, FormNotificationRequest> {
    protected modelName(): string {
        return "FormNotification";
    }
}

const formNotificationService = new FormNotificationService()
export { formNotificationService }

