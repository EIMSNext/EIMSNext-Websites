import { ServiceBase } from "../interface";
import { EventFlowHttpSampleField } from "@eimsnext/models";

export interface EventFlowHttpSampleResult {
  hasSample: boolean;
  capturedAt?: number;
  sampleFields?: EventFlowHttpSampleField[];
}

export class EventFlowSampleService extends ServiceBase {
  getHttpSample(eventFlowId: string, corpId: string): Promise<EventFlowHttpSampleResult> {
    return this.http().api.get<EventFlowHttpSampleResult>("/WfDefinition/HttpSample", { eventFlowId, corpId });
  }
}

const eventFlowSampleService = new EventFlowSampleService();
export { eventFlowSampleService };
