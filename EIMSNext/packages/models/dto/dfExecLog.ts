import { DataflowTriggerKind } from "./dataflow";
import { CorpModelBase, Operator } from "./modelBase";
import { EventSourceType } from "./wfDefinition";

export interface DfRunLog extends CorpModelBase {
  appId?: string;
  dataflowId: string;
  dataflowName?: string;
  dataflowVersion?: number;
  wfInstanceId?: string;
  triggerKind?: DataflowTriggerKind | number | string;
  eventSource?: EventSourceType | number | string;
  eventType?: number | string;
  triggerBy?: Operator;
  triggerTime?: number;
  startTime?: number;
  endTime?: number;
  success: boolean;
  errMsg?: string;
}

export interface DfExecLog extends CorpModelBase {
  runLogId?: string;
  dataflowId?: string;
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

export interface DfRunLogQueryParams {
  dataflowId: string;
  startTime?: number;
  endTime?: number;
  success?: boolean;
  skip?: number;
  top?: number;
}

export interface DfRunLogQueryResult {
  total: number;
  items: DfRunLog[];
}

export interface DfRunLogDetail {
  run: DfRunLog;
  nodes: DfExecLog[];
  executedNodeIds: string[];
  failedNodeIds: string[];
}
