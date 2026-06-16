import { FormType } from "./formDef";
import { CorpModelBase, IdBase } from "./modelBase";

export interface AppDefRequest extends IdBase {
  name?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  sortIndex?: number;
  homeEntryId?: string;
}

export interface AppDef extends CorpModelBase {
  templateId?: string;
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  groupId?: string;
  sortIndex: number;
  homeEntryId?: string;
  appMenus: AppMenu[];
}

export interface AppMenu {
  menuId: string;
  title?: string;
  icon?: string;
  iconColor?: string;
  menuType?: FormType;
  sortIndex?: number;
  subMenus?: AppMenu[];
}

export interface EditAppMenuRequest {
  appId: string;
  menuId: string;
  name: string;
  icon?: string;
  iconColor?: string;
}

export interface CreateAppGroupRequest {
  appId: string;
  name: string;
}

export interface EditAppGroupRequest {
  appId: string;
  menuId: string;
  name: string;
}

export interface DeleteAppGroupRequest {
  appId: string;
  menuId: string;
}

export interface SaveAppMenusRequest {
  appId: string;
  appMenus: AppMenu[];
}
