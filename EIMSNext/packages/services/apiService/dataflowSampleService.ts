import { ServiceBase } from "../interface";
import { DataflowHttpSampleField } from "@eimsnext/models";

export interface DataflowHttpSampleResult {
  hasSample: boolean;
  capturedAt?: number;
  sampleFields?: DataflowHttpSampleField[];
}

export class DataflowSampleService extends ServiceBase {
  getHttpSample(dataflowId: string, corpId: string): Promise<DataflowHttpSampleResult> {
    return this.http().api.get<DataflowHttpSampleResult>("/WfDefinition/HttpSample", { dataflowId, corpId });
  }
}

const dataflowSampleService = new DataflowSampleService();
export { dataflowSampleService };
