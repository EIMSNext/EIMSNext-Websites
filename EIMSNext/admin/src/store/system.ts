import defaultSettings from "@/settings";

import { store } from "@eimsnext/store";
import { SidebarStatusEnum } from "@/enums/SidebarStatusEnum";

// 导入 Element Plus 中英文语言包
import zhCn_EL from "element-plus/es/locale/lang/zh-cn";
import en_EL from "element-plus/es/locale/lang/en";
// 导入设计器 语言包
//@ts-expect-error (the desinger is js lib)
import { ZhCn as zhCn_Des, En as en_Des } from "@eimsnext/form-designer";
// 本地语言包
import en_App from "@/lang/en";
import zhCn_App from "@/lang/zh-cn";

const locales = {
  "zh-CN": {
    caption: "简体中文",
    ...zhCn_EL,
    ...zhCn_Des,
    ...zhCn_App,
  },
  en: {
    caption: "English",
    ...en_EL,
    ...en_Des,
    ...en_App,
  },
};

export const useSystemStore = defineStore("system", () => {
  // 布局大小
  const size = useStorage("size", defaultSettings.size);
  // 语言
  const language = useStorage("language", defaultSettings.language);
  // 侧边栏状态
  const sidebarStatus = useStorage("sidebarStatus", SidebarStatusEnum.CLOSED);
  const sidebar = reactive({
    opened: sidebarStatus.value === SidebarStatusEnum.OPENED,
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
    sidebarStatus.value = sidebar.opened ? SidebarStatusEnum.OPENED : SidebarStatusEnum.CLOSED;
  }

  // 关闭侧边栏
  function closeSideBar() {
    sidebar.opened = false;
    sidebarStatus.value = SidebarStatusEnum.CLOSED;
  }

  // 打开侧边栏
  function openSideBar() {
    sidebar.opened = true;
    sidebarStatus.value = SidebarStatusEnum.OPENED;
  }

   /**
   * 改变布局大小
   *
   * @param val 布局大小 default | small | large
   */
  function changeSize(val: string) {
    size.value = val;
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
    size,
    changeSize,
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
