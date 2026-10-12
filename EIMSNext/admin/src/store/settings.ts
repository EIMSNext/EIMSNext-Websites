import defaultSettings from "@/settings";
import { Themes } from "@/enums/Themes";
import {
  generateThemeColors,
  applyTheme,
  toggleDarkMode,
  resolveThemeColor,
  CORP_THEME_COLOR_SETTING_NAME,
  CORP_STYLE_ENABLED_SETTING_NAME,
} from "@/utils/theme";
import { queryUnreadSystemMessageCount } from "@/utils/badge";
import { corporateSettingService } from "@eimsnext/services";
import { useUserStoreHook } from "@eimsnext/store";
import { UserType } from "@eimsnext/models";
import { bus } from "@eimsnext/utils";

type SettingsValue = boolean | string;

/**
 * 改造前的系统默认主题色。
 * 历史数据里所有未自定义过的用户都会被 `useStorage` 写入该默认值，
 * 因此命中它时视为「用户未自定义」，避免企业主题色对老用户永远不生效。
 */
const LEGACY_DEFAULT_THEME_COLOR = "#4080ff";

export const useSettingsStore = defineStore("setting", () => {
  // 消息中心
  const messageCenterVisible = ref(false);
  const notificationUnreadCount = ref(0);
  // 平台管理员无企业消息上下文，避免无意义的 SystemMessage/$count 请求
  const userStore = useUserStoreHook();
  const isPlatAdmin = computed(() => userStore.currentUser.userType === UserType.PlatAdmin);
  // 基本设置
  const settingsVisible = ref(false);
  // 应用市场
  const appStoreVisible = ref(false);
  // 标签
  const tagsView = useStorage<boolean>("tagsView", defaultSettings.tagsView);
  // 固定头部
  const fixedHeader = useStorage<boolean>("fixedHeader", defaultSettings.fixedHeader);
  // 水印
  const watermarkEnabled = useStorage<boolean>(
    "watermarkEnabled",
    defaultSettings.watermarkEnabled
  );

  // 主题色本地存储值
  const storedThemeColor = useStorage<string>("themeColor", "");
  // 用户是否显式设置过主题色（用于区分历史遗留的默认值）
  const themeColorCustomized = useStorage<boolean>("themeColorCustomized", false);
  // 企业主题色（登录后从服务端读取，不落本地）
  const corpThemeColor = ref<string>("");
  // 企业是否启用自定义风格（企业主题色总开关，未配置时默认启用）
  const corpStyleEnabled = ref<boolean>(true);
  // 已读取企业主题色的企业 ID，用于切换企业时重新读取
  const corpThemeLoadedCorpId = ref<string>("");

  // 主题
  const theme = useStorage<string>("theme", defaultSettings.theme);

  /**
   * 用户自定义主题色；未自定义时为空字符串。
   * 兼容历史数据：没有显式设置标记、且本地值恰好是旧默认值时，视为未自定义。
   */
  const userThemeColor = computed(() => {
    if (themeColorCustomized.value) return storedThemeColor.value;
    const value = storedThemeColor.value;
    if (value && value.toLowerCase() !== LEGACY_DEFAULT_THEME_COLOR) return value;
    return "";
  });

  // 生效主题色：用户自定义 > 企业主题色（启用时）> 系统默认
  const themeColor = computed(() =>
    resolveThemeColor(
      userThemeColor.value,
      corpStyleEnabled.value ? corpThemeColor.value : ""
    )
  );

  // 监听主题变化
  watch(
    [theme, themeColor],
    ([newTheme, newThemeColor]) => {
      toggleDarkMode(newTheme === Themes.DARK);
      const colors = generateThemeColors(newThemeColor);
      applyTheme(colors);
    },
    { immediate: true }
  );
  // 设置更改函数
  const settingsMap: Record<string, Ref<SettingsValue>> = {
    fixedHeader,
    tagsView,
    watermarkEnabled,
  };

  function changeSetting({ key, value }: { key: string; value: SettingsValue }) {
    const setting = settingsMap[key];
    if (setting) setting.value = value;
  }

  function changeTheme(val: string) {
    theme.value = val;
  }

  /**
   * 设置用户自定义主题色。
   * 传空表示清空个人色：取消「已自定义」标记并回落到企业色。
   */
  function changeThemeColor(color: string) {
    if (!color) {
      storedThemeColor.value = corpThemeColor.value || "";
      themeColorCustomized.value = false;
      return;
    }

    storedThemeColor.value = color;
    themeColorCustomized.value = true;
  }

  /** 清理企业主题色与风格开关（登出或未选择企业时）。 */
  function clearCorpTheme() {
    corpThemeColor.value = "";
    corpStyleEnabled.value = true;
    corpThemeLoadedCorpId.value = "";
  }

  /**
   * 读取当前企业的主题色与风格开关。
   * 用户未自定义主题色时，企业色会作为生效色；用户已自定义时以用户色为准。
   */
  async function loadCorpTheme(force = false) {
    const corpId = useUserStoreHook().currentUser.corpId || "";
    if (!corpId) {
      clearCorpTheme();
      return;
    }
    if (corpThemeLoadedCorpId.value === corpId && !force) return;

    try {
      const settings = await corporateSettingService.current();
      const colorItem = settings?.find((x) => x.name === CORP_THEME_COLOR_SETTING_NAME);
      const enabledItem = settings?.find(
        (x) => x.name === CORP_STYLE_ENABLED_SETTING_NAME
      );
      corpThemeColor.value = colorItem?.value || "";
      corpStyleEnabled.value = enabledItem
        ? String(enabledItem.value).toLowerCase() === "true"
        : true;
      corpThemeLoadedCorpId.value = corpId;
    } catch {
      // 企业主题色为弱依赖，读取失败不影响页面
    }
  }

  /** 更新企业风格开关（保存成功后立即生效）。 */
  function setCorpStyleEnabled(enabled: boolean) {
    corpStyleEnabled.value = enabled;
  }

  /**
   * 保存企业主题色后立即生效。
   * 用企业色替换当前主题色，并清除「用户已自定义」标记，
   * 使管理员即时看到效果，且后续企业色变更仍能跟随。
   */
  function applyCorpThemeColor(color: string) {
    corpThemeColor.value = color;
    storedThemeColor.value = color;
    themeColorCustomized.value = false;
  }

  // 登出时清理企业主题色
  bus.on("identity:logout", clearCorpTheme);

  async function refreshNotificationUnreadCount() {
    if (isPlatAdmin.value) {
      notificationUnreadCount.value = 0;
      return;
    }
    notificationUnreadCount.value = await queryUnreadSystemMessageCount();
  }

  return {
    messageCenterVisible,
    notificationUnreadCount,
    settingsVisible,
    appStoreVisible,
    tagsView,
    fixedHeader,
    themeColor,
    userThemeColor,
    corpThemeColor,
    corpStyleEnabled,
    theme,
    watermarkEnabled,
    changeSetting,
    changeTheme,
    changeThemeColor,
    setCorpStyleEnabled,
    applyCorpThemeColor,
    loadCorpTheme,
    clearCorpTheme,
    refreshNotificationUnreadCount,
  };
});
