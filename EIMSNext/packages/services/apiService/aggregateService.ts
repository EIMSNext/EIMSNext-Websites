import { ServiceBase } from "../interface";
import { AggCalcRequest } from "@/requestModel/aggCalcRequest";

export class AggregateService extends ServiceBase {
  calucate(req: AggCalcRequest): Promise<any> {
    return this.http().api.post<any>(`/aggregate/calucate`, req);
  }
  count(req: AggCalcRequest): Promise<number> {
    return this.http().api.post<number>(`/aggregate/$count`, req);
  }
}

const aggregateService = new AggregateService();
export { aggregateService };
