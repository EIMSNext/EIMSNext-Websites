import defaultSettings from "@/settings";
import { Themes } from "@/enums/Themes";
import { generateThemeColors, applyTheme, toggleDarkMode } from "@/utils/theme";

type SettingsValue = boolean | string;

export const useSettingsStore = defineStore("setting", () => {
  // 基本设置
  const settingsVisible = ref(false);
  // 标签
  const tagsView = useStorage<boolean>("tagsView", defaultSettings.tagsView);
  // 固定头部
  const fixedHeader = useStorage<boolean>("fixedHeader", defaultSettings.fixedHeader);
  // 水印
  const watermarkEnabled = useStorage<boolean>(
    "watermarkEnabled",
    defaultSettings.watermarkEnabled
  );

  // 主题
  const themeColor = useStorage<string>("themeColor", defaultSettings.themeColor);
  const theme = useStorage<string>("theme", defaultSettings.theme);

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

  function changeThemeColor(color: string) {
    themeColor.value = color;
  }

  return {
    settingsVisible,
    tagsView,
    fixedHeader,
    themeColor,
    theme,
    watermarkEnabled,
    changeSetting,
    changeTheme,
    changeThemeColor
  };
});
