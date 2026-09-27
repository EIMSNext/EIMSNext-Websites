import { ECoinPrice } from "@eimsnext/models";
import { ReadonlyODataServiceBase } from "../interface";

export class ECoinPriceService extends ReadonlyODataServiceBase<ECoinPrice> {
  protected modelName(): string {
    return "ECoinPrice";
  }
}

const eCoinPriceService = new ECoinPriceService();
export { eCoinPriceService };
