import { CorpModelBase, IdBase } from "./modelBase";

export interface WfDefinitionRequest extends IdBase {
  name: string;
  flowType: FlowType;
  externalId: string;
  description?: string;
  version: number;
  isCurrent: boolean;
  content: string;
  eventSource: EventSourceType;
  sourceId?: string;
}

export interface WfDefinition extends CorpModelBase {
  name: string;
  flowType: FlowType;
  externalId: string;
  description?: string;
  version: number;
  isCurrent: boolean;
  content: string;
  eventSource: EventSourceType;
  sourceId?: string;
}
export enum FlowType {
  Workflow = "0",
  Dataflow = "1",
}
export enum EventSourceType {
  None = "0",
  Form = "1",
  Buttton = "2",
}
