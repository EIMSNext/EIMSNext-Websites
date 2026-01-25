import { CorpModelBase, IdBase } from "./modelBase";

export interface WfDefinitionRequest extends IdBase {
  appId?: string;
  name?: string;
  flowType?: FlowType;
  externalId?: string;
  description?: string;
  version?: number;
  isCurrent?: boolean;
  content?: string;
  eventSource?: EventSourceType;
  sourceId?: string;
  disabled?: boolean;
}

export interface WfDefinition extends CorpModelBase {
  appId: string;
  name: string;
  flowType: FlowType;
  externalId: string;
  description?: string;
  version: number;
  isCurrent: boolean;
  content: string;
  eventSource: EventSourceType;
  sourceId?: string;
  disabled?: boolean;
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
