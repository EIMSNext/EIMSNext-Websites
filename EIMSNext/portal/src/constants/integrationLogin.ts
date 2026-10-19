import wechatIcon from "@/assets/icons/wechat.svg";
// 以下集成登录未实现，按钮随图标 import 一并注释隐藏（勿删业务，随系统集成进度逐步反注释）：
// import wxworkIcon from "@/assets/icons/wecom.svg";
// import dingtalkIcon from "@/assets/icons/dingtalk.svg";
// import feishuIcon from "@/assets/icons/feishu.svg";

export type IntegrationLoginType = "wechat" | "wxwork" | "dingding" | "feishu";

export interface IntegrationLoginItem {
  type: IntegrationLoginType;
  label: string;
  icon: string;
}

export const integrationLoginItems: IntegrationLoginItem[] = [
  { type: "wechat", label: "微信", icon: wechatIcon },
  // { type: "wxwork", label: "企业微信", icon: wxworkIcon },
  // { type: "feishu", label: "飞书", icon: feishuIcon },
  // { type: "dingding", label: "钉钉", icon: dingtalkIcon },
];
