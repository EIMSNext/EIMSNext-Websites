import {
  applyTheme,
  generateThemeColors,
  resolveThemeColor,
  CORP_THEME_COLOR_SETTING_NAME,
  CORP_STYLE_ENABLED_SETTING_NAME,
} from "@eimsnext/utils";
import type { CorporateSetting } from "@eimsnext/models";
import { corporateSettingService } from "@eimsnext/services";

/**
 * 应用主题色，优先级：用户自定义 > 企业主题色 > 系统默认。
 */
export function applyThemeColor(userColor?: string, corpColor?: string) {
  applyTheme(generateThemeColors(resolveThemeColor(userColor, corpColor)));
}

/**
 * 改造前的系统默认主题色。
 * 与 admin 端保持一致：历史数据里未自定义过的用户本地会留有该值，应视为「未自定义」。
 */
const LEGACY_DEFAULT_THEME_COLOR = "#4080ff";

/** 读取本地用户自定义主题色（未设置为空字符串）。 */
export function getUserThemeColor(): string {
  const value = localStorage.getItem("themeColor") || "";
  if (!value) return "";
  if (localStorage.getItem("themeColorCustomized") === "true") return value;
  return value.toLowerCase() === LEGACY_DEFAULT_THEME_COLOR ? "" : value;
}

/** 读取当前企业适用于普通用户的配置（弱依赖，失败返回空数组）。 */
async function fetchCorpSettings(): Promise<CorporateSetting[]> {
  try {
    return (await corporateSettingService.current()) || [];
  } catch {
    return [];
  }
}

/**
 * 用户未自定义主题色、且企业启用了自定义风格时，应用企业主题色。
 */
export async function applyCorpThemeIfNeeded() {
  if (getUserThemeColor()) return;

  const settings = await fetchCorpSettings();
  const enabledItem = settings.find((x) => x.name === CORP_STYLE_ENABLED_SETTING_NAME);
  const styleEnabled = enabledItem
    ? String(enabledItem.value).toLowerCase() === "true"
    : true;
  if (!styleEnabled) return;

  const corpColor =
    settings.find((x) => x.name === CORP_THEME_COLOR_SETTING_NAME)?.value || "";
  if (corpColor) applyThemeColor("", corpColor);
}
