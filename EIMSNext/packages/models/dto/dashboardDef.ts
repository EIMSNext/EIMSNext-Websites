import { CorpModelBase, IdBase } from "./modelBase";

export interface DashboardDefRequest extends IdBase {
  appId?: string;
  name?: string;
  layout?: string;
}

export interface DashboardDef extends CorpModelBase {
  appId: string;
  name: string;
  layout: string;
}
