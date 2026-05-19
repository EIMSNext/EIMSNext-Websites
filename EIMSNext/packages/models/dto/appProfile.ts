import { ModelBase } from "./modelBase";

export interface AppProfileRequest {
  keyword?: string;
  category?: string;
  industry?: string;
  recommended?: boolean;
  skip?: number;
  take?: number;
}

export interface AppProfile extends ModelBase {
  name: string;
  summary?: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  bannerImage?: string;
  galleryImages?: string[];
  category?: string;
  industry?: string;
  tags?: string[];
  author?: string;
  installCount: number;
  sortIndex: number;
  isOfficial?: boolean;
  isHot?: boolean;
  isRecommended?: boolean;
  themeColor?: string;
  templateId: string;
  status?: string;
  publishedAt?: string;
}
