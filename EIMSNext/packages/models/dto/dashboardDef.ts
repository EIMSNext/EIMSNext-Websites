import { Member } from "./formDataPermissionGroup";
import { CorpModelBase, IdBase } from "./modelBase";

export interface DashboardDefRequest extends IdBase {
  appId?: string;
  name?: string;
  layout?: string;
  autoRefreshEnabled?: boolean;
  autoRefreshIntervalMinutes?: number;
  memberPublishEnabled?: boolean;
  publishMembers?: Member[];
}

export interface DashboardDef extends CorpModelBase {
  appId: string;
  name: string;
  layout: string;
  autoRefreshEnabled?: boolean;
  autoRefreshIntervalMinutes?: number;
  memberPublishEnabled?: boolean;
  publishMembers?: Member[];
}
