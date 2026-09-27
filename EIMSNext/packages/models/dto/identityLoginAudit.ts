import { CorpModelBase, IdBase } from "./modelBase";

export interface IdentityLoginAudit extends CorpModelBase {
  loginId?: string;
  userName?: string;
  clientIp?: string;
  failReason?: string;
}
