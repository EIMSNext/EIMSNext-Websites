import { CorpModelBase, ModelBase } from "./modelBase";
import { PluginFieldDesc } from "./plugin";

export interface PluginPricingPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  unit?: string;
  isTrial?: boolean;
}

export interface PluginStoreRequest {
  keyword?: string;
  category?: string;
  scenario?: string;
  recommended?: boolean;
  skip?: number;
  take?: number;
}

export interface PluginProfile extends ModelBase {
  pluginId: string;
  version: string;
  name: string;
  summary?: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  bannerImage?: string;
  galleryImages?: string[];
  category?: string;
  scenario?: string;
  tags?: string[];
  developerName?: string;
  isOfficial?: boolean;
  isHot?: boolean;
  isRecommended?: boolean;
  installCount: number;
  sortIndex: number;
  status?: string;
  publishedAt?: string;
  helpDocUrl?: string;
  templateUrl?: string;
  pricingPlans?: PluginPricingPlan[];
  functions?: PluginStoreFunction[];
  installed?: boolean;
  installEnabled?: boolean;
}

export interface PluginStoreFunction {
  id: string;
  name: string;
  description?: string;
  inputFields?: PluginFieldDesc[];
}

export interface PluginInstall extends CorpModelBase {
  pluginProfileId: string;
  pluginId: string;
  version: string;
  name: string;
  summary?: string;
  icon?: string;
  status: string;
  enabled: boolean;
  installedAt: number;
  lastEnabledAt?: number;
  lastDisabledAt?: number;
  uninstalledAt?: number;
  source?: string;
  orderNo?: string;
  expireAt?: number;
}
