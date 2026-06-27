import { CorpModelBase, IdBase } from "./modelBase";

/**
 * 公开访问 scope，标识 token 可访问的公开资源类型。
 * 与后端 EIMSNext.ApiService.PublicScope 对应。
 * 单选使用（每次申请 token 只选一种 scope）。
 */
export enum PublicScope {
  None = 0,
  DashLink = 1,
  FormLink = 2,
  DataLink = 4,
  QueryLink = 8,
}

export interface PublicSettingRequest extends IdBase {
  appId?: string;
  targetType?: PublicTargetType;
  targetId?: string;
  form?: PublicFormSetting;
  dashboard?: PublicDashboardSetting;
}

export interface PublicSetting extends CorpModelBase {
  appId: string;
  targetType: PublicTargetType;
  targetId: string;
  form: PublicFormSetting;
  dashboard: PublicDashboardSetting;
}

export enum PublicTargetType {
  Form = 0,
  Dashboard = 1,
}

export interface PublicPublishSection {
  enabled?: boolean;
  expireTime?: number;
  accessCodeEnabled?: boolean;
  accessCodeHash?: string;
}

export interface PublicDashboardSetting extends PublicPublishSection {}

export interface PublicFormSetting {
  formLink?: PublicFormLinkSetting;
  dataLink?: PublicDataLinkSetting;
  queryLink?: PublicQueryLinkSetting;
}

export interface PublicFormLinkSetting extends PublicPublishSection {
  wechat?: PublicWechatSetting;
  extLink?: PublicExtLinkSetting;
  oneSubmit?: boolean;
  viewOwnData?: boolean;
  editOwnData?: boolean;
}

export interface PublicDataLinkSetting extends PublicPublishSection {
  fields?: PublicFieldPermission[];
}

export interface PublicQueryLinkSetting extends PublicPublishSection {
  queryFields?: string[];
  displayFields?: string[];
}

export interface PublicWechatSetting {
  enabled?: boolean;
  acquireMode?: PublicWechatAcquireMode;
}

export enum PublicWechatAcquireMode {
  SilentOpenId = 0,
  ExplicitGrant = 1,
}

export interface PublicExtLinkSetting {
  enabled?: boolean;
  values?: string[];
}

export interface PublicFieldPermission {
  field: string;
  visible?: boolean;
  editable?: boolean;
}
