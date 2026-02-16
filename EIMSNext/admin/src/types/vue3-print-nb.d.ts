// src/types/vue3-print-nb.d.ts
declare module "vue3-print-nb" {
  import type { Plugin } from "vue";
  // 定义打印指令的配置项类型（可选，补充后使用时会有类型提示）
  export interface PrintOptions {
    id?: string;
    popTitle?: string;
    extraCss?: string | string[];
    extraHead?: string | string[];
    beforeOpenCallback?: () => void;
    openCallback?: () => void;
    closeCallback?: () => void;
    clickMounted?: () => void;
  }

  // 声明插件本身是 Vue 插件类型
  const printPlugin: Plugin;
  export default printPlugin;

  // 扩展 Vue 的全局指令类型，让 v-print 有类型提示
  declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
      vPrint: (options: string | PrintOptions) => void;
    }
  }
}
