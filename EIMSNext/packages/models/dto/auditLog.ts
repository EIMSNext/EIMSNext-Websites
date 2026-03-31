import { CorpModelBase, IdBase } from "./modelBase";

export interface AuditLog extends CorpModelBase {
  action?: string;
  entityType?: string;
  dataId?: string;
  detail?: string;
  clientIp?: string;
}
