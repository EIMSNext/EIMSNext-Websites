import { IdBase } from "./modelBase";

export enum ECoinTargetType {
  SMS = 0,
  EMail = 1,
  Plugin = 2,
}

export enum ECoinChargeType {
  ECoin = 0,
  Subscription = 1,
}

export interface ECoinPrice extends IdBase {
  targetType: ECoinTargetType | string;
  featureId: string;
  featureDesc: string;
  price: number;
  chargeType: ECoinChargeType | string;
  pluginId: string;
}

export interface ECoinPriceBatchItem {
  targetType: ECoinTargetType;
  featureId?: string;
  featureDesc?: string;
  price: number;
  chargeType: ECoinChargeType;
  pluginId?: string;
}

export interface PlatformApp {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  corpId?: string;
  corpName?: string;
  templateId?: string;
  profileId?: string;
  status?: string;
  publishedAt?: string;
}

export interface PlatformAppPage {
  total: number;
  items: PlatformApp[];
}

export interface PluginPublishRequest {
  pluginId: string;
  summary?: string;
  icon?: string;
  coverImage?: string;
  bannerImage?: string;
  galleryImages?: string[];
  category?: string;
  scenario?: string;
  tags?: string[];
  developerName?: string;
  developerCorpId?: string;
  isOfficial?: boolean;
  isHot?: boolean;
  isRecommended?: boolean;
  sortIndex?: number;
  helpDocUrl?: string;
  templateUrl?: string;
}
