import { IdBase, ModelBase } from "./modelBase";

export interface CorporateRequest extends IdBase {
  name?: string;
  description?: string;
}

export interface Corporate extends ModelBase {
  code?: string;
  name: string;
  description: string;
  platform: PlatformType;
}

export enum PlatformType {
  /// <summary>
  /// 官网
  /// </summary>
  Public = "0",
  /// <summary>
  /// 企微
  /// </summary>
  Wxwork = "1",
  /// <summary>
  /// 钉钉
  /// </summary>
  Ding = "2",
  /// <summary>
  /// 飞书
  /// </summary>
  Feishu = "3",
  /// <summary>
  /// 私有
  /// </summary>
  Private = "999",
}
