import { CorpModelBase, IdBase } from "./modelBase";

export interface DfExecLog extends CorpModelBase {
  wfInstanceId?: string;
  dataId?: string;
  nodeId?: string;
  success: boolean;
  errMsg?: string;
  execTime?: number;
}
