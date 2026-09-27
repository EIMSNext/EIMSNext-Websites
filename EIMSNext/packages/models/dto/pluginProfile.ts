import { CorpModelBase, ModelBase } from "./modelBase";
import { PluginFieldDesc, PluginResultFieldDesc } from "./plugin";

export interface PluginProfileQueryRequest {
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
  functions?: PluginProfileFunction[];
  installed?: boolean;
  installEnabled?: boolean;
}

export interface PluginProfileFunction {
  id: string;
  name: string;
  description?: string;
  inputFields?: PluginFieldDesc[];
  resultFields?: PluginResultFieldDesc[];
}

export interface PluginInstall extends CorpModelBase {
  pluginId: string;
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
