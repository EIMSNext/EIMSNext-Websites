import defaultSettings from "@/settings";

import { store } from "@eimsnext/store";
import { SidebarStatus } from "@/enums/SidebarStatus";

// 导入 Element Plus 中英文语言包
import zhCn_EL from "element-plus/es/locale/lang/zh-cn";
import en_EL from "element-plus/es/locale/lang/en";
// 本地语言包
import { ZhCn as zhCn_App, En as en_App } from "@eimsnext/locale";

const locales = {
  "zh-CN": {
    ...zhCn_EL,
    ...zhCn_App,
  },
  en: {
    ...en_EL,
    ...en_App,
  },
};

export const useSystemStore = defineStore("system", () => {
  // 语言
  const language = useStorage("language", defaultSettings.language);
  // 侧边栏状态
  const sidebarStatus = useStorage("sidebarStatus", SidebarStatus.CLOSED);
  const sidebar = reactive({
    opened: sidebarStatus.value === SidebarStatus.OPENED,
    withoutAnimation: false,
  });

  /**
   * 根据语言标识读取对应的语言包
   */
  const locale = computed(() => {
    if (language?.value == "en") {
      return locales.en;
    } else {
      return locales["zh-CN"];
    }
  });

  // 切换侧边栏
  function toggleSidebar() {
    sidebar.opened = !sidebar.opened;
    sidebarStatus.value = sidebar.opened ? SidebarStatus.OPENED : SidebarStatus.CLOSED;
  }

  // 关闭侧边栏
  function closeSideBar() {
    sidebar.opened = false;
    sidebarStatus.value = SidebarStatus.CLOSED;
  }

  // 打开侧边栏
  function openSideBar() {
    sidebar.opened = true;
    sidebarStatus.value = SidebarStatus.OPENED;
  }

   /**
   * 切换语言
   *
   * @param val
   */
  function changeLanguage(val: string) {
    language.value = val;
  }

  return {
    sidebar,
    language,
    locale,
    locales,
    changeLanguage,
    toggleSidebar,
    closeSideBar,
    openSideBar,
  };
});

/**
 * 用于在组件外部（如在Pinia Store 中）使用 Pinia 提供的 store 实例。
 * 官方文档解释了如何在组件外部使用 Pinia Store：
 * https://pinia.vuejs.org/core-concepts/outside-component-usage.html#using-a-store-outside-of-a-component
 */
export function useSystemStoreHook() {
  return useSystemStore(store);
}
