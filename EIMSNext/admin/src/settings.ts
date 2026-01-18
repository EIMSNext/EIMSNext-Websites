import { Themes } from "./enums/Themes";
import { Language } from "./enums/Language";

// 检查用户的操作系统是否使用深色模式
const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

const defaultSettings: AppSettings = {
  // 系统Title
  title: "EIMS Next",
  // 系统版本
  version: "1.0.0",
  // 是否显示设置
  showSettings: true,
  // 是否显示标签视图
  tagsView: true,
  // 是否固定头部
  fixedHeader: true,
  // 是否显示侧边栏Logo
  sidebarLogo: true,
  // 主题，根据操作系统的色彩方案自动选择
  theme: mediaQueryList.matches ? Themes.DARK : Themes.LIGHT,
  // 语言
  language: Language.ZH_CN,
  // 主题颜色
  themeColor: "#4080FF",
  // 是否开启水印
  watermarkEnabled: false,
  // 水印内容
  watermarkContent: "EIMS Next",
};

export default defaultSettings;
