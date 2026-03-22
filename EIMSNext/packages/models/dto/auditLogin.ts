import { CorpModelBase, IdBase } from "./modelBase";

export interface AuditLogin extends CorpModelBase {
  loginId?: string;
  userName?: string;
  clientIp?: string;
  failReason?: string;
}
