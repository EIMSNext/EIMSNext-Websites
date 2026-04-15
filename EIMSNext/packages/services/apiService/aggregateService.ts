import { ServiceBase } from "../interface";
import { AggCalcRequest } from "@/requestModel/aggCalcRequest";

export class AggregateService extends ServiceBase {
  calucate(req: AggCalcRequest): Promise<any> {
    return this.http().api.post<any>(`/aggregate/calucate`, req);
  }
}

const aggregateService = new AggregateService();
export { aggregateService };
