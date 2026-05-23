export type IntegrationLoginType = "wechat" | "wxwork" | "dingding" | "feishu";

export interface IntegrationLoginItem {
  type: IntegrationLoginType;
  label: string;
  shortLabel: string;
  className: string;
}

export const integrationLoginItems: IntegrationLoginItem[] = [
  { type: "wechat", label: "微信", shortLabel: "微", className: "wechat" },
  { type: "wxwork", label: "企业微信", shortLabel: "企", className: "wxwork" },
  { type: "feishu", label: "飞书", shortLabel: "飞", className: "feishu" },
  { type: "dingding", label: "钉钉", shortLabel: "钉", className: "dingding" },
];
