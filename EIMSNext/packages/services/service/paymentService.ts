import { ODataServiceBase } from "../interface";
import { Payment, PaymentRequest } from "@eimsnext/models";

export class PaymentService extends ODataServiceBase<Payment, PaymentRequest> {
    protected modelName(): string {
        return "Payment";
    }
}

const paymentService = new PaymentService()
export { paymentService }

