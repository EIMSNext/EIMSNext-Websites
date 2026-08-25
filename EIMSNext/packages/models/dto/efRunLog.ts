import { EventFlowTriggerKind } from "./eventFlow";
import { CorpModelBase, ModelBase, Operator } from "./modelBase";
import { EventSourceType } from "./wfDefinition";

export interface EfRunLog extends CorpModelBase {
  appId?: string;
  eventFlowId: string;
  eventFlowName?: string;
  eventFlowVersion?: number;
  wfInstanceId?: string;
  triggerKind?: EventFlowTriggerKind | number | string;
  eventSource?: EventSourceType | number | string;
  eventType?: number | string;
  triggerBy?: Operator;
  triggerTime?: number;
  startTime?: number;
  endTime?: number;
  success: boolean;
  errMsg?: string;
}

export interface EfRunLogNode extends ModelBase {
  corpId?: string;
  runLogId?: string;
  eventFlowId?: string;
  wfInstanceId?: string;
  dataId?: string;
  nodeId?: string;
  nodeName?: string;
  nodeType?: number | string;
  startTime?: number;
  endTime?: number;
  success: boolean;
  errMsg?: string;
  failureReason?: string;
  troubleshootingSuggestion?: string;
  summary?: string;
  execTime?: number;
}

export interface EfRunLogQueryParams {
  eventFlowId: string;
  startTime?: number;
  endTime?: number;
  success?: boolean;
  skip?: number;
  top?: number;
}

export interface EfRunLogQueryResult {
  total: number;
  items: EfRunLog[];
}

export interface EfRunLogDetail {
  run: EfRunLog;
  nodes: EfRunLogNode[];
  executedNodeIds: string[];
  failedNodeIds: string[];
}
